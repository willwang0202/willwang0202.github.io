import { loadAnime, onEnterOnce, EASE_OUT, DURATION } from './motion.js';

export async function initCounters(root = document) {
  const anime = await loadAnime();
  if (!anime) return;
  root.querySelectorAll('[data-count]').forEach((element) => {
    const target = Number(element.dataset.count);
    if (!Number.isFinite(target)) return;
    onEnterOnce(element, () => {
      const count = { value: 0 };
      const render = () => { element.textContent = Math.round(count.value) + (element.dataset.suffix || ''); };
      anime.animate(count, {
        value: target, duration: DURATION.slow, ease: EASE_OUT,
        onUpdate: render,
        onComplete: () => { count.value = target; render(); }
      });
    }, { threshold: 0.6 });
  });
}
