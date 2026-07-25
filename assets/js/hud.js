/* ============================================================
   HUD — reveals, live readouts, section tracking
   ============================================================ */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Scroll reveal ─────────────────────────────────────── */

  function initReveals() {
    var targets = document.querySelectorAll('.reveal');
    if (!targets.length) return;

    // Without IntersectionObserver, show everything rather than
    // leaving the page permanently blank.
    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      targets.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* ── Section tracking ──────────────────────────────────────
     Marks the rail entry for whichever section owns the viewport. */

  function initRailTracking() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.rail-nav a'));
    if (!links.length || !('IntersectionObserver' in window)) return;

    var byId = {};
    links.forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      var section = document.getElementById(id);
      if (section) byId[id] = { link: link, section: section };
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var match = byId[entry.target.id];
        if (!match) return;
        if (entry.isIntersecting) {
          links.forEach(function (l) { l.removeAttribute('aria-current'); });
          match.link.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px' });

    Object.keys(byId).forEach(function (id) { observer.observe(byId[id].section); });
  }

  /* ── Local time ────────────────────────────────────────────
     A real datum, not decoration: the clock in the identity
     readout is San Diego time, so the card is genuinely live. */

  function initLocalTime() {
    var el = document.getElementById('local-time');
    if (!el) return;

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
      // Environment lacks the IANA tz database — drop the row's
      // live claim rather than showing a wrong time.
      el.textContent = 'Pacific';
      return;
    }

    function tick() { el.textContent = formatter.format(new Date()); }
    tick();
    window.setInterval(tick, 1000);
  }

  /* ── Hero glitch ───────────────────────────────────────────
     Fires once when the page becomes presentable. Continuous
     glitch reads as broken; a single hit reads as deliberate. */

  function initHeroGlitch() {
    var hero = document.getElementById('hero-name');
    if (!hero || prefersReducedMotion) return;

    hero.classList.add('is-glitching');
    window.setTimeout(function () {
      hero.classList.remove('is-glitching');
    }, 900);
  }

  function onReady() {
    initHeroGlitch();
  }

  /* boot.js may have finished before this file executed, so check
     the flag as well as listening for the event. */
  if (document.documentElement.dataset.bootState === 'done') {
    onReady();
  } else {
    document.addEventListener('hud:ready', onReady, { once: true });
  }

  initReveals();
  initRailTracking();
  initLocalTime();
})();
