// The Next Up planner: which trophies to chase next, and why. Rules, in
// order: the one missable trophy outranks everything while it is
// unearned; then the earliest roadmap stage wins; inside a stage, a
// counter that is already moving beats a fresh start, and the counter
// nearest completion comes first. Masked (spoiler-hidden) trophies are
// never recommended by name.

import { counterOf, isEarned } from "./store.js";
import { isMasked } from "./filters.js";

export function counterRatio(trophy, state) {
  if (!trophy.target) return -1;
  return counterOf(trophy, state) / trophy.target;
}

export function formatCount(trophy, value) {
  if (trophy.unit === "$") return `$${value.toLocaleString("en-US")}`;
  return value.toLocaleString("en-US");
}

function reasonFor(trophy, state) {
  if (trophy.missable) {
    return "Missable — the Chapter 1 meditation spot cannot be recovered later. Do it now.";
  }
  if (trophy.target) {
    const now = counterOf(trophy, state);
    if (now > 0) {
      return `Stage ${trophy.stage} · already at ${formatCount(trophy, now)} of ${formatCount(trophy, trophy.target)} — nearest finish first.`;
    }
    return `Stage ${trophy.stage} · a long counter (${formatCount(trophy, trophy.target)} in total) — starting early beats grinding late.`;
  }
  if (trophy.kind === "story") return `Stage ${trophy.stage} · story progress unlocks the rest of the list.`;
  if (trophy.kind === "partner") return `Stage ${trophy.stage} · needs Jason and Lucia together — grab it in free roam.`;
  return `Stage ${trophy.stage} · a quick one-off that also feeds the 100% checklist.`;
}

export function nextUp(trophies, state, limit = 8) {
  const candidates = trophies.filter(
    (trophy) =>
      trophy.id !== 1 && !isEarned(trophy, state, trophies) && !isMasked(trophy, state, trophies),
  );
  const sorted = [...candidates].sort((a, b) => {
    if (a.missable !== b.missable) return a.missable ? -1 : 1;
    if (a.stage !== b.stage) return a.stage - b.stage;
    const ratioDiff = counterRatio(b, state) - counterRatio(a, state);
    if (ratioDiff !== 0) return ratioDiff;
    return a.id - b.id;
  });
  return sorted.slice(0, limit).map((trophy) => ({ trophy, reason: reasonFor(trophy, state) }));
}
