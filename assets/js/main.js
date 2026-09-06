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
import { initSpans } from './spans.js';
import { initNav } from './nav.js';
import { initMotionPreferences } from './motion.js';
import { initIntro } from './intro.js';
import { initInteractions } from './interactions.js';
import { initGlobeSpin } from './globe.js';

/* Reveal runs first: it owns the visibility gate set in the
   document head, and nothing should stay hidden while a slower
   module initialises. */
initMotionPreferences();
initReveal();
initIntro();
initInteractions();
initGlobeSpin();
initNav();
initClock();
initProgress();
initCounters();
initSpans();
initContributions();
