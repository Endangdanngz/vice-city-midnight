// view-missables.js — the missables page: the one potentially missable trophy
// as a hero card with the Chapter 1 warning, the permanent-choice caution for
// Actions Speak Louder, and the save-discipline checklist.

import { SAVE_HABITS } from './data.js';
import { append, clear, el } from './dom.js';
import { isEarned } from './store.js';

export function renderMissables(root, ctx) {
  clear(root);
  root.append(el('h2', 'view-title', 'Missables & permanent choices'));
  root.append(
    el(
      'p',
      'view-intro',
      'The good news first: of the 55 trophies, the guides flag exactly one as potentially missable, and nothing ' +
        'on the 100% checklist can be lost (GTA-Zone). The risk in this list is small but real, and it lives in ' +
        'Chapter 1.',
    ),
  );

  const pma = ctx.trophies.find((t) => t.id === 28);
  if (pma) {
    const hero = el('section', 'missable-hero');
    append(
      hero,
      el('span', 'chip chip-missable', 'potentially missable'),
      el('h3', 'hero-name', pma.name),
      el('p', 'hero-desc', pma.description),
      el(
        'p',
        'hero-warning',
        'One of the 18 meditation spots sits on Lucia\u2019s balcony, and it exists only during Chapter 1. When ' +
          'Chapter 1 ends the spot is gone, and the game has no mission replay to go back for it. Meditate there ' +
          'before you finish the chapter. (PowerPyx, via GTA-Zone; Output Lag.)',
      ),
      el(
        'p',
        'hero-status',
        isEarned(ctx.state, ctx.trophies, pma)
          ? 'Status: earned — the danger is behind you.'
          : 'Status: not yet earned — if you are still in Chapter 1, do the balcony spot now.',
      ),
    );
    const open = el('button', 'btn btn-primary', 'Open its guide');
    open.type = 'button';
    open.addEventListener('click', () => ctx.goToTrophy(pma.id));
    hero.append(open);
    root.append(hero);
  }

  const asl = ctx.trophies.find((t) => t.id === 48);
  if (asl) {
    const caution = el('section', 'caution-box');
    append(
      caution,
      el('span', 'chip chip-caution', 'permanent choice — not missable'),
      el('h3', null, asl.name),
      el(
        'p',
        null,
        'Actions Speak Louder counts 500 choices that shape your Criminal Profile. The trophy itself cannot be ' +
          'missed, but the profile can: pushing it all the way to \u201CIrredeemable\u201D is permanent (GTA-Zone). ' +
          'Steer your choices deliberately on a save you care about, and do not max the extreme out of curiosity.',
      ),
    );
    const open = el('button', 'btn', 'Open its guide');
    open.type = 'button';
    open.addEventListener('click', () => ctx.goToTrophy(asl.id));
    caution.append(open);
    root.append(caution);
  }

  const habits = el('section', 'habits-box');
  habits.append(el('h3', null, 'Save discipline — the whole defence'));
  habits.append(
    el(
      'p',
      null,
      'Five habits make this page boring, which is the point. Tick them off as you build the routine; the ticks ' +
        'are saved in this browser.',
    ),
  );
  const list = el('div', 'habits-list');
  SAVE_HABITS.forEach((text, index) => {
    const label = el('label', 'habit-row');
    const box = el('input');
    box.type = 'checkbox';
    box.checked = ctx.state.habits[index] === true;
    box.addEventListener('change', () => {
      if (box.checked) ctx.state.habits[index] = true;
      else delete ctx.state.habits[index];
      ctx.persist();
    });
    append(label, box, el('span', null, text));
    list.append(label);
  });
  habits.append(list);
  root.append(habits);
}
