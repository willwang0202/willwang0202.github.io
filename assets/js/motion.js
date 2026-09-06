/* One local Anime.js runtime, with a shared preference and cleanup lifecycle. */
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const STORAGE_KEY = 'cw-motion-paused';
const listeners = new Set();
const active = new Set();
let paused = false;
let pending;

try { paused = localStorage.getItem(STORAGE_KEY) === 'true'; } catch { /* Storage is optional. */ }

export const EASE_OUT = 'out(4)';
export const DURATION = { fast: 140, mid: 280, slow: 620 };
export const motionEnabled = () => !reducedMotion.matches && !paused;

export function onMotionChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function track(animation) {
  active.add(animation);
  animation.then(() => active.delete(animation));
  for (const method of ['cancel', 'revert']) {
    const original = animation[method].bind(animation);
    animation[method] = (...args) => { active.delete(animation); return original(...args); };
  }
  return animation;
}

function syncPreference() {
  const enabled = motionEnabled();
  document.documentElement.dataset.motion = enabled ? 'on' : 'off';
  if (!enabled) {
    // Settle to the real final values, including text counters, before releasing styles.
    for (const animation of active) {
      animation.seek(animation.duration);
      animation.cancel();
    }
    active.clear();
    document.documentElement.classList.remove('intro-pending');
    document.documentElement.classList.add('reveal-ready');
  }
  listeners.forEach((listener) => listener(enabled));
}

export function initMotionPreferences() {
  const toggle = document.querySelector('[data-motion-toggle]');
  const replay = document.querySelector('[data-intro-replay]');
  function reflect() {
    if (toggle) {
      toggle.hidden = false;
      toggle.disabled = reducedMotion.matches;
      toggle.textContent = reducedMotion.matches ? 'Reduced motion' : motionEnabled() ? 'Motion on' : 'Motion off';
      toggle.setAttribute('aria-pressed', String(!motionEnabled()));
      toggle.setAttribute('aria-label', reducedMotion.matches ? 'Reduced motion enabled in system settings' : motionEnabled() ? 'Pause animations' : 'Enable animations');
    }
    if (replay) replay.hidden = !motionEnabled();
  }
  toggle?.addEventListener('click', () => {
    paused = !paused;
    try { localStorage.setItem(STORAGE_KEY, String(paused)); } catch { /* Still works for this visit. */ }
    syncPreference();
  });
  onMotionChange(reflect);
  reducedMotion.addEventListener('change', syncPreference);
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      paused = event.newValue === 'true';
      syncPreference();
    }
  });
  syncPreference();
}

/** A failed or slow enhancement must never hold the portfolio back. */
export function loadAnime() {
  if (!motionEnabled()) return Promise.resolve(null);
  if (!pending) {
    let timer;
    pending = Promise.race([
      import('./vendor/anime-4.5.0.esm.min.js'),
      new Promise((resolve) => { timer = setTimeout(() => resolve(null), 1400); })
    ]).then((api) => api ? {
      ...api,
      animate: (...args) => track(api.animate(...args)),
      createTimeline: (...args) => track(api.createTimeline(...args))
    } : null).catch(() => null).finally(() => clearTimeout(timer));
  }
  return pending.then((api) => motionEnabled() ? api : null);
}

/** Run once when content reaches the viewport; never hijack scrolling. */
export function onEnterOnce(element, enter, options = {}) {
  if (!motionEnabled()) return () => {};
  if (!('IntersectionObserver' in window)) { enter(); return () => {}; }
  let stopPreference = () => {};
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      observer.disconnect();
      stopPreference();
      if (motionEnabled()) enter();
    }
  }, { rootMargin: '0px 0px -5% 0px', threshold: 0.1, ...options });
  const stop = () => { observer.disconnect(); stopPreference(); };
  stopPreference = onMotionChange((enabled) => { if (!enabled) stop(); });
  observer.observe(element);
  return stop;
}
