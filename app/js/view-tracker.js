// view-tracker.js — the Tracker view: the dashboard (earned count, percentage,
// per-grade and per-kind bars, the automatic Platinum line), the combined
// filter controls, the 55-row checklist with PSN counters, and the guide pane
// that opens beside it with the full guide, steps, sources and a note field.

import { clear, fmtInt, fmtTarget, fmtValue, h } from './dom.js';
import { GRADE_LABELS, GRADE_ORDER, KIND_LABELS, KIND_ORDER } from './data.js';
import { displayDescription, displayName, isMasked } from './filters.js';
import { counterOf, isEarned } from './store.js';

export function gradeChip(trophy) {
  return h('span', { class: 'chip grade-' + trophy.grade, text: GRADE_LABELS[trophy.grade] });
}

export function kindTag(trophy) {
  return h('span', { class: 'tag kind-tag', text: KIND_LABELS[trophy.kind] });
}

function barRow(label, earned, total) {
  const pct = total ? Math.round((earned / total) * 100) : 0;
  return h(
    'div',
    { class: 'bar-row' },
    h('span', { class: 'bar-label', text: label }),
    h('div', { class: 'bar-track' }, h('div', { class: 'bar-fill', style: 'width:' + pct + '%' })),
    h('span', { class: 'bar-count', text: earned + ' / ' + total }),
  );
}

export function renderDashboard(el, trophies, state, stats) {
  clear(el);
  const platinumLine = stats.platinumEarned
    ? 'Platinum earned — Vice Got a Price! is yours.'
    : 'Platinum: ' + stats.remainingForPlatinum + ' to go — Vice Got a Price! unlocks itself at 54 of 54.';
  el.append(
    h(
      'div',
      { class: 'dash-main' },
      h(
        'div',
        { class: 'dash-count' },
        h('span', { class: 'dash-big', text: String(stats.earnedTotal) }),
        h('span', { class: 'dash-of', text: 'of ' + stats.total + ' trophies' }),
      ),
      h(
        'div',
        { class: 'dash-side' },
        h('div', { class: 'dash-pct', text: stats.pct + '% complete' }),
        h('div', { class: 'bar-track big' }, h('div', { class: 'bar-fill', style: 'width:' + stats.pct + '%' })),
        h('div', { class: 'dash-platinum' + (stats.platinumEarned ? ' earned' : ''), text: platinumLine }),
        h('div', {
          class: 'dash-sub',
          text: stats.countersInProgress + ' counters in progress · ' + trophies.filter((t) => t.hidden).length + ' hidden trophies on the list',
        }),
      ),
    ),
    h(
      'div',
      { class: 'dash-bars' },
      h('div', { class: 'dash-bars-col' }, h('h3', { text: 'By grade' }), ...GRADE_ORDER.map((g) => barRow(GRADE_LABELS[g], stats.perGrade[g].earned, stats.perGrade[g].total))),
      h('div', { class: 'dash-bars-col' }, h('h3', { text: 'By kind' }), ...KIND_ORDER.map((k) => barRow(KIND_LABELS[k], stats.perKind[k].earned, stats.perKind[k].total))),
    ),
  );
}

export function renderControls(el, ui, actions) {
  clear(el);
  const search = h('input', {
    class: 'search-input',
    type: 'search',
    placeholder: 'Search trophies by name or description…',
    value: ui.query,
    'aria-label': 'Search trophies',
  });
  search.addEventListener('input', () => actions.setUi({ query: search.value }));

  const chips = h('div', { class: 'kind-chips' });
  for (const kind of ['all', ...KIND_ORDER]) {
    const chip = h('button', {
      class: 'kind-chip' + (ui.kind === kind ? ' active' : ''),
      type: 'button',
      text: kind === 'all' ? 'All kinds' : KIND_LABELS[kind],
    });
    chip.addEventListener('click', () => actions.setUi({ kind }));
    chips.append(chip);
  }

  const gradeSelect = h(
    'select',
    { class: 'filter-select', 'aria-label': 'Filter by grade' },
    h('option', { value: 'all', text: 'All grades' }),
    ...GRADE_ORDER.map((g) => h('option', { value: g, text: GRADE_LABELS[g] })),
  );
  gradeSelect.value = ui.grade;
  gradeSelect.addEventListener('change', () => actions.setUi({ grade: gradeSelect.value }));

  const statusSelect = h(
    'select',
    { class: 'filter-select', 'aria-label': 'Filter by status' },
    h('option', { value: 'all', text: 'Any status' }),
    h('option', { value: 'unearned', text: 'Not earned' }),
    h('option', { value: 'in-progress', text: 'Counter in progress' }),
    h('option', { value: 'earned', text: 'Earned' }),
  );
  statusSelect.value = ui.status;
  statusSelect.addEventListener('change', () => actions.setUi({ status: statusSelect.value }));

  const missableBox = h('input', { type: 'checkbox', class: 'switch-input' });
  missableBox.checked = ui.missableOnly === true;
  missableBox.addEventListener('change', () => actions.setUi({ missableOnly: missableBox.checked }));
  const missableToggle = h(
    'label',
    { class: 'switch-row' },
    missableBox,
    h('span', { class: 'switch-track' }),
    h('span', { class: 'switch-label', text: 'Missable only' }),
  );

  el.append(
    h('div', { class: 'controls-row' }, search, gradeSelect, statusSelect, missableToggle),
    chips,
    h('div', { class: 'result-count', id: 'result-count' }),
  );
}

