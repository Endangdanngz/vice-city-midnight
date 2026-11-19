// Dashboard mathematics: totals, per-grade and per-kind progress, and
// the Platinum readiness calculation. Pure functions of the trophy list
// and the tracker state — the header, the roadmap roll-ups and the
// planner all read from here so the numbers can never disagree.

import { GRADES, KINDS } from "./data.js";
import { PLATINUM_ID, isEarned } from "./store.js";

export function computeStats(trophies, state) {
  const total = trophies.length;
  const earnedIds = new Set(
    trophies.filter((t) => isEarned(t, state, trophies)).map((t) => t.id),
  );
  const earned = earnedIds.size;
  const others = trophies.filter((t) => t.id !== PLATINUM_ID);
  const othersEarned = others.filter((t) => state.earned[t.id] === true).length;
  const perGrade = {};
  for (const grade of GRADES) {
    const inGrade = trophies.filter((t) => t.grade === grade);
    perGrade[grade] = {
      earned: inGrade.filter((t) => earnedIds.has(t.id)).length,
      total: inGrade.length,
    };
  }
  const perKind = {};
  for (const kind of KINDS) {
    const inKind = trophies.filter((t) => t.kind === kind.id);
    perKind[kind.id] = {
      earned: inKind.filter((t) => earnedIds.has(t.id)).length,
      total: inKind.length,
    };
  }
  return {
    total,
    earned,
    remaining: total - earned,
    percent: total === 0 ? 0 : Math.round((earned / total) * 100),
    othersEarned,
    othersTotal: others.length,
    platinumReady: othersEarned === others.length,
    perGrade,
    perKind,
  };
}

export function stageProgress(trophies, state, stage) {
  const inStage = trophies.filter((t) => t.stage === stage);
  return {
    earned: inStage.filter((t) => isEarned(t, state, trophies)).length,
    total: inStage.length,
    trophies: inStage,
  };
}
