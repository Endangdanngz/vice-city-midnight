// view-roadmap.js — the road to the Platinum: the cited facts box, the
// Chapter 1 save warning, and the four stages with live roll-ups and their
// trophies (spoiler-safe).

import { ROADMAP_FACTS } from './data.js';
import { append, clear, el, percent, progressBar } from './dom.js';
import { displayName } from './filters.js';
import { isEarned } from './store.js';
import { gradeChip } from './view-checklist.js';

export function renderRoadmap(root, ctx) {
  clear(root);
  root.append(el('h2', 'view-title', 'Roadmap to the Platinum'));
  root.append(
    el(
      'p',
      'view-intro',
      'Four stages, in the order the game wants them played. The roadmap and its missable flags are built from ' +
        'the official trophy descriptions; every wider fact below names its source.',
    ),
  );

  const facts = el('section', 'facts-box');
  facts.append(el('h3', null, 'The facts, with their sources'));
  const factList = el('ul', 'facts-list');
  for (const fact of ROADMAP_FACTS) {
    const item = el('li');
    append(item, el('span', 'fact-text', fact.text), el('span', 'fact-source', ' — ' + fact.source));
    factList.append(item);
  }
  facts.append(factList);
  root.append(facts);

  const warning = el('section', 'roadmap-warning');
  append(
    warning,
    el('strong', null, '⚠ The Chapter 1 warning'),
    el(
      'p',
      null,
      'Positive Mental Attitude is the one potentially missable trophy: a meditation spot on Lucia\u2019s balcony ' +
        'exists only during Chapter 1 and is gone when the chapter ends, and there is no mission replay ' +
        '(PowerPyx via GTA-Zone; Output Lag). Meditate there during Chapter 1, keep a manual save at the start ' +
        'of every chapter, and one more before the final mission.',
    ),
  );
  root.append(warning);

  for (const stageStats of ctx.stats.byStage) {
    const stage = stageStats.stage;
    const box = el('section', 'stage-box');
    const head = el('div', 'stage-head');
    append(
      head,
      el('span', 'stage-num', 'Stage ' + stage.n),
      el('h3', 'stage-name', stage.name),
      el('span', 'stage-count', stageStats.earned + ' / ' + stageStats.total + ' · ' + percent(stageStats.earned, stageStats.total) + '%'),
    );
    box.append(head);
    box.append(el('p', 'stage-tagline', stage.tagline));
    box.append(progressBar(stageStats.earned, stageStats.total));
    box.append(el('p', 'stage-detail', stage.detail));

    const list = el('div', 'stage-list');
    for (const trophy of ctx.trophies.filter((t) => t.stage === stage.n)) {
      const earned = isEarned(ctx.state, ctx.trophies, trophy);
      const row = el('button', 'stage-row' + (earned ? ' is-earned' : ''));
      row.type = 'button';
      append(
        row,
        el('span', 'stage-row-check', earned ? '✓' : '·'),
        el('span', 'stage-row-name', displayName(ctx.state, ctx.trophies, trophy)),
        gradeChip(trophy),
      );
      if (trophy.missable) row.append(el('span', 'chip chip-missable', 'missable'));
      row.addEventListener('click', () => ctx.goToTrophy(trophy.id));
      list.append(row);
    }
    box.append(list);
    root.append(box);
  }
}
