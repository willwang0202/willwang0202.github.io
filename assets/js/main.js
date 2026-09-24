/* Content is visible before JavaScript; each enhancement can fail independently. */
import { initClock, initProgress } from './status.js';
import { initContributions } from './contributions.js';
import { initNav } from './nav.js?v=20260924';

for (const initialize of [initNav, initClock, initProgress, initContributions]) {
  try { initialize(); } catch (error) { console.warn('[profile] Enhancement unavailable:', error); }
}
