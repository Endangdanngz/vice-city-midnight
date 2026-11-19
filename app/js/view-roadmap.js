// view-roadmap.js — the Roadmap view: the four stages to the Platinum with live
// earned roll-ups for each, the order to play in, and a facts box where every
// number (hours, difficulty, the cheat rule) is cited to the guide it came from.

import { clear, h } from './dom.js';
import { STAGE_INFO } from './data.js';
import { displayName } from './filters.js';
import { gradeChip } from './view-tracker.js';
import { isEarned } from './store.js';

const FACTS = [
  {
    text: 'The story takes roughly 60 hours, going by launch reviews.',
    source: 'Reviews via PlanetGTA6 (VGC, Push Square)',
    url: 'https://www.planetgta6.com/en/gta-6-trophies/',
  },
  {
    text: 'The Platinum takes roughly 200 hours in total, at a difficulty of 4 out of 10 — long, not hard.',
    source: 'PowerPyx trophy guide, as reported by GTA-Zone',
    url: 'https://gta-zone.com/news/gta-6-trophies-achievements/',
  },
  {
    text: 'There are no online trophies, no difficulty trophies and no mission medals anywhere on the list.',
    source: 'GTA-Zone and Output Lag, from the official list',
    url: 'https://outputlag.com/guides/gta-6-trophy-list/',
  },
  {
    text: 'Cheats switch trophies and saving off, and every cheat only unlocks after the story is finished — leave them alone until the Platinum is yours.',
    source: 'PowerPyx, GameSpot and PC Gamer, via PlanetGTA6',
    url: 'https://www.planetgta6.com/en/gta-6-trophies/',
  },
  {
    text: 'Several trophies need Jason and Lucia together; most of the list opens once both are playable in Chapter 2.',
    source: 'Output Lag',
    url: 'https://outputlag.com/guides/gta-6-trophy-list/',
  },
  {
    text: 'The 100% checklist appears after the story, everything done earlier already counts, and nothing on it is missable.',
    source: 'GTA-Zone',
    url: 'https://gta-zone.com/news/gta-6-trophies-achievements/',
  },
  {
    text: 'The Xbox list is identical: the same 55 as achievements, worth 1,000 Gamerscore in total.',
    source: 'PlanetGTA6, cross-checked on TrueAchievements',
    url: 'https://www.planetgta6.com/en/gta-6-trophies/',
  },
];

export function renderRoadmap(el, trophies, state, stats, actions) {
  clear(el);
  el.append(
    h('h2', { class: 'view-title', text: 'Roadmap to the Platinum' }),
    h('p', {
      class: 'view-intro',
      text: 'Four stages, in the order to play them, built from the official trophy descriptions. The roll-ups are live: they move with your checklist. Only one trophy on the whole list can be missed, and it lives in Stage 1 — the warning is on the Missables page and under that trophy\u2019s guide.',
    }),
  );

  for (const stage of [1, 2, 3, 4]) {
    const info = STAGE_INFO[stage];
    const roll = stats.perStage[stage];
    const pct = roll.total ? Math.round((roll.earned / roll.total) * 100) : 0;
    const members = trophies.filter((t) => t.stage === stage);
    el.append(
      h(
        'section',
        { class: 'stage-card' },
        h(
          'div',
          { class: 'stage-head' },
          h('h3', { text: info.title }),
          h('span', { class: 'stage-count', text: roll.earned + ' / ' + roll.total + ' earned' }),
        ),
        h('div', { class: 'bar-track' }, h('div', { class: 'bar-fill', style: 'width:' + pct + '%' })),
        h('p', { class: 'stage-blurb', text: info.blurb }),
        h(
          'div',
          { class: 'stage-trophies' },
          ...members.map((trophy) => {
            const chip = h(
              'button',
              {
                class: 'stage-chip' + (isEarned(trophy, trophies, state) ? ' earned' : '') + (trophy.missable ? ' missable' : ''),
                type: 'button',
              },
              h('span', { text: displayName(trophy, trophies, state) }),
              gradeChip(trophy),
            );
            chip.addEventListener('click', () => actions.openTrophy(trophy.id));
            return chip;
          }),
        ),
      ),
    );
  }

  el.append(
    h(
      'section',
      { class: 'facts-card' },
      h('h3', { text: 'The facts behind this roadmap — and where each one comes from' }),
      h(
        'ul',
        { class: 'facts-list' },
        ...FACTS.map((fact) =>
          h(
            'li',
            {},
            h('span', { text: fact.text + ' ' }),
            h('a', { href: fact.url, target: '_blank', rel: 'noopener', text: '(' + fact.source + ')' }),
          ),
        ),
      ),
    ),
  );
}
