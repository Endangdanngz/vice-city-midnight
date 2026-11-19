// stats.js — turns the saved state into the dashboard's numbers: totals, the
// Platinum line, and earned/total roll-ups per grade, per kind and per stage.

import { GRADE_ORDER, KIND_ORDER } from './data.js';
import { counterOf, isEarned } from './store.js';

export function computeStats(trophies, state) {
  const perGrade = {};
  for (const grade of GRADE_ORDER) perGrade[grade] = { earned: 0, total: 0 };
  const perKind = {};
  for (const kind of KIND_ORDER) perKind[kind] = { earned: 0, total: 0 };
  const perStage = { 1: { earned: 0, total: 0 }, 2: { earned: 0, total: 0 }, 3: { earned: 0, total: 0 }, 4: { earned: 0, total: 0 } };

  let earnedTotal = 0;
  let earnedOthers = 0;
  let countersInProgress = 0;

  for (const trophy of trophies) {
    const earned = isEarned(trophy, trophies, state);
    perGrade[trophy.grade].total += 1;
    perKind[trophy.kind].total += 1;
    perStage[trophy.stage].total += 1;
    if (earned) {
      earnedTotal += 1;
      perGrade[trophy.grade].earned += 1;
      perKind[trophy.kind].earned += 1;
      perStage[trophy.stage].earned += 1;
      if (trophy.kind !== 'platinum') earnedOthers += 1;
    } else if (trophy.target && counterOf(state, trophy) > 0) {
      countersInProgress += 1;
    }
  }

  const othersTotal = trophies.length - 1;
  return {
    earnedTotal,
    total: trophies.length,
    pct: trophies.length ? Math.round((earnedTotal / trophies.length) * 100) : 0,
    earnedOthers,
    othersTotal,
    platinumEarned: earnedOthers === othersTotal,
    remainingForPlatinum: othersTotal - earnedOthers,
    countersInProgress,
    perGrade,
    perKind,
    perStage,
  };
}
