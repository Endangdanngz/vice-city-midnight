// view-checklist.js — the tracker's home view: the dashboard (big earned
// count, percentage, per-grade and per-kind bars, the Platinum line), the
// filter toolbar, and the 55-row checklist itself.

import { GRADE_ORDER, KIND_LABELS, KIND_ORDER } from './data.js';
import { append, clear, el, formatCount, percent, progressBar } from './dom.js';
import { applyFilters, displayDescription, displayName } from './filters.js';
import { counterOf, isEarned } from './store.js';

export function gradeChip(trophy) {
  return el('span', 'chip grade-' + trophy.grade, trophy.grade);
}

export function renderDashboard(root, stats) {
  clear(root);
  const big = el('div', 'dash-count');
  append(big, el('span', 'dash-num', String(stats.earnedCount)), el('span', 'dash-of', ' / ' + stats.total));
  const head = el('div', 'dash-head');
  append(
    head,
    big,
    el('div', 'dash-pct', percent(stats.earnedCount, stats.total) + '% earned'),
  );
  root.append(head);
  root.append(progressBar(stats.earnedCount, stats.total, 'bar-main'));

  const plat = el('div', 'dash-platinum' + (stats.platinum.earned ? ' is-earned' : ''));
  append(
    plat,
    el('span', 'plat-star', stats.platinum.earned ? '★' : '☆'),
    el(
      'span',
      'plat-text',
      stats.platinum.earned
        ? 'Vice Got a Price! — Platinum earned. You are a Leonida Legend.'
        : 'Platinum: ' + stats.platinum.othersEarned + ' of ' + stats.platinum.othersTotal +
            ' other trophies — Vice Got a Price! lights up automatically at 54 of 54.',
    ),
  );
  root.append(plat);

  const grids = el('div', 'dash-grids');
  const gradeBox = el('div', 'dash-box');
  gradeBox.append(el('h3', null, 'By grade'));
  for (const row of stats.byGrade) {
    const line = el('div', 'dash-line');
    append(
      line,
      el('span', 'chip grade-' + row.grade, row.grade),
      el('span', 'dash-line-num', row.earned + ' / ' + row.total),
    );
    line.append(progressBar(row.earned, row.total));
    gradeBox.append(line);
  }
  const kindBox = el('div', 'dash-box');
  kindBox.append(el('h3', null, 'By kind'));
  for (const row of stats.byKind) {
    const line = el('div', 'dash-line');
    append(
      line,
      el('span', 'dash-kind', KIND_LABELS[row.kind]),
      el('span', 'dash-line-num', row.earned + ' / ' + row.total),
    );
    line.append(progressBar(row.earned, row.total));
    kindBox.append(line);
  }
  append(grids, gradeBox, kindBox);
  root.append(grids);
}

export function renderToolbar(root, ctx) {
  clear(root);
  const search = el('input', 'tool-search');
  search.type = 'search';
  search.placeholder = 'Search trophies, descriptions, guides…';
  search.value = ctx.filters.query;
  search.setAttribute('aria-label', 'Search trophies');
  search.addEventListener('input', () => {
    ctx.filters.query = search.value;
    ctx.renderList();
  });
  root.append(search);

  const chips = el('div', 'tool-chips');
  for (const kind of ['all', ...KIND_ORDER]) {
    const chip = el('button', 'kind-chip' + (ctx.filters.kind === kind ? ' is-active' : ''), kind === 'all' ? 'All kinds' : KIND_LABELS[kind]);
    chip.type = 'button';
    chip.addEventListener('click', () => {
      ctx.filters.kind = kind;
      ctx.renderAll();
    });
    chips.append(chip);
  }
  root.append(chips);

  const gradeSel = el('select', 'tool-select');
  gradeSel.setAttribute('aria-label', 'Filter by grade');
  for (const grade of ['all', ...GRADE_ORDER]) {
    const opt = el('option', null, grade === 'all' ? 'All grades' : grade[0].toUpperCase() + grade.slice(1));
    opt.value = grade;
    if (ctx.filters.grade === grade) opt.selected = true;
    gradeSel.append(opt);
  }
  gradeSel.addEventListener('change', () => {
    ctx.filters.grade = gradeSel.value;
    ctx.renderList();
  });
  root.append(gradeSel);

  const statusSel = el('select', 'tool-select');
  statusSel.setAttribute('aria-label', 'Filter by status');
  for (const [value, label] of [['all', 'All statuses'], ['earned', 'Earned'], ['remaining', 'Remaining']]) {
    const opt = el('option', null, label);
    opt.value = value;
    if (ctx.filters.status === value) opt.selected = true;
    statusSel.append(opt);
  }
  statusSel.addEventListener('change', () => {
    ctx.filters.status = statusSel.value;
    ctx.renderList();
  });
  root.append(statusSel);

  const missLabel = el('label', 'tool-toggle');
  const missBox = el('input');
  missBox.type = 'checkbox';
  missBox.checked = ctx.filters.missableOnly;
  missBox.addEventListener('change', () => {
    ctx.filters.missableOnly = missBox.checked;
    ctx.renderList();
  });
  append(missLabel, missBox, el('span', null, 'Missable only'));
  root.append(missLabel);

  const spoilLabel = el('label', 'tool-toggle');
  const spoilBox = el('input');
  spoilBox.type = 'checkbox';
  spoilBox.checked = ctx.state.spoilers;
  spoilBox.setAttribute('aria-label', 'Spoiler protection');
  spoilBox.addEventListener('change', () => {
    ctx.state.spoilers = spoilBox.checked;
    ctx.persist();
    ctx.renderAll();
  });
  append(spoilLabel, spoilBox, el('span', null, 'Spoiler protection'));
  root.append(spoilLabel);
}

