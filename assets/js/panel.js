/* ============================================================
   PANEL — live readouts, reveals, section tracking
   The clock and the gauge needle are driven by the same tick,
   so the dial and the display can never disagree.
   ============================================================ */

(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* The gauge scale spans 250 degrees, centred on straight up,
     so the needle travels from -125 to +125. These must match
     the arc drawn in the markup. */
  var SCALE_DEG = 250;
  var SCALE_MIN = -SCALE_DEG / 2;
  var SECONDS_PER_MINUTE = 60;
  var TICK_MS = 1000;

  /* ── Scroll reveal ─────────────────────────────────────────
     A container marked .reveal-stagger releases its children in
     order once it enters, so a grid seats row by row rather
     than each card firing on its own threshold. */

  function initReveals() {
    var targets = document.querySelectorAll('.reveal, .module-head');
    if (!targets.length) return;

    if (!('IntersectionObserver' in window) || reducedMotion) {
      Array.prototype.forEach.call(targets, function (el) { el.classList.add('is-in'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        var el = entry.target;
        el.classList.add('is-in');
        observer.unobserve(el);

        if (!el.classList.contains('reveal-stagger')) return;

        var children = el.querySelectorAll('.reveal');
        Array.prototype.forEach.call(children, function (child, i) {
          child.style.setProperty('--reveal-i', i);
          child.classList.add('is-in');
        });
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

    Array.prototype.forEach.call(targets, function (el) {
      var parent = el.parentElement;
      if (parent && parent.classList.contains('reveal-stagger')) return;
      observer.observe(el);
    });
  }

  /* ── Section tracking ──────────────────────────────────────
     Marks the rail entry owning the middle band of the viewport. */

  function initRailTracking() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.rail-nav a'));
    if (!links.length || !('IntersectionObserver' in window)) return;

    var byId = {};
    links.forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      var section = document.getElementById(id);
      if (section) byId[id] = link;
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = byId[entry.target.id];
        if (!link || !entry.isIntersecting) return;
        links.forEach(function (l) { l.removeAttribute('aria-current'); });
        link.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -45% 0px' });

    Object.keys(byId).forEach(function (id) {
      observer.observe(document.getElementById(id));
    });
  }

  /* ── Clock and needle ──────────────────────────────────────
     San Diego time, because the identity plate claims San Diego.
     A clock showing the visitor's own timezone would be a
     decoration; this one is a fact about where he is.

     The needle reads seconds across the full scale, so the dial
     is a second hand and the well is the digital readout of the
     same instrument. */

  function initClock() {
    var timeEl = document.getElementById('panel-time');
    var needleEl = document.getElementById('panel-needle');
    if (!timeEl && !needleEl) return;

    var formatter;
    try {
      formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'America/Los_Angeles',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch (err) {
      /* Intl without the tz database: state the zone rather than
         showing a wrong time. */
      if (timeEl) timeEl.textContent = 'PACIFIC';
      console.warn('[panel] timezone formatting unavailable:', err);
      return;
    }

    function tick() {
      var now = new Date();
      if (timeEl) timeEl.textContent = formatter.format(now);
      if (needleEl) {
        var fraction = now.getSeconds() / SECONDS_PER_MINUTE;
        needleEl.style.setProperty('--needle-deg', (SCALE_MIN + fraction * SCALE_DEG) + 'deg');
      }
    }

    /* Held until the power-on sweep finishes so the two do not
       fight over the needle. */
    document.addEventListener('panel:ready', function () {
      tick();
      window.setInterval(tick, TICK_MS);
    }, { once: true });
  }

  initReveals();
  initRailTracking();
  initClock();
})();
