// view-nextup.js — the Next Up planner: what to play next, in order, each pick
// with its reason, its counter progress and its grade. Spoiler-safe by
// construction (recommend.js masks hidden names).

import { append, clear, el, formatCount, progressBar } from './dom.js';
import { nextUp } from './recommend.js';
import { counterOf } from './store.js';
import { gradeChip } from './view-checklist.js';

export function renderNextUp(root, ctx) {
  clear(root);
  root.append(el('h2', 'view-title', 'Next up'));
  root.append(
    el(
      'p',
      'view-intro',
      'Your next twelve trophies, in the order this planner would play them: the missable first, then the ' +
        'roadmap\u2019s stages, and inside a stage the counter closest to finishing. Every pick says why it is ' +
        'there. Hidden trophies stay covered while spoiler protection is on.',
    ),
  );

  const picks = nextUp(ctx.state, ctx.trophies, 12);
  if (picks.length === 0) {
    root.append(el('p', 'nextup-done', 'Nothing left. 55 of 55 — Vice City is yours.'));
    return;
  }
  const list = el('ol', 'nextup-list');
  picks.forEach((pick, index) => {
    const trophy = pick.trophy;
    const row = el('li', 'nextup-row');
    const head = el('div', 'nextup-head');
    append(
      head,
      el('span', 'nextup-rank', String(index + 1)),
      el('span', 'nextup-name', pick.name),
      gradeChip(trophy),
    );
    if (trophy.missable) head.append(el('span', 'chip chip-missable', 'missable'));
    row.append(head);
    row.append(el('p', 'nextup-reason', pick.reason));
    if (trophy.target && !pick.masked) {
      const value = counterOf(ctx.state, trophy);
      const meta = el('div', 'nextup-counter');
      append(
        meta,
        el('span', 'counter-readout', formatCount(value, trophy.unit) + ' / ' + formatCount(trophy.target, trophy.unit) + ' ' + (trophy.unit === 'money' ? 'dollars' : trophy.unit)),
      );
      meta.append(progressBar(Math.min(value, trophy.target), trophy.target, 'bar-mini'));
      row.append(meta);
    }
    const open = el('button', 'btn btn-small', 'Open guide');
    open.type = 'button';
    open.addEventListener('click', () => ctx.goToTrophy(trophy.id));
    row.append(open);
    list.append(row);
  });
  root.append(list);
}
