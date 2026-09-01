/* ============================================================
   CONTRIBUTIONS — the GitHub commit heatmap

   A third-party feed, so every field is treated as untrusted
   and every failure path says something useful in the
   interface rather than rendering an empty chart.
   ============================================================ */

const FEED_URL = 'https://github-contributions-api.jogruber.de/v4/willwang0202?y=last';
const DAYS_PER_WEEK = 7;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const ICON_OK = '#i-activity';
const ICON_ERROR = '#i-alert';

/* ── Feed shaping ───────────────────────────────────────────── */

/* Keeps only well-formed day records, so one malformed entry
   cannot break the whole render. */
function parseDays(payload) {
  if (!payload || !Array.isArray(payload.contributions)) return [];

  return payload.contributions.filter((day) =>
    day &&
    typeof day.date === 'string' &&
    Number.isFinite(day.count) &&
    Number.isFinite(day.level));
}

function currentStreak(days) {
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count <= 0) break;
    streak++;
  }
  return streak;
}

function peakCount(days) {
  return days.reduce((max, day) => (day.count > max ? day.count : max), 0);
}

function totalCount(days) {
  return days.reduce((sum, day) => sum + day.count, 0);
}

/* Pads the first partial week with nulls so weekdays line up
   in rows down every column. */
function groupIntoWeeks(days) {
  const firstDate = new Date(`${days[0].date}T00:00:00`);
  const padding = new Array(firstDate.getDay()).fill(null);
  const cells = padding.concat(days);

  const weeks = [];
  for (let start = 0; start < cells.length; start += DAYS_PER_WEEK) {
    weeks.push(cells.slice(start, start + DAYS_PER_WEEK));
  }
  return weeks;
}

/* ── Render ─────────────────────────────────────────────────── */

function buildDayCell(day) {
  const cell = document.createElement('div');
  cell.className = 'day';

  if (!day) {
    cell.style.visibility = 'hidden';
    return cell;
  }

  cell.setAttribute('data-level', day.level);

  const date = new Date(`${day.date}T00:00:00`);
  const noun = day.count === 1 ? 'commit' : 'commits';

  const tip = document.createElement('span');
  tip.className = 'day-tip';
  tip.textContent = `${day.count} ${noun} · ${MONTHS[date.getMonth()]} ${date.getDate()}`;
  cell.appendChild(tip);

  return cell;
}

/* A month is labelled above the first column that *starts*
   inside it — that is, whose first real day falls on the 1st
   to the 7th. Since columns advance a week at a time, exactly
   one column per month qualifies.

   Labelling on any month change instead would also label the
   leading partial column, putting two labels one 15px column
   apart and printing them on top of each other. */
function renderMonthLabels(monthsEl, weeks) {
  const fragment = document.createDocumentFragment();
  let lastMonth = -1;

  weeks.forEach((week) => {
    const firstReal = week.find((day) => day !== null);
    const label = document.createElement('span');

    if (firstReal) {
      const date = new Date(`${firstReal.date}T00:00:00`);
      const month = date.getMonth();

      if (month !== lastMonth && date.getDate() <= DAYS_PER_WEEK) {
        label.textContent = MONTHS[month];
        lastMonth = month;
      }
    }
    fragment.appendChild(label);
  });

  monthsEl.replaceChildren(fragment);
}

function renderGrid(gridEl, weeks) {
  const fragment = document.createDocumentFragment();

  weeks.forEach((week) => {
    const column = document.createElement('div');
    column.className = 'chart-week';
    week.forEach((day) => column.appendChild(buildDayCell(day)));
    fragment.appendChild(column);
  });

  gridEl.replaceChildren(fragment);
}

/* ── Entry point ────────────────────────────────────────────── */

export function initContributions() {
  const gridEl = document.getElementById('chart-grid');
  const monthsEl = document.getElementById('chart-months');
  const noteEl = document.getElementById('chart-note');
  if (!gridEl || !monthsEl || !noteEl) return;

  const noteTextEl = noteEl.querySelector('[data-note-text]');
  const noteIconEl = noteEl.querySelector('use');
  const totalEl = document.getElementById('stat-total');
  const streakEl = document.getElementById('stat-streak');
  const peakEl = document.getElementById('stat-peak');

  function setNote(message, state) {
    if (noteTextEl) noteTextEl.textContent = message;

    if (state) {
      noteEl.setAttribute('data-state', state);
    } else {
      noteEl.removeAttribute('data-state');
    }

    if (noteIconEl) {
      noteIconEl.setAttribute('href', state === 'error' ? ICON_ERROR : ICON_OK);
    }
  }

  function renderStats(days) {
    /* No thousands separator: the stat is set in a monospace
       face, where a comma takes a full character cell and
       "1,418" reads as though it had a space in it. */
    if (totalEl) totalEl.textContent = String(totalCount(days));
    if (streakEl) streakEl.textContent = `${currentStreak(days)}d`;
    if (peakEl) peakEl.textContent = String(peakCount(days));
  }

  function renderFailure() {
    [totalEl, streakEl, peakEl].forEach((el) => {
      if (el) el.textContent = '—';
    });
    setNote('No signal from the contribution feed — the chart is unavailable right now', 'error');
  }

  fetch(FEED_URL)
    .then((response) => {
      if (!response.ok) throw new Error(`Feed responded ${response.status}`);
      return response.json();
    })
    .then((payload) => {
      const days = parseDays(payload);
      if (!days.length) throw new Error('Feed returned no usable days');

      const weeks = groupIntoWeeks(days);
      renderMonthLabels(monthsEl, weeks);
      renderGrid(gridEl, weeks);
      renderStats(days);
      setNote('Live from the GitHub contribution feed — hover a cell for its day');
    })
    .catch((error) => {
      renderFailure();
      console.error('[contributions] feed failed:', error);
    });
}
