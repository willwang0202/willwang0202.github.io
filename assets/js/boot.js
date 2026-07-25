/* ============================================================
   BOOT SEQUENCE
   The source material leans on reboot animations, so the page
   keeps one — but short, skippable, and shown once per session.
   The overlay starts hidden in markup, so if this script fails
   the page is simply visible rather than blocked behind it.
   ============================================================ */

(function () {
  'use strict';

  var LINES = [
    { text: 'KIROSHI OPTICS MK.3  //  cold start', tone: 'warn' },
    { text: 'mem_check ....... 128TB neural buffer  OK' },
    { text: 'net_link ........ uplink established   OK' },
    { text: 'optic_cal ....... calibration pass     OK' },
    { text: 'usr/chen-an.wang  credentials verified' },
    { text: 'THREAT LEVEL MINIMAL  //  FIREWALL ACTIVE', tone: 'alert' },
    { text: 'interface ....... render complete' }
  ];

  var LINE_DELAY_MS = 95;
  var HOLD_MS = 260;
  var FADE_MS = 320;
  var SESSION_KEY = 'boot-shown';

  var boot = document.getElementById('boot');
  var linesEl = document.getElementById('boot-lines');
  var fillEl = document.getElementById('boot-fill');

  if (!boot || !linesEl || !fillEl) return;

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // sessionStorage throws in some privacy modes; a failed read just
  // means the sequence plays, which is harmless.
  function hasPlayedThisSession() {
    try {
      return window.sessionStorage.getItem(SESSION_KEY) === '1';
    } catch (err) {
      return false;
    }
  }

  function markPlayed() {
    try {
      window.sessionStorage.setItem(SESSION_KEY, '1');
    } catch (err) {
      /* Storage unavailable — the sequence simply replays next visit. */
    }
  }

  if (prefersReducedMotion || hasPlayedThisSession()) {
    announceReady();
    return;
  }

  boot.hidden = false;
  markPlayed();

  var lineEls = LINES.map(function (line) {
    var el = document.createElement('p');
    el.className = 'boot-line';
    el.textContent = line.text;
    if (line.tone) el.setAttribute('data-tone', line.tone);
    linesEl.appendChild(el);
    return el;
  });

  var index = 0;
  var timer = null;
  var finished = false;

  function step() {
    if (index >= lineEls.length) {
      timer = window.setTimeout(finish, HOLD_MS);
      return;
    }
    lineEls[index].classList.add('is-on');
    index++;
    fillEl.style.width = (index / lineEls.length) * 100 + '%';
    timer = window.setTimeout(step, LINE_DELAY_MS);
  }

  function finish() {
    if (finished) return;
    finished = true;
    window.clearTimeout(timer);
    boot.classList.add('is-done');
    window.setTimeout(function () {
      boot.hidden = true;
      announceReady();
    }, FADE_MS);
    document.removeEventListener('keydown', finish);
    boot.removeEventListener('click', finish);
  }

  document.addEventListener('keydown', finish);
  boot.addEventListener('click', finish);

  step();

  /* Signals the rest of the HUD that the page is presentable. The
     flag matters as much as the event: on the skip paths this runs
     before hud.js has executed, so there is no listener yet. */
  function announceReady() {
    document.documentElement.dataset.bootState = 'done';
    document.dispatchEvent(new CustomEvent('hud:ready'));
  }
})();
