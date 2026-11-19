// recommend.js — the Next Up planner's ordering: missable first (a trophy that
// can be lost outranks everything), then roadmap stage order, then — inside a
// stage — the counter nearest to done, so the list always points at the most
// urgent and the most finishable work. Every entry carries its reason.

import { fmtValue } from './dom.js';
import { counterOf, isEarned } from './store.js';

const GRADE_WEIGHT = { gold: 3, silver: 2, bronze: 1, platinum: 4 };

function progressRatio(trophy, state) {
  if (!trophy.target) return -1;
  return counterOf(state, trophy) / trophy.target;
}

export function reasonFor(trophy, state) {
  if (trophy.missable) return 'Missable — the Chapter 1 balcony spot closes when Chapter 1 ends';
  if (trophy.target) {
    const done = counterOf(state, trophy);
    if (done > 0) return 'Counter under way: ' + fmtValue(trophy, done) + ' of ' + fmtValue(trophy, trophy.target) + ' ' + (trophy.unit === 'money' ? '' : trophy.unit).trim();
    return 'Counter not started: ' + fmtValue(trophy, trophy.target) + ' ' + (trophy.unit === 'money' ? 'to go' : trophy.unit + ' to go');
  }
  if (trophy.kind === 'story') return 'Stage ' + trophy.stage + ' — story progress unlocks it as you play';
  if (trophy.missableNote) return 'Stage ' + trophy.stage + ' — carries a permanent-choice caution';
  return 'Stage ' + trophy.stage + ' of the roadmap';
}

export function nextUp(trophies, state, limit = 10) {
  const candidates = trophies.filter(
    (trophy) => trophy.kind !== 'platinum' && !isEarned(trophy, trophies, state),
  );
  candidates.sort((a, b) => {
    if (a.missable !== b.missable) return a.missable ? -1 : 1;
    if (a.stage !== b.stage) return a.stage - b.stage;
    const ratioDiff = progressRatio(b, state) - progressRatio(a, state);
    if (ratioDiff !== 0) return ratioDiff;
    const gradeDiff = (GRADE_WEIGHT[b.grade] || 0) - (GRADE_WEIGHT[a.grade] || 0);
    if (gradeDiff !== 0) return gradeDiff;
    return a.id - b.id;
  });
  return candidates.slice(0, limit).map((trophy) => ({ trophy, reason: reasonFor(trophy, state) }));
}
