// view-detail.js — the guide pane: one trophy in full. Official name,
// description and grade, the guide in this app's own words, its steps, the
// missable banner, its PSN counter, a personal note, and the sources every
// fact came from.

import { KIND_LABELS } from './data.js';
import { append, clear, el, formatCount, progressBar } from './dom.js';
import { displayDescription, displayName, isMasked } from './filters.js';
import { counterOf, isEarned } from './store.js';
import { gradeChip } from './view-checklist.js';

export function renderDetail(root, ctx) {
  clear(root);
  const trophy = ctx.trophies.find((t) => t.id === ctx.selectedId) || ctx.trophies[0];
  if (!trophy) {
    root.append(el('p', 'detail-empty', 'Pick a trophy to read its guide.'));
    return;
  }
  const masked = isMasked(ctx.state, ctx.trophies, trophy);
  const earned = isEarned(ctx.state, ctx.trophies, trophy);

  const head = el('div', 'detail-head');
  append(head, el('h2', 'detail-name', displayName(ctx.state, ctx.trophies, trophy)));
  const chips = el('div', 'detail-chips');
  append(
    chips,
    gradeChip(trophy),
    el('span', 'chip chip-kind', KIND_LABELS[trophy.kind]),
    el('span', 'chip chip-stage', 'Roadmap stage ' + trophy.stage),
  );
  if (trophy.hidden) chips.append(el('span', 'chip chip-hidden', 'hidden on PSN'));
  if (earned) chips.append(el('span', 'chip chip-earned', 'earned'));
  head.append(chips);
  root.append(head);

  root.append(el('p', 'detail-desc', displayDescription(ctx.state, ctx.trophies, trophy)));

  if (masked) {
    root.append(
      el(
        'p',
        'detail-spoiler-note',
        'Spoiler protection is on and this trophy is still unearned, so its guide stays covered too. ' +
          'Earn it, or switch spoiler protection off in the toolbar, to read the full guide.',
      ),
    );
    return;
  }

  if (trophy.missable || trophy.missableNote) {
    const banner = el('div', 'missable-banner');
    append(
      banner,
      el('strong', null, trophy.missable ? '⚠ Potentially missable' : '⚠ Permanent-choice caution'),
      el('p', null, trophy.missableNote || ''),
    );
    root.append(banner);
  }

  const guideBox = el('div', 'detail-guide');
  guideBox.append(el('h3', null, 'Guide'));
  guideBox.append(el('p', null, trophy.guide));
  root.append(guideBox);

  if (Array.isArray(trophy.steps) && trophy.steps.length) {
    const stepsBox = el('div', 'detail-steps');
    stepsBox.append(el('h3', null, 'Steps'));
    const list = el('ol', 'steps-list');
    for (const step of trophy.steps) list.append(el('li', null, step));
    stepsBox.append(list);
    root.append(stepsBox);
  }

  if (trophy.target) {
    const box = el('div', 'detail-counter');
    box.append(el('h3', null, 'Progress counter'));
    const value = counterOf(ctx.state, trophy);
    const controls = el('div', 'counter-controls');
    const minus = el('button', 'counter-btn', '−');
    minus.type = 'button';
    minus.addEventListener('click', () => ctx.setCounter(trophy, value - 1));
    const input = el('input', 'counter-input');
    input.type = 'number';
    input.min = '0';
    input.value = String(value);
    input.setAttribute('aria-label', 'Counter for ' + trophy.name);
    input.addEventListener('change', () => ctx.setCounter(trophy, input.value));
    const plus = el('button', 'counter-btn', '+');
    plus.type = 'button';
    plus.addEventListener('click', () => ctx.setCounter(trophy, value + 1));
    append(
      controls,
      minus,
      input,
      plus,
      el('span', 'counter-readout', formatCount(value, trophy.unit) + ' / ' + formatCount(trophy.target, trophy.unit) + ' ' + (trophy.unit === 'money' ? 'dollars' : trophy.unit)),
    );
    box.append(controls);
    box.append(progressBar(Math.min(value, trophy.target), trophy.target));
    box.append(el('p', 'counter-hint', 'Reaching the target marks the trophy earned; dropping below it again revokes it.'));
    root.append(box);
  }

  const noteBox = el('div', 'detail-note');
  noteBox.append(el('h3', null, 'Your note'));
  const area = el('textarea', 'note-area');
  area.rows = 3;
  area.placeholder = 'Your own note for this trophy — saved in this browser.';
  area.value = ctx.state.notes[trophy.id] || '';
  area.setAttribute('aria-label', 'Note for ' + trophy.name);
  area.addEventListener('input', () => ctx.setNote(trophy, area.value));
  noteBox.append(area);
  root.append(noteBox);

  if (Array.isArray(trophy.sources) && trophy.sources.length) {
    const srcBox = el('div', 'detail-sources');
    srcBox.append(el('h3', null, 'Sources'));
    const list = el('ul', 'sources-list');
    for (const source of trophy.sources) {
      const item = el('li');
      if (typeof source === 'string') {
        item.textContent = source;
      } else if (source.url) {
        const link = el('a', null, source.label);
        link.href = source.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        item.append(link);
      } else {
        item.textContent = source.label;
      }
      list.append(item);
    }
    srcBox.append(list);
    srcBox.append(
      el(
        'p',
        'sources-note',
        'Official names, descriptions and grades are PlayStation\u2019s, via Exophase and PSNProfiles. ' +
          'The guide above is written for this app; its facts cite the sources listed, and where no source ' +
          'pins a step down, the guide says so.',
      ),
    );
    root.append(srcBox);
  }
}
