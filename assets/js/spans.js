/* ============================================================
   SPANS — builds the experience duration chart

   The chart is derived from the timeline entries rather than
   written out beside them, so there is one source of truth for
   what the roles are and when they ran. Adding an entry to the
   markup adds a bar; changing a date moves it. The two can
   never disagree because there is only one of them.
   ============================================================ */

import { loadMotion, EASE_OUT, DURATION } from './motion.js';

const PERCENT = 100;
const MS_PER_DAY = 86400000;

/* A domain shorter than a day would make every bar either
   invisible or full width, which is a sign the dates are wrong
   rather than something to render. */
const MIN_DOMAIN_MS = MS_PER_DAY;

/* Clearance a year label needs from the "now" label before it
   is dropped. Today lands wherever it lands, so on a narrow
   screen it will sometimes sit on top of a year — and of the
   two, today is the reading worth keeping. */
const MIN_LABEL_GAP_PX = 6;

/* ── Reading the entries ────────────────────────────────────── */

/* An entry without a usable pair of dates is dropped rather
   than guessed at: a bar in the wrong place is worse than no
   bar, because it still looks like a measurement. */
function readEntry(entry, now) {
  const start = Date.parse(entry.dataset.start);
  const isOpen = entry.dataset.end === 'present';
  const end = isOpen ? now : Date.parse(entry.dataset.end);

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    console.warn('[spans] entry skipped — needs a valid data-start and data-end:', entry);
    return null;
  }

  const nameEl = entry.querySelector('.entry-role');
  const datesEl = entry.querySelector('.entry-date');

  return {
    name: nameEl ? nameEl.textContent.trim() : '',
    dates: datesEl ? datesEl.textContent.trim() : '',
    start,
    end,
    isOpen
  };
}

/* ── Geometry ───────────────────────────────────────────────── */

function domainOf(spans) {
  return {
    from: Math.min(...spans.map((span) => span.start)),
    to: Math.max(...spans.map((span) => span.end))
  };
}

function positionIn(domain, time) {
  return ((time - domain.from) / (domain.to - domain.from)) * PERCENT;
}

/* Jan 1 of every year the domain actually crosses. Derived from
   the domain rather than hard-coded, so the axis stays right
   when the dates move. */
function yearTicks(domain) {
  const firstYear = new Date(domain.from).getFullYear() + 1;
  const lastYear = new Date(domain.to).getFullYear();

  const ticks = [];
  for (let year = firstYear; year <= lastYear; year++) {
    const time = new Date(year, 0, 1).getTime();
    if (time > domain.from && time < domain.to) ticks.push({ year, time });
  }
  return ticks;
}

/* ── Render ─────────────────────────────────────────────────── */

function buildRow(span, domain, now) {
  const row = document.createElement('div');
  row.className = 'span-row';

  const line = document.createElement('div');
  line.className = 'span-line';

  const name = document.createElement('span');
  name.className = 'span-name';
  name.textContent = span.name;

  const dates = document.createElement('span');
  dates.className = 'span-dates';
  dates.textContent = span.dates;

  line.append(name, dates);

  const rail = document.createElement('div');
  rail.className = 'span-rail';

  const meter = document.createElement('div');
  meter.className = 'meter';
  meter.style.insetInlineStart = `${positionIn(domain, span.start)}%`;
  meter.style.inlineSize = `${positionIn(domain, span.end) - positionIn(domain, span.start)}%`;

  /* The fill is the part that has already happened. For a role
     that ended, that is all of it; for the degree, it stops at
     today and the rest of the track stands for the part still
     scheduled. */
  const elapsed = Math.min(span.end, now);
  const fraction = (elapsed - span.start) / (span.end - span.start);

  const fill = document.createElement('span');
  fill.className = 'meter-fill';
  fill.style.width = `${Math.min(1, Math.max(0, fraction)) * PERCENT}%`;
  meter.appendChild(fill);

  rail.appendChild(meter);

  if (span.isOpen) {
    const dot = document.createElement('span');
    dot.className = 'dot span-open';
    dot.style.insetInlineStart = `${positionIn(domain, span.end)}%`;
    rail.appendChild(dot);
  }

  row.append(line, rail);
  return { row, fill, width: fill.style.width };
}

