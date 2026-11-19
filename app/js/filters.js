// Search, the combined filters, and the spoiler rule. The spoiler rule:
// while spoiler protection is on, a hidden trophy that has not been
// earned yet is masked — its name and description are replaced, and its
// guide stays shut — so a player can browse the whole list safely.
// Earning a hidden trophy reveals it everywhere.

import { isEarned } from "./store.js";

export function defaultFilters() {
  return { query: "", kind: "all", grade: "all", status: "all", missableOnly: false };
}

export function isMasked(trophy, state, trophies) {
  return trophy.hidden && state.settings.spoilers && !isEarned(trophy, state, trophies);
}

export function displayName(trophy, state, trophies) {
  return isMasked(trophy, state, trophies) ? "Hidden trophy" : trophy.name;
}

export function displayDescription(trophy, state, trophies) {
  return isMasked(trophy, state, trophies)
    ? "Hidden on PlayStation until earned. Spoiler protection is on."
    : trophy.description;
}

export function applyFilters(trophies, state, filters) {
  const query = filters.query.trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (filters.kind !== "all" && trophy.kind !== filters.kind) return false;
    if (filters.grade !== "all" && trophy.grade !== filters.grade) return false;
    if (filters.missableOnly && !trophy.missable) return false;
    const earned = isEarned(trophy, state, trophies);
    if (filters.status === "earned" && !earned) return false;
    if (filters.status === "remaining" && earned) return false;
    if (query.length > 0) {
      if (isMasked(trophy, state, trophies)) return false;
      const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}
