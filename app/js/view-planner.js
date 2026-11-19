// view-planner.js — the Next Up planner: the ten trophies to work on next,
// ordered missable-first, then by roadmap stage, then by the counter nearest
// to done, each with its reason. Names pass through the same spoiler rule as
// everywhere else, so the planner can never leak a hidden trophy.

import { clear, fmtTarget, fmtValue, h } from './dom.js';
import { KIND_LABELS } from './data.js';
import { displayName, isMasked } from './filters.js';
import { nextUp } from './recommend.js';
import { gradeChip } from './view-tracker.js';
import { counterOf } from './store.js';

export function renderPlanner(el, trophies, state, actions) {
  clear(el);
  el.append(
    h('h2', { class: 'view-title', text: 'Next Up' }),
    h('p', {
      class: 'view-intro',
      text: 'What to work on next, in order: anything missable first, then the roadmap\u2019s stage order, then the counter closest to finished. The list rebuilds itself from your checklist every time your progress changes.',
    }),
  );

  const items = nextUp(trophies, state, 10);
  if (items.length === 0) {
    el.append(
      h('p', { class: 'all-done', text: 'Everything is earned — all 55, Platinum included. Leonida is yours.' }),
    );
    return;
  }

  el.append(
    h(
      'ol',
      { class: 'planner-list' },
      ...items.map(({ trophy, reason }, index) => {
        const masked = isMasked(trophy, trophies, state);
        const row = h(
          'li',
          { class: 'planner-row' },
          h('span', { class: 'planner-rank', text: String(index + 1) }),
          h(
            'div',
            { class: 'planner-main' },
            h(
              'div',
              { class: 'row-top' },
              h('span', { class: 'row-name', text: displayName(trophy, trophies, state) }),
              gradeChip(trophy),
              h('span', { class: 'tag kind-tag', text: KIND_LABELS[trophy.kind] }),
              trophy.missable ? h('span', { class: 'tag missable-tag', text: 'MISSABLE' }) : null,
            ),
            h('p', { class: 'planner-reason', text: masked ? 'A Stage ' + trophy.stage + ' ' + KIND_LABELS[trophy.kind].toLowerCase() + ' trophy — spoiler protection is on, so its name and reason stay covered until you earn it.' : reason }),
            trophy.target && !masked
              ? h('p', { class: 'planner-progress', text: 'Progress: ' + fmtValue(trophy, counterOf(state, trophy)) + ' / ' + fmtTarget(trophy) })
              : null,
          ),
        );
        row.addEventListener('click', () => actions.openTrophy(trophy.id));
        return row;
      }),
    ),
    h('p', {
      class: 'sources-note',
      text: 'Ordering: missable trophies first (their window can close), then roadmap stage, then counters by how close they are to their PSN target. Reasons cite the same sources as each trophy\u2019s guide.',
    }),
  );
}
