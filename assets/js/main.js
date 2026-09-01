/* ============================================================
   MAIN — wiring

   Each module owns one behaviour and degrades on its own, so a
   failure in any one of them cannot take the page down with
   it.
   ============================================================ */

import { initReveal } from './reveal.js';
import { initCounters } from './counters.js';
import { initClock, initProgress } from './status.js';
import { initContributions } from './contributions.js';
import { initNav } from './nav.js';

/* Reveal runs first: it owns the visibility gate set in the
   document head, and nothing should stay hidden while a slower
   module initialises. */
initReveal();
initNav();
initClock();
initProgress();
initCounters();
initContributions();