export function renderList(root, ctx) {
  clear(root);
  const shown = applyFilters(ctx.trophies, ctx.state, ctx.filters);
  const countLine = el('p', 'list-count', 'Showing ' + shown.length + ' of ' + ctx.trophies.length + ' trophies');
  root.append(countLine);
  if (shown.length === 0) {
    root.append(el('p', 'list-empty', 'No trophy matches those filters. Loosen one and the list comes back.'));
    return;
  }
  const list = el('div', 'trophy-list');
  for (const trophy of shown) list.append(trophyRow(trophy, ctx));
  root.append(list);
}

function trophyRow(trophy, ctx) {
  const earned = isEarned(ctx.state, ctx.trophies, trophy);
  const row = el('article', 'trophy-row' + (earned ? ' is-earned' : '') + (ctx.selectedId === trophy.id ? ' is-selected' : ''));
  row.dataset.id = String(trophy.id);

  const tick = el('input', 'row-tick');
  tick.type = 'checkbox';
  tick.checked = earned;
  tick.setAttribute('aria-label', 'Mark ' + trophy.name + ' earned');
  if (trophy.kind === 'platinum') {
    tick.disabled = true;
    tick.title = 'The Platinum is automatic at 54 of 54.';
  } else {
    tick.addEventListener('change', () => ctx.toggleEarned(trophy, tick.checked));
  }
  row.append(tick);

  const main = el('button', 'row-main');
  main.type = 'button';
  const titleLine = el('span', 'row-title');
  append(
    titleLine,
    el('span', 'row-name', displayName(ctx.state, ctx.trophies, trophy)),
    gradeChip(trophy),
    el('span', 'chip chip-kind', KIND_LABELS[trophy.kind]),
  );
  if (trophy.hidden) titleLine.append(el('span', 'chip chip-hidden', 'hidden'));
  if (trophy.missable) titleLine.append(el('span', 'chip chip-missable', 'missable'));
  main.append(titleLine);
  main.append(el('span', 'row-desc', displayDescription(ctx.state, ctx.trophies, trophy)));
  main.addEventListener('click', () => ctx.select(trophy.id));
  row.append(main);

  if (trophy.target) {
    const counter = el('div', 'row-counter');
    const value = counterOf(ctx.state, trophy);
    const minus = el('button', 'counter-btn', '−');
    minus.type = 'button';
    minus.setAttribute('aria-label', 'Decrease counter for ' + trophy.name);
    minus.addEventListener('click', () => ctx.setCounter(trophy, value - 1));
    const input = el('input', 'counter-input');
    input.type = 'number';
    input.min = '0';
    input.value = String(value);
    input.setAttribute('aria-label', 'Counter for ' + trophy.name);
    input.addEventListener('change', () => ctx.setCounter(trophy, input.value));
    const plus = el('button', 'counter-btn', '+');
    plus.type = 'button';
    plus.setAttribute('aria-label', 'Increase counter for ' + trophy.name);
    plus.addEventListener('click', () => ctx.setCounter(trophy, value + 1));
    const readout = el('span', 'counter-readout', formatCount(value, trophy.unit) + ' / ' + formatCount(trophy.target, trophy.unit));
    append(counter, minus, input, plus, readout);
    counter.append(progressBar(Math.min(value, trophy.target), trophy.target, 'bar-mini'));
    row.append(counter);
  }
  return row;
}