export function updateResultCount(el, shown, total) {
  const node = el.querySelector('#result-count');
  if (node) node.textContent = 'Showing ' + shown + ' of ' + total + ' trophies';
}

function counterWidget(trophy, state, actions, large) {
  const value = counterOf(state, trophy);
  const pct = trophy.target ? Math.min(100, Math.round((value / trophy.target) * 100)) : 0;
  const input = h('input', {
    class: 'counter-input',
    type: 'number',
    min: '0',
    max: String(trophy.target),
    step: trophy.unit === 'money' ? '500' : '1',
    value: String(value),
    'aria-label': 'Progress for ' + trophy.name,
  });
  input.addEventListener('change', () => actions.setCounter(trophy, input.value));
  const dec = h('button', { class: 'counter-btn', type: 'button', text: '−', 'aria-label': 'Decrease' });
  dec.addEventListener('click', () => actions.setCounter(trophy, value - (trophy.unit === 'money' ? 500 : 1)));
  const inc = h('button', { class: 'counter-btn', type: 'button', text: '+', 'aria-label': 'Increase' });
  inc.addEventListener('click', () => actions.setCounter(trophy, value + (trophy.unit === 'money' ? 500 : 1)));
  return h(
    'div',
    { class: 'counter' + (large ? ' large' : '') },
    h('div', { class: 'counter-controls' }, dec, input, inc),
    h(
      'div',
      { class: 'counter-meta' },
      h('span', { class: 'counter-label', text: fmtValue(trophy, value) + ' / ' + fmtTarget(trophy) }),
      h('div', { class: 'bar-track slim' }, h('div', { class: 'bar-fill', style: 'width:' + pct + '%' })),
    ),
  );
}

export function renderList(el, trophies, state, visible, selectedId, actions) {
  clear(el);
  if (visible.length === 0) {
    el.append(h('p', { class: 'empty-note', text: 'No trophies match those filters. Loosen a filter — or clear the search — to see the full list again.' }));
    return;
  }
  for (const trophy of visible) {
    const earned = isEarned(trophy, trophies, state);
    const masked = isMasked(trophy, trophies, state);
    const isPlatinum = trophy.kind === 'platinum';

    const toggle = h('button', {
      class: 'earn-toggle' + (earned ? ' on' : ''),
      type: 'button',
      'aria-pressed': earned ? 'true' : 'false',
      'aria-label': isPlatinum ? 'The Platinum is earned automatically' : 'Mark ' + trophy.name + ' as earned',
      text: earned ? '✓' : '',
    });
    if (isPlatinum) toggle.disabled = true;
    else toggle.addEventListener('click', (ev) => { ev.stopPropagation(); actions.toggle(trophy); });

    const top = h(
      'div',
      { class: 'row-top' },
      h('span', { class: 'row-name', text: displayName(trophy, trophies, state) }),
      gradeChip(trophy),
      kindTag(trophy),
      trophy.missable ? h('span', { class: 'tag missable-tag', text: 'MISSABLE' }) : null,
      trophy.hidden && !masked ? h('span', { class: 'tag hidden-tag', text: 'HIDDEN' }) : null,
      state.notes[trophy.id] ? h('span', { class: 'tag note-tag', text: 'NOTE' }) : null,
    );
    const main = h(
      'div',
      { class: 'row-main' },
      top,
      h('p', { class: 'row-desc', text: displayDescription(trophy, trophies, state) }),
      trophy.target ? counterWidget(trophy, state, actions, false) : null,
    );
    main.addEventListener('click', () => actions.select(trophy.id));

    el.append(
      h(
        'article',
        {
          class: 'trophy-row' + (earned ? ' earned' : '') + (selectedId === trophy.id ? ' selected' : ''),
          'data-id': String(trophy.id),
        },
        toggle,
        main,
      ),
    );
  }
}

