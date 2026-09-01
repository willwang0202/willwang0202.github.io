/* ============================================================
   REVEAL — scroll-in animation

   Elements marked [data-reveal] rise and fade as they enter.
   A [data-reveal-group] releases its own children in order, so
   a grid seats row by row instead of each card firing on its
   own threshold.

   The hidden state is owned here, not by the stylesheet: CSS
   only hides while the .js gate is up, and this module takes
   that gate down the moment it runs. If the module never runs,
   an inline failsafe in index.html lowers it instead. Content
   is never permanently hidden by a script that did not load.
   ============================================================ */

import { loadMotion, prefersReducedMotion, EASE_OUT, DURATION } from './motion.js';

const RISE_PX = 14;
const STAGGER_S = 0.06;

/* Fire slightly before the element is fully on screen, so the
   animation is finishing as the reader arrives at it. */
const ENTER_MARGIN = '0px 0px -12% 0px';

function hide(el) {
  el.style.opacity = '0';
  el.style.transform = `translateY(${RISE_PX}px)`;
  el.style.willChange = 'opacity, transform';
}

function show(el) {
  el.style.opacity = '';
  el.style.transform = '';
  el.style.willChange = '';
}

/* A group's children animate as one batch; a lone element is a
   batch of one. Collecting them this way means there is only
   one code path below. */
function collectBatches(root) {
  const groups = Array.from(root.querySelectorAll('[data-reveal-group]'));

  const grouped = groups.map((group) => ({
    trigger: group,
    items: Array.from(group.querySelectorAll('[data-reveal]'))
  }));

  const solo = Array.from(root.querySelectorAll('[data-reveal]'))
    .filter((el) => !el.closest('[data-reveal-group]'))
    .map((el) => ({ trigger: el, items: [el] }));

  return grouped.concat(solo).filter((batch) => batch.items.length > 0);
}

export function initReveal(root = document) {
  const batches = collectBatches(root);

  /* Take the CSS gate down first. From here the inline styles
     set by hide() are the only thing holding anything back. */
  function release() {
    document.documentElement.classList.add('reveal-ready');
  }

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    release();
    return;
  }

  batches.forEach((batch) => batch.items.forEach(hide));
  release();

  loadMotion().then((motion) => {
    if (!motion) {
      batches.forEach((batch) => batch.items.forEach(show));
      return;
    }

    const { animate, inView, stagger } = motion;

    batches.forEach(({ trigger, items }) => {
      /* inView re-fires whenever the element re-enters. A
         reveal that replayed on every scroll-back would be
         motion for its own sake, so each batch runs once. */
      let revealed = false;

      inView(
        trigger,
        () => {
          if (revealed) return;
          revealed = true;

          animate(
            items,
            { opacity: [0, 1], y: [RISE_PX, 0] },
            {
              duration: DURATION.mid,
              ease: EASE_OUT,
              delay: items.length > 1 ? stagger(STAGGER_S) : 0
            }
          ).then(() => items.forEach(show));
        },
        { margin: ENTER_MARGIN, amount: 'some' }
      );
    });
  });
}
