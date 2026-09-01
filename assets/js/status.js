/* ============================================================
   STATUS CARD — the live clock and the degree progress bar

   Both values are facts rather than decoration. The clock says
   what time it is where he actually is, which is what a reader
   needs before deciding whether to email; the bar is computed
   from the two dates in the markup, so it cannot go stale.
   ============================================================ */

import { loadMotion, EASE_OUT, DURATION } from './motion.js';

const TIME_ZONE = 'America/Los_Angeles';

/* Minute resolution: knowing his local time to the second
   serves no purpose. Re-reading every 15s keeps the displayed
   minute from ever being visibly wrong. */
const TICK_MS = 15000;

const PERCENT = 100;

/* ── Clock ──────────────────────────────────────────────────── */

function buildFormatter() {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: TIME_ZONE,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZoneName: 'short'
    });
  } catch (error) {
    /* An engine without the tz database would otherwise print
       the visitor's own time under a "San Diego" label, which
       is worse than printing nothing. */
    console.warn('[status] timezone formatting unavailable:', error);
    return null;
  }
}

export function initClock() {
  const el = document.getElementById('local-time');
  if (!el) return;

  const formatter = buildFormatter();
  if (!formatter) {
    el.textContent = 'Pacific';
    return;
  }

  const tick = () => { el.textContent = formatter.format(new Date()); };

  tick();
  window.setInterval(tick, TICK_MS);
}

/* ── Degree progress ────────────────────────────────────────── */

export function initProgress() {
  const track = document.querySelector('[data-progress]');
  if (!track) return;

  const fill = track.querySelector('.meter-fill');
  const valueEl = document.getElementById('progress-value');
  if (!fill) return;

  const start = Date.parse(track.dataset.start);
  const end = Date.parse(track.dataset.end);

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    console.warn('[status] progress bar needs a valid start and end date');
    return;
  }

  const elapsed = (Date.now() - start) / (end - start);
  const fraction = Math.min(1, Math.max(0, elapsed));
  const percent = Math.round(fraction * PERCENT);

  if (valueEl) valueEl.textContent = `${percent}%`;
  track.setAttribute('aria-valuenow', String(percent));

  /* The resting width is set as an inline style up front, so
     the bar is correct whether or not Motion ever arrives to
     animate it there. */
  fill.style.width = `${percent}%`;

  loadMotion().then((motion) => {
    if (!motion) return;

    motion.animate(
      fill,
      { width: ['0%', `${percent}%`] },
      { duration: DURATION.slow, ease: EASE_OUT, delay: 0.2 }
    );
  });
}
