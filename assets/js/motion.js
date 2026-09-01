/* ============================================================
   MOTION — one animation runtime for the whole page

   Every animation on the site goes through Motion so that
   durations and easings come from one place and cannot drift
   apart. Motion is loaded from a CDN, which means it can fail;
   every caller must therefore treat it as optional and still
   produce a correct, readable page without it.
   ============================================================ */

const MOTION_URL = 'https://cdn.jsdelivr.net/npm/motion@13.1.1/+esm';

/* If the CDN is slow, the page should stop waiting and show
   itself rather than hold content back indefinitely. */
const LOAD_TIMEOUT_MS = 2500;

export const prefersReducedMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Shared timing, in seconds. Every value here is the same
   number as the matching token in tokens.css — a JS reveal and
   a CSS hover are the same system, so they cannot be allowed to
   drift to values that merely look similar. Change one and
   change the other. */
export const EASE_OUT = [0.16, 1, 0.3, 1];       /* --ease-out */
export const DURATION = {
  fast: 0.14,   /* --dur-fast: 140ms */
  mid: 0.22,    /* --dur-mid:  220ms */
  slow: 0.42    /* --dur-slow: 420ms */
};

let pending = null;

/**
 * Resolves with the Motion module, or null if it is unavailable.
 * Never rejects: callers branch on null rather than catching.
 */
export function loadMotion() {
  if (prefersReducedMotion) return Promise.resolve(null);
  if (pending) return pending;

  const timeout = new Promise((resolve) => {
    window.setTimeout(() => resolve(null), LOAD_TIMEOUT_MS);
  });

  pending = Promise.race([import(MOTION_URL), timeout])
    .then((mod) => {
      if (!mod) console.warn('[motion] load timed out; animations disabled');
      return mod || null;
    })
    .catch((error) => {
      console.warn('[motion] failed to load; animations disabled:', error);
      return null;
    });

  return pending;
}
