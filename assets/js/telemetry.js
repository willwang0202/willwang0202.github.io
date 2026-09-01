/* ============================================================
   COMMIT TELEMETRY — GitHub contribution graph
   Third-party feed, so every field is treated as untrusted and
   every failure path says something useful in the interface.
   ============================================================ */

(function () {
  'use strict';

  var FEED_URL = 'https://github-contributions-api.jogruber.de/v4/willwang0202?y=last';
  var DAYS_PER_WEEK = 7;
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  var graphEl = document.getElementById('tlm-graph');
  var monthsEl = document.getElementById('tlm-months');
  var noteEl = document.getElementById('tlm-note');
  var totalEl = document.getElementById('tlm-total');
  var streakEl = document.getElementById('tlm-streak');
  var peakEl = document.getElementById('tlm-peak');

  if (!graphEl || !monthsEl || !noteEl) return;

  function setNote(message, state) {
    noteEl.textContent = message;
    if (state) {
      noteEl.setAttribute('data-state', state);
    } else {
      noteEl.removeAttribute('data-state');
    }
  }

  /* Keeps only well-formed day records so one bad entry cannot
     break the render. */
  function parseDays(payload) {
    if (!payload || !Array.isArray(payload.contributions)) return [];
    return payload.contributions.filter(function (day) {
      return day
        && typeof day.date === 'string'
        && Number.isFinite(day.count)
        && Number.isFinite(day.level);
    });
  }

  function currentStreak(days) {
    var streak = 0;
    for (var i = days.length - 1; i >= 0; i--) {
      if (days[i].count <= 0) break;
      streak++;
    }
    return streak;
  }

  function peakCount(days) {
    return days.reduce(function (max, day) {
      return day.count > max ? day.count : max;
    }, 0);
  }

  /* Pads the first partial week so weekdays line up in rows. */
  function groupIntoWeeks(days) {
    var firstDate = new Date(days[0].date + 'T00:00:00');
    var cells = [];
    var padding = firstDate.getDay();

    for (var i = 0; i < padding; i++) cells.push(null);
    cells = cells.concat(days);

    var weeks = [];
    for (var start = 0; start < cells.length; start += DAYS_PER_WEEK) {
      weeks.push(cells.slice(start, start + DAYS_PER_WEEK));
    }
    return weeks;
  }

  function buildDayCell(day) {
    var cell = document.createElement('div');
    cell.className = 'day';

    if (!day) {
      cell.style.visibility = 'hidden';
      return cell;
    }

    cell.setAttribute('data-level', day.level);

    var date = new Date(day.date + 'T00:00:00');
    var tip = document.createElement('span');
    tip.className = 'day-tip';
    tip.textContent = day.count + (day.count === 1 ? ' commit on ' : ' commits on ')
      + MONTHS[date.getMonth()] + ' ' + date.getDate();
    cell.appendChild(tip);

    return cell;
  }

  function renderMonthLabels(weeks) {
    var fragment = document.createDocumentFragment();
    var lastMonth = -1;

    weeks.forEach(function (week) {
      var firstReal = week.find(function (day) { return day !== null; });
      var label = document.createElement('span');

      if (firstReal) {
        var month = new Date(firstReal.date + 'T00:00:00').getMonth();
        if (month !== lastMonth) {
          label.textContent = MONTHS[month];
          lastMonth = month;
        }
      }
      fragment.appendChild(label);
    });

    monthsEl.replaceChildren(fragment);
  }

  function renderGraph(weeks) {
    var fragment = document.createDocumentFragment();

    weeks.forEach(function (week) {
      var column = document.createElement('div');
      column.className = 'week';
      week.forEach(function (day) { column.appendChild(buildDayCell(day)); });
      fragment.appendChild(column);
    });

    graphEl.replaceChildren(fragment);
  }

  function render(days) {
    var weeks = groupIntoWeeks(days);
    renderMonthLabels(weeks);
    renderGraph(weeks);

    if (totalEl) totalEl.textContent = days.reduce(function (sum, d) { return sum + d.count; }, 0).toLocaleString();
    if (streakEl) streakEl.textContent = currentStreak(days) + 'd';
    if (peakEl) peakEl.textContent = peakCount(days);

    setNote('Live from the GitHub contribution feed · hover a cell for its day');
  }

  fetch(FEED_URL)
    .then(function (response) {
      if (!response.ok) throw new Error('Feed responded ' + response.status);
      return response.json();
    })
    .then(function (payload) {
      var days = parseDays(payload);
      if (!days.length) throw new Error('Feed returned no usable days');
      render(days);
    })
    .catch(function (error) {
      setNote('No signal from the contribution feed · the chart is unavailable right now', 'error');
      if (totalEl) totalEl.textContent = '--';
      if (streakEl) streakEl.textContent = '--';
      if (peakEl) peakEl.textContent = '--';
      console.error('[telemetry] contribution feed failed:', error);
    });
})();