function buildGrid(ticks, domain, now) {
  const grid = document.createElement('div');
  grid.className = 'spans-grid';

  ticks.forEach((tick) => {
    const line = document.createElement('span');
    line.className = 'spans-tick';
    line.style.insetInlineStart = `${positionIn(domain, tick.time)}%`;
    grid.appendChild(line);
  });

  const nowLine = document.createElement('span');
  nowLine.className = 'spans-tick';
  nowLine.setAttribute('data-now', '');
  nowLine.style.insetInlineStart = `${positionIn(domain, now)}%`;
  grid.appendChild(nowLine);

  return grid;
}

function buildAxis(ticks, domain, now) {
  const axis = document.createElement('div');
  axis.className = 'spans-axis';

  ticks.forEach((tick) => {
    const label = document.createElement('span');
    label.style.insetInlineStart = `${positionIn(domain, tick.time)}%`;
    label.textContent = `'${String(tick.year).slice(2)}`;
    axis.appendChild(label);
  });

  const nowLabel = document.createElement('span');
  nowLabel.setAttribute('data-now', '');
  nowLabel.style.insetInlineStart = `${positionIn(domain, now)}%`;
  nowLabel.textContent = 'NOW';
  axis.appendChild(nowLabel);

  return axis;
}

/* Drops any year label that has run into the "now" label. The
   collision is measured rather than guessed at a breakpoint,
   because where today falls on the axis depends on the dates,
   not on the viewport — a threshold that worked this year would
   quietly stop working next year.

   Only the label goes; the year's gridline stays, so the axis
   still divides into years and only the redundant name of one
   of them is lost. */
function fitAxis(axis) {
  const nowLabel = axis.querySelector('[data-now]');
  if (!nowLabel) return;

  const years = Array.from(axis.querySelectorAll('span:not([data-now])'));
  years.forEach((year) => { year.hidden = false; });

  const nowBox = nowLabel.getBoundingClientRect();
  if (!nowBox.width) return;

  years.forEach((year) => {
    const box = year.getBoundingClientRect();
    const clearance = Math.max(nowBox.left, box.left) - Math.min(nowBox.right, box.right);
    if (clearance < MIN_LABEL_GAP_PX) year.hidden = true;
  });
}

/* ── Entry point ────────────────────────────────────────────── */

export function initSpans() {
  const chart = document.getElementById('span-chart');
  if (!chart) return;

  const entries = Array.from(document.querySelectorAll('.entry[data-start]'));
  if (!entries.length) return;

  const now = Date.now();
  const spans = entries.map((entry) => readEntry(entry, now)).filter(Boolean);

  if (!spans.length) {
    console.warn('[spans] no entry carried a usable date range; chart not drawn');
    return;
  }

  const domain = domainOf(spans);

  if (domain.to - domain.from < MIN_DOMAIN_MS) {
    console.warn('[spans] date range too short to chart');
    return;
  }

  const ticks = yearTicks(domain);
  const body = document.createElement('div');
  body.className = 'spans-body';

  body.appendChild(buildGrid(ticks, domain, now));

  const bars = spans.map((span) => {
    const built = buildRow(span, domain, now);
    body.appendChild(built.row);
    return built;
  });

  const axis = buildAxis(ticks, domain, now);
  chart.replaceChildren(body, axis);

  /* Re-checked on resize: which labels collide depends on how
     wide the chart is, and this page is read at every width. */
  fitAxis(axis);

  if ('ResizeObserver' in window) {
    new ResizeObserver(() => fitAxis(axis)).observe(axis);
  }

  /* The panel stays hidden in the markup until there is a chart
     to put in it, so a failure here leaves no empty frame with
     a heading over nothing. */
  const panel = document.getElementById('span-chart-panel');
  if (panel) panel.hidden = false;

  /* Same treatment as the degree meter: the resting width is
     already set inline, so the chart is correct whether or not
     Motion arrives to grow the fills into place. */
  loadMotion().then((motion) => {
    if (!motion) return;

    bars.forEach((bar, index) => {
      motion.animate(
        bar.fill,
        { width: ['0%', bar.width] },
        { duration: DURATION.slow, ease: EASE_OUT, delay: 0.1 + index * 0.06 }
      );
    });
  });
}
