// filters.js — the checklist's combined filters: text search, kind, grade,
// status and the missable-only switch. All of them apply together.

import { isEarned } from './store.js';

export function defaultFilters() {
  return { query: '', kind: 'all', grade: 'all', status: 'all', missableOnly: false };
}

export function trophyMatches(trophy, state, trophies, filters) {
  if (filters.kind !== 'all' && trophy.kind !== filters.kind) return false;
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  if (filters.missableOnly && !trophy.missable) return false;
  const earned = isEarned(state, trophies, trophy);
  if (filters.status === 'earned' && !earned) return false;
  if (filters.status === 'remaining' && earned) return false;
  const query = filters.query.trim().toLowerCase();
  if (query) {
    const haystack = (trophy.name + ' ' + trophy.description + ' ' + trophy.guide + ' ' + trophy.kind).toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  return true;
}

export function applyFilters(trophies, state, filters) {
  return trophies.filter((t) => trophyMatches(t, state, trophies, filters));
}

// Spoiler protection: a hidden trophy the player has not earned yet is masked
// while the setting is on. Earned hidden trophies are never masked.
export function isMasked(state, trophies, trophy) {
  return Boolean(state.spoilers && trophy.hidden && !isEarned(state, trophies, trophy));
}

export function displayName(state, trophies, trophy) {
  return isMasked(state, trophies, trophy) ? 'Hidden trophy' : trophy.name;
}

export function displayDescription(state, trophies, trophy) {
  return isMasked(state, trophies, trophy)
    ? 'Hidden on PlayStation until earned — spoiler protection is on.'
    : trophy.description;
}
