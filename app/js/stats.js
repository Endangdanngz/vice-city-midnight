// stats.js — every roll-up the dashboard, roadmap and planner show: totals,
// per-grade and per-kind progress, per-stage progress, and the Platinum line.

import { GRADE_ORDER, KIND_ORDER, STAGES } from './data.js';
import { PLATINUM_ID, counterOf, isEarned } from './store.js';

export function computeStats(state, trophies) {
  const earnedFlags = new Map(trophies.map((t) => [t.id, isEarned(state, trophies, t)]));
  const earnedCount = trophies.filter((t) => earnedFlags.get(t.id)).length;

  const byGrade = GRADE_ORDER.map((grade) => {
    const inGrade = trophies.filter((t) => t.grade === grade);
    return {
      grade,
      total: inGrade.length,
      earned: inGrade.filter((t) => earnedFlags.get(t.id)).length,
    };
  });

  const byKind = KIND_ORDER.map((kind) => {
    const inKind = trophies.filter((t) => t.kind === kind);
    return {
      kind,
      total: inKind.length,
      earned: inKind.filter((t) => earnedFlags.get(t.id)).length,
    };
  }).filter((row) => row.total > 0);

  const byStage = STAGES.map((stage) => {
    const inStage = trophies.filter((t) => t.stage === stage.n);
    return {
      stage,
      total: inStage.length,
      earned: inStage.filter((t) => earnedFlags.get(t.id)).length,
    };
  });

  const others = trophies.filter((t) => t.id !== PLATINUM_ID);
  const othersEarned = others.filter((t) => earnedFlags.get(t.id)).length;

  const counters = trophies
    .filter((t) => t.target)
    .map((t) => ({
      trophy: t,
      value: counterOf(state, t),
      ratio: Math.min(1, counterOf(state, t) / t.target),
      complete: earnedFlags.get(t.id),
    }));

  return {
    total: trophies.length,
    earnedCount,
    remaining: trophies.length - earnedCount,
    byGrade,
    byKind,
    byStage,
    earnedFlags,
    counters,
    platinum: {
      earned: earnedFlags.get(PLATINUM_ID),
      othersEarned,
      othersTotal: others.length,
    },
    missablesOpen: trophies.filter((t) => t.missable && !earnedFlags.get(t.id)).length,
  };
}
