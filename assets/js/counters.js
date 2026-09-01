/* ============================================================
   COUNTERS — roll a number up to its value on first view

   The element already contains its final number in the markup,
   so this only replaces the text while the roll is running. A
   reader with no JS, no Motion, or reduced motion set sees the
   correct figure immediately.
   ============================================================ */

import { loadMotion, EASE_OUT, DURATION } from './motion.js';

const COUNTER_SELECTOR = '[data-count]';
const VIEW_AMOUNT = 0.6;

function roll(animate, el) {
  const target = Number(el.dataset.count);
  if (!Number.isFinite(target)) return;

  const suffix = el.dataset.suffix || '';

  animate(0, target, {
    duration: DURATION.slow,
    ease: EASE_OUT,
    onUpdate: (value) => {
      el.textContent = Math.round(value) + suffix;
    }
  });
}

export function initCounters(root = document) {
  const counters = Array.from(root.querySelectorAll(COUNTER_SELECTOR));
  if (!counters.length) return;

  loadMotion().then((motion) => {
    if (!motion) return;

    const { animate, inView } = motion;

    counters.forEach((el) => {
      let rolled = false;

      inView(
        el,
        () => {
          if (rolled) return;
          rolled = true;
          roll(animate, el);
        },
        { amount: VIEW_AMOUNT }
      );
    });
  });
}
