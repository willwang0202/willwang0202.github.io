import { loadAnime, motionEnabled, onMotionChange } from './motion.js';

const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const clamp = (value, limit) => Math.max(-limit, Math.min(limit, value));

/** Reusable animatables retarget from their current value on rapid input. */
function bindInteractions(anime) {
  const controller = new AbortController();
  const animatables = [];
  const temporary = new Set();
  const removals = [];
  const pressables = [];
  const on = (target, event, listener, options = {}) => target.addEventListener(event, listener, { ...options, signal: controller.signal });
  const make = (target, params) => {
    const animation = anime.createAnimatable(target, params);
    animatables.push(animation);
    return animation;
  };
  const settle = anime.spring({ duration: 360, bounce: 0.16 });

  document.querySelectorAll('.btn, .hero-social').forEach((button) => {
    let face = button.querySelector('.button-face');
    if (!face) {
      face = document.createElement('span');
      face.className = 'button-face';
      face.append(...button.childNodes);
      button.append(face);
    }
    const move = make(face, { x: 220, y: 220, scale: 220, ease: 'out(3)' });
    let box;
    const reset = () => {
      button.classList.remove('is-pressed');
      move.x(0, 400, settle.ease).y(0, 400, settle.ease).scale(1, 400, settle.ease);
    };
    pressables.push(reset);
    on(button, 'pointerenter', (event) => {
      if (event.pointerType !== 'mouse' || !finePointer.matches) return;
      box = button.getBoundingClientRect();
    });
    on(button, 'pointermove', (event) => {
      if (!box || event.pointerType !== 'mouse' || !finePointer.matches) return;
      move.x(clamp((event.clientX - box.left - box.width / 2) * 0.08, 4));
      move.y(clamp((event.clientY - box.top - box.height / 2) * 0.12, 3));
    });
    on(button, 'pointerleave', () => { box = null; reset(); });
    on(button, 'pointerdown', (event) => {
      if (event.button !== 0) return;
      button.classList.add('is-pressed');
      move.scale(0.94, 90, 'out(3)');
    });
    on(button, 'keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { button.classList.add('is-pressed'); move.scale(0.96, 80); }
    });
    on(button, 'keyup', reset);
    on(button, 'blur', reset);
  });

  document.querySelectorAll('.card--link').forEach((card) => {
    const release = () => card.classList.remove('is-card-pressed');
    pressables.push(release);
    on(card, 'pointerdown', (event) => { if (event.button === 0) card.classList.add('is-card-pressed'); });
    on(card, 'pointerleave', release);
    on(card, 'blur', release);
  });

  let hideReticle = () => {};
  let resetInstrument = () => {};
  if (finePointer.matches) {
    const reticle = document.createElement('div');
    reticle.className = 'cursor-reticle';
    reticle.setAttribute('aria-hidden', 'true');
    document.body.append(reticle);
    removals.push(reticle);
    const cursor = make(reticle, { x: 140, y: 140, scale: 200, opacity: 180, ease: 'out(3)' });
    let visible = false;
    let overLink = false;
    hideReticle = () => {
      cursor.opacity(0, 100).scale(1, 100);
      visible = false;
      overLink = false;
      reticle.classList.remove('is-link');
    };
    on(document, 'pointermove', (event) => {
      if (event.pointerType !== 'mouse') { hideReticle(); return; }
      const duration = visible ? 140 : 0;
      cursor.x(event.clientX, duration).y(event.clientY, duration);
      if (!visible) { cursor.opacity(0.72); visible = true; }
      const link = Boolean(event.target.closest('a, button'));
      if (link !== overLink) {
        overLink = link;
        reticle.classList.toggle('is-link', link);
        cursor.scale(link ? 1.45 : 1, 260);
      }
    }, { passive: true });
    on(document.documentElement, 'pointerleave', hideReticle);
    on(document, 'keydown', hideReticle);
    on(window, 'scroll', hideReticle, { passive: true });
    on(document, 'pointerdown', (event) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      cursor.scale(0.72, 80);
      if (!event.target.closest('a, button') || temporary.size >= 4) return;
      const pulse = document.createElement('span');
      pulse.className = 'click-pulse';
      pulse.setAttribute('aria-hidden', 'true');
      pulse.style.left = `${event.clientX}px`;
      pulse.style.top = `${event.clientY}px`;
      document.body.append(pulse);
      const effect = anime.animate(pulse, {
        scale: [0.6, 2.1], opacity: [0.55, 0], duration: 460, ease: 'out(3)',
        onComplete: () => { pulse.remove(); temporary.delete(effect); }
      });
      temporary.add(effect);
    });
    on(document, 'pointerup', () => cursor.scale(overLink ? 1.45 : 1, 360, settle.ease));

    const hero = document.querySelector('.hero');
    const assembly = document.querySelector('.instrument-assembly');
    if (hero && assembly) {
      const instrument = make(assembly, {
        x: 650, y: 650, rotateX: 650, rotateY: 650, ease: 'out(3)',
        onComplete: () => {
          if (!instrument.x() && !instrument.y() && !instrument.rotateX() && !instrument.rotateY()) assembly.style.transform = '';
        }
      });
      assembly.style.transform = '';
      let box;
      resetInstrument = () => { instrument.x(0).y(0).rotateX(0).rotateY(0); box = null; };
      on(hero, 'pointerenter', () => { box = hero.getBoundingClientRect(); });
      on(hero, 'pointermove', (event) => {
        if (event.pointerType !== 'mouse' || document.documentElement.classList.contains('intro-running')) return;
        box ||= hero.getBoundingClientRect();
        const x = clamp((event.clientX - box.left) / box.width - 0.5, 0.5);
        const y = clamp((event.clientY - box.top) / box.height - 0.5, 0.5);
        instrument.x(x * 14).y(y * 10).rotateX(-y * 7).rotateY(x * 9);
      });
      on(hero, 'pointerleave', resetInstrument);
      on(window, 'scroll', resetInstrument, { passive: true });
      on(window, 'resize', resetInstrument, { passive: true });
    }

    document.querySelectorAll('.card--link').forEach((card) => {
      const edge = document.createElement('span');
      edge.className = 'edge-light';
      edge.setAttribute('aria-hidden', 'true');
      card.append(edge);
      removals.push(edge);
      // Individual translate composes with the section reveal's transform.
      const lift = make(card, { '--card-lift': { unit: 'px', duration: 260 }, ease: 'out(3)' });
      card.classList.add('motion-card');
      let box;
      on(card, 'pointerenter', (event) => {
        if (event.pointerType !== 'mouse') return;
        box = card.getBoundingClientRect();
        lift['--card-lift'](-3);
      });
      on(card, 'pointermove', (event) => {
        if (box) card.style.setProperty('--edge-x', `${event.clientX - box.left}px`);
      });
      on(card, 'pointerleave', () => { box = null; lift['--card-lift'](0, 380, settle.ease); });
      on(card, 'pointerdown', () => lift['--card-lift'](0, 90));
      pressables.push(() => lift['--card-lift'](0));
    });
  }

  const release = () => pressables.forEach((reset) => reset());
  on(window, 'pointerup', release);
  on(window, 'pointercancel', () => { release(); hideReticle(); resetInstrument(); });
  on(window, 'blur', () => { release(); hideReticle(); resetInstrument(); });
  on(document, 'visibilitychange', () => { if (document.hidden) { release(); hideReticle(); resetInstrument(); } });

  return () => {
    controller.abort();
    animatables.forEach((animation) => animation.revert());
    temporary.forEach((animation) => animation.revert());
    removals.forEach((element) => element.remove());
    document.querySelectorAll('.click-pulse').forEach((element) => element.remove());
    document.querySelectorAll('.is-pressed').forEach((element) => element.classList.remove('is-pressed'));
    document.querySelectorAll('.is-card-pressed').forEach((element) => element.classList.remove('is-card-pressed'));
    document.querySelectorAll('.motion-card').forEach((element) => {
      element.classList.remove('motion-card');
      element.style.removeProperty('--edge-x');
    });
  };
}

export function initInteractions() {
  let cleanup;
  let version = 0;
  async function sync() {
    const current = ++version;
    cleanup?.();
    cleanup = null;
    if (!motionEnabled()) return;
    const anime = await loadAnime();
    if (anime && motionEnabled() && current === version) cleanup = bindInteractions(anime);
  }
  onMotionChange(sync);
  finePointer.addEventListener('change', sync);
  window.addEventListener('pagehide', () => { version++; cleanup?.(); cleanup = null; });
  window.addEventListener('pageshow', (event) => { if (event.persisted) sync(); });
  sync();
}
