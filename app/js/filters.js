// filters.js — the checklist's combined filters (search, kind, grade, status,
// missable-only) and the spoiler rule every view shares: with spoiler protection
// on, a hidden trophy that is not yet earned shows neither its name nor its
// description anywhere — list, roadmap, planner or search results.

import { counterOf, isEarned } from './store.js';

export function isMasked(trophy, trophies, state) {
  return state.spoiler === true && trophy.hidden === true && !isEarned(trophy, trophies, state);
}

export function displayName(trophy, trophies, state) {
  return isMasked(trophy, trophies, state) ? 'Hidden Trophy' : trophy.name;
}

export function displayDescription(trophy, trophies, state) {
  return isMasked(trophy, trophies, state)
    ? 'Hidden on PlayStation until earned — spoiler protection is on.'
    : trophy.description;
}

export function statusOf(trophy, trophies, state) {
  if (isEarned(trophy, trophies, state)) return 'earned';
  if (trophy.target && counterOf(state, trophy) > 0) return 'in-progress';
  return 'unearned';
}

// ui: { query, kind, grade, status, missableOnly }
export function applyFilters(trophies, state, ui) {
  const query = (ui.query || '').trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (ui.kind && ui.kind !== 'all' && trophy.kind !== ui.kind) return false;
    if (ui.grade && ui.grade !== 'all' && trophy.grade !== ui.grade) return false;
    if (ui.missableOnly && !trophy.missable) return false;
    if (ui.status && ui.status !== 'all' && statusOf(trophy, trophies, state) !== ui.status) return false;
    if (query) {
      // A masked trophy is searched by what the player can actually see, so the
      // search box can never leak a hidden name the spoiler setting is hiding.
      const haystack = (displayName(trophy, trophies, state) + ' ' + displayDescription(trophy, trophies, state)).toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}