export function renderDetail(el, trophies, state, trophy, actions) {
  clear(el);
  if (!trophy) {
    el.append(
      h('h2', { text: 'Trophy guide' }),
      h('p', { class: 'detail-hint', text: 'Pick any trophy from the list to read its guide: what to do, the steps, when it can be missed, and the sources every fact comes from.' }),
    );
    return;
  }
  const earned = isEarned(trophy, trophies, state);
  const masked = isMasked(trophy, trophies, state);

  el.append(
    h(
      'div',
      { class: 'detail-head' },
      h('h2', { text: displayName(trophy, trophies, state) }),
      h('div', { class: 'detail-chips' }, gradeChip(trophy), kindTag(trophy),
        trophy.missable ? h('span', { class: 'tag missable-tag', text: 'MISSABLE' }) : null,
        h('span', { class: 'tag stage-tag', text: 'Roadmap stage ' + trophy.stage })),
    ),
  );

  if (masked) {
    el.append(
      h('p', { class: 'masked-note', text: 'This trophy is hidden on PlayStation, and spoiler protection is on — its name, description and guide stay covered until you earn it. Turn spoiler protection off in the header if you want to peek.' }),
    );
    return;
  }

  el.append(
    h(
      'div',
      { class: 'official-box' },
      h('div', { class: 'official-label', text: 'Official description — PlayStation' }),
      h('p', { class: 'official-desc', text: '\u201C' + trophy.description + '\u201D' }),
    ),
  );

  if (trophy.missableNote) {
    el.append(
      h(
        'div',
        { class: 'missable-banner' },
        h('strong', { text: trophy.missable ? 'Missable — read before you play: ' : 'Caution: ' }),
        document.createTextNode(trophy.missableNote),
      ),
    );
  }

  el.append(h('h3', { text: 'Guide' }), h('p', { class: 'guide-text', text: trophy.guide }));

  if (Array.isArray(trophy.steps) && trophy.steps.length) {
    el.append(
      h('h3', { text: 'Steps' }),
      h('ol', { class: 'steps-list' }, ...trophy.steps.map((step) => h('li', { text: step }))),
    );
  }

  if (trophy.target) {
    el.append(h('h3', { text: 'Progress counter' }), counterWidget(trophy, state, actions, true));
  }

  const toggleBtn = h('button', {
    class: 'primary-btn' + (earned ? ' is-earned' : ''),
    type: 'button',
    text: trophy.kind === 'platinum'
      ? (earned ? 'Platinum earned' : 'Earned automatically at 54 of 54')
      : (earned ? 'Earned — tap to undo' : 'Mark as earned'),
  });
  if (trophy.kind === 'platinum') toggleBtn.disabled = true;
  else toggleBtn.addEventListener('click', () => actions.toggle(trophy));
  el.append(toggleBtn);

  const noteArea = h('textarea', {
    class: 'note-input',
    rows: '3',
    placeholder: 'Your own note for this trophy — spots found, gangs hit, locations cleared…',
    'aria-label': 'Your note for ' + trophy.name,
  });
  noteArea.value = state.notes[trophy.id] || '';
  const savedMark = h('span', { class: 'note-saved', text: '' });
  noteArea.addEventListener('change', () => {
    actions.setNote(trophy.id, noteArea.value);
    savedMark.textContent = 'Saved';
  });
  el.append(h('h3', { text: 'Your note' }), noteArea, savedMark);

  el.append(
    h('h3', { text: 'Sources' }),
    h(
      'ul',
      { class: 'sources-list' },
      ...trophy.sources.map((source) =>
        h('li', {}, h('a', { href: source.url, target: '_blank', rel: 'noopener', text: source.label })),
      ),
    ),
    h('p', { class: 'sources-note', text: 'Names, descriptions and grades are the official list as published on PlayStation Network (via Exophase and PSNProfiles). The guide text is our own words; where a fact comes from another guide, that guide is named above.' }),
  );
}
