import { loadAnime, motionEnabled, onMotionChange, onEnterOnce, EASE_OUT } from './motion.js';

export async function initReveal(root = document) {
  const items = [...root.querySelectorAll('[data-reveal]')];
  const release = () => {
    document.documentElement.classList.add('reveal-ready');
    items.forEach((item) => { item.style.opacity = ''; item.style.transform = ''; });
  };
  const anime = await loadAnime();
  if (!anime || !motionEnabled()) { release(); return; }

  const hidden = new Set(items);
  items.forEach((item) => { item.style.opacity = '0'; });
  document.documentElement.classList.add('reveal-ready');
  const stopPreference = onMotionChange((enabled) => {
    if (!enabled) { release(); stopPreference(); }
  });
  // Focusing an element always takes precedence over an entrance.
  root.addEventListener('focusin', (event) => {
    const item = event.target.closest('[data-reveal]');
    if (item && hidden.has(item)) { item.style.opacity = '1'; hidden.delete(item); }
  });
  const groups = [...root.querySelectorAll('[data-reveal-group]')];
  const batches = groups.map((group) => ({ trigger: group, items: [...group.querySelectorAll('[data-reveal]')] }));
  items.filter((item) => !item.closest('[data-reveal-group]')).forEach((item) => batches.push({ trigger: item, items: [item] }));
  batches.forEach((batch) => {
    onEnterOnce(batch.trigger, () => {
      const targets = batch.items.filter((item) => hidden.has(item));
      targets.forEach((item) => hidden.delete(item));
      if (!targets.length) return;
      anime.animate(targets, {
        opacity: [0, 1], y: [18, 0], duration: 580,
        delay: anime.stagger(55), ease: EASE_OUT,
        onComplete: () => targets.forEach((item) => { item.style.opacity = ''; item.style.transform = ''; })
      });
    });
  });
}
