/* ============================================================
   POWER-ON — the load sequence
   What an instrument does when it is switched on: the needle
   drives to full scale, hangs, and falls back to its true
   reading; the counters roll up to their values.

   It runs once, takes about a second, and blocks nothing —
   every value it animates is already correct in the markup, so
   a visitor who never sees the sequence loses nothing.
   ============================================================ */

(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var FULL_SCALE_DEG = 125;
  var SWEEP_HOLD_MS = 620;
  var ROLL_MS = 900;
  var PERCENT = 100;

  function announceReady() {
    document.dispatchEvent(new CustomEvent('panel:ready'));
  }

  /* ── Needle sweep ──────────────────────────────────────────
     Drive to full scale, hold, then release the needle to the
     clock, which owns it from that point on. */

  function sweepNeedle() {
    var needle = document.getElementById('panel-needle');
    if (!needle) {
      announceReady();
      return;
    }

    needle.style.setProperty('--needle-deg', FULL_SCALE_DEG + 'deg');
    window.setTimeout(announceReady, SWEEP_HOLD_MS);
  }

  /* ── Degree progress ───────────────────────────────────────
     The fader reads elapsed fraction of the degree. A real
     quantity: start and end dates come from the markup, and the
     value is recomputed on every load rather than hard-coded. */

  function initFader() {
    var fader = document.getElementById('panel-fader');
    if (!fader) return;

    var start = Date.parse(fader.dataset.start);
    var end = Date.parse(fader.dataset.end);
    var valueEl = document.getElementById('panel-fader-val');

    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      console.warn('[powerup] fader needs a valid start and end date');
      return;
    }

    var elapsed = (Date.now() - start) / (end - start);
    var fraction = Math.min(1, Math.max(0, elapsed));
    var percent = Math.round(fraction * PERCENT);

    if (valueEl) valueEl.textContent = percent + '%';

    /* Set on the next frame so the transition has a starting
       value to move from. */
    window.requestAnimationFrame(function () {
      fader.style.setProperty('--fader-pct', percent + '%');
    });
  }

  /* ── Counter roll ──────────────────────────────────────────
     Counts to the value in data-count. The element already
     contains the final number, so this only replaces it while
     the roll is running. */

  function rollCounter(el) {
    var target = Number(el.dataset.count);
    if (!Number.isFinite(target)) return;

    var suffix = el.dataset.suffix || '';
    var startedAt = null;

    function frame(now) {
      if (startedAt === null) startedAt = now;

      var progress = Math.min(1, (now - startedAt) / ROLL_MS);
      /* Ease out so the last digits settle rather than snap. */
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;

      if (progress < 1) window.requestAnimationFrame(frame);
    }

    window.requestAnimationFrame(frame);
  }

  function initCounters() {
    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(counters, rollCounter);
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        rollCounter(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    Array.prototype.forEach.call(counters, function (el) { observer.observe(el); });
  }

  if (reducedMotion) {
    announceReady();
    initFader();
    return;
  }

  sweepNeedle();
  initFader();
  initCounters();
})();
