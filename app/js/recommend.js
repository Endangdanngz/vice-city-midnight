// recommend.js — the Next Up planner's ordering: the missable first, then the
// roadmap's stage order, and inside a stage the counter nearest completion
// first. Every pick carries a one-line reason, and names stay spoiler-safe.

import { counterOf, isEarned } from './store.js';
import { displayName, isMasked } from './filters.js';

function reasonFor(state, trophies, trophy) {
  if (trophy.missable) {
    return 'Potentially missable — the Chapter 1 balcony spot vanishes when Chapter 1 ends. Do it first.';
  }
  if (trophy.id === 48) {
    return 'Its choices are permanent: pushing the Criminal Profile to Irredeemable cannot be undone.';
  }
  if (trophy.target) {
    const value = counterOf(state, trophy);
    if (value > 0) {
      return 'Counter already moving — ' + value.toLocaleString('en-US') + ' of ' + trophy.target.toLocaleString('en-US') + '. Nearest finishes first.';
    }
    return 'A counter trophy in stage ' + trophy.stage + ' — start it now and it fills in as you play.';
  }
  if (trophy.kind === 'story') return 'Next in the roadmap\u2019s stage order — story progress unlocks everything else.';
  if (trophy.kind === 'partner') return 'Needs Jason and Lucia together, playable from Chapter 2.';
  if (trophy.kind === 'platinum') return 'Automatic at 54 of 54 — it lights itself when the rest are done.';
  return 'Stage ' + trophy.stage + ' of the roadmap — clear it while you are in the area.';
}

export function nextUp(state, trophies, limit) {
  const remaining = trophies.filter((t) => !isEarned(state, trophies, t));
  const scored = remaining.map((trophy) => {
    const ratio = trophy.target ? counterOf(state, trophy) / trophy.target : -1;
    return { trophy, ratio };
  });
  scored.sort((a, b) => {
    if (a.trophy.missable !== b.trophy.missable) return a.trophy.missable ? -1 : 1;
    if (a.trophy.stage !== b.trophy.stage) return a.trophy.stage - b.trophy.stage;
    if (b.ratio !== a.ratio) return b.ratio - a.ratio;
    return a.trophy.id - b.trophy.id;
  });
  return scored.slice(0, limit || 12).map(({ trophy }) => ({
    trophy,
    name: displayName(state, trophies, trophy),
    masked: isMasked(state, trophies, trophy),
    reason: isMasked(state, trophies, trophy)
      ? 'A hidden trophy in stage ' + trophy.stage + ' — spoiler protection keeps its name covered until it is earned.'
      : reasonFor(state, trophies, trophy),
  }));
}
