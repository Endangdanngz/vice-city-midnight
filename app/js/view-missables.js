// view-missables.js — the Missables view: the one trophy that can be lost
// (Positive Mental Attitude, and its Chapter 1 balcony spot), the one permanent-
// choice caution (Actions Speak Louder), an honest note that nothing else is
// flagged missable by the cited sources, and a save-habit checklist that is
// itself saved in localStorage.

import { clear, fmtTarget, fmtValue, h } from './dom.js';
import { trophyById } from './data.js';
import { gradeChip } from './view-tracker.js';
import { counterOf, isEarned } from './store.js';

export const SAVE_HABITS = [
  { key: 'save-chapter-start', text: 'Keep a manual save at the start of every chapter' },
  { key: 'balcony-chapter-1', text: 'Meditate at the spot on Lucia\u2019s balcony during Chapter 1, before the chapter ends' },
  { key: 'save-before-finale', text: 'Keep a manual save from just before the final mission' },
  { key: 'backup-slot', text: 'Leave one save slot completely untouched as a backup' },
];

export function renderMissables(el, trophies, state, actions) {
  clear(el);
  const pma = trophyById(trophies, 28);
  const asl = trophyById(trophies, 48);

  el.append(
    h('h2', { class: 'view-title', text: 'Missables & Permanent Choices' }),
    h('p', {
      class: 'view-intro',
      text: 'Good news first: of the 55 trophies, exactly one is flagged potentially missable by the guides that work from the official list — and it is only missable if you sail past one spot in Chapter 1. Everything on this page is built from the official descriptions and the cited sources below.',
    }),
  );

  if (pma) {
    const earned = isEarned(pma, trophies, state);
    const open = h('button', { class: 'primary-btn', type: 'button', text: 'Open its guide in the tracker' });
    open.addEventListener('click', () => actions.openTrophy(pma.id));
    el.append(
      h(
        'section',
        { class: 'missable-hero' },
        h(
          'div',
          { class: 'missable-hero-head' },
          h('h3', { text: pma.name }),
          gradeChip(pma),
          h('span', { class: 'tag missable-tag', text: 'POTENTIALLY MISSABLE' }),
          earned ? h('span', { class: 'tag earned-tag', text: 'EARNED' }) : null,
        ),
        h('p', { class: 'missable-warning', text: pma.missableNote }),
        h('p', { text: pma.guide }),
        h('p', {
          class: 'missable-progress',
          text: 'Your counter: ' + fmtValue(pma, counterOf(state, pma)) + ' of ' + fmtTarget(pma) + ' — the balcony spot is one of the 18, and it is the only one with a deadline.',
        }),
        open,
        h(
          'p',
          { class: 'sources-note' },
          'Sources: ',
          h('a', { href: 'https://gta-zone.com/news/gta-6-trophies-achievements/', target: '_blank', rel: 'noopener', text: 'PowerPyx, via GTA-Zone' }),
          ' · ',
          h('a', { href: 'https://outputlag.com/guides/gta-6-trophy-list/', target: '_blank', rel: 'noopener', text: 'Output Lag' }),
          ' · ',
          h('a', { href: 'https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/', target: '_blank', rel: 'noopener', text: 'Exophase (official list)' }),
        ),
      ),
    );
  }

  if (asl) {
    const open = h('button', { class: 'ghost-btn', type: 'button', text: 'Open its guide' });
    open.addEventListener('click', () => actions.openTrophy(asl.id));
    el.append(
      h(
        'section',
        { class: 'caution-card' },
        h('div', { class: 'missable-hero-head' }, h('h3', { text: asl.name }), gradeChip(asl), h('span', { class: 'tag caution-tag', text: 'PERMANENT-CHOICE CAUTION' })),
        h('p', { class: 'missable-warning', text: asl.missableNote }),
        open,
      ),
    );
  }

  el.append(
    h(
      'section',
      { class: 'calm-card' },
      h('h3', { text: 'Everything else: not missable' }),
      h('p', {
        text: 'No other trophy is flagged missable by PowerPyx, GTA-Zone or Output Lag as of this guide\u2019s writing. Story trophies unlock in sequence and cannot be skipped past, strands and activities stay available after the credits, and GTA-Zone confirms the 100% checklist behind A Long Road holds nothing missable either. There is no mission replay, though — which is exactly why the save habits below matter.',
      }),
    ),
    h(
      'section',
      { class: 'habits-card' },
      h('h3', { text: 'Save habits that make this list safe' }),
      h('p', { class: 'habits-intro', text: 'Tick these off as you build the habits. This checklist is saved with your progress.' }),
      h(
        'div',
        { class: 'habits-list' },
        ...SAVE_HABITS.map((habit) => {
          const box = h('input', { type: 'checkbox', class: 'habit-box' });
          box.checked = state.habits[habit.key] === true;
          box.addEventListener('change', () => actions.toggleHabit(habit.key));
          return h('label', { class: 'habit-row' }, box, h('span', { text: habit.text }));
        }),
      ),
    ),
  );
}
