// store.js — the player's progress, kept in localStorage: which trophies are
// earned, the PSN counters, per-trophy notes, the spoiler setting and the
// save-habit ticks. Also the demo seed used by the screenshot mode, and the
// export / import of a progress file with strict validation.

export const STORAGE_KEY = 'vice-city-midnight/v1';
export const EXPORT_APP = 'vice-city-midnight-trophy-tracker';
export const PLATINUM_ID = 1;

export function emptyState() {
  return { earned: {}, counters: {}, notes: {}, spoilers: true, habits: {} };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return emptyState();
    return {
      earned: parsed.earned && typeof parsed.earned === 'object' ? parsed.earned : {},
      counters: parsed.counters && typeof parsed.counters === 'object' ? parsed.counters : {},
      notes: parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {},
      spoilers: parsed.spoilers !== false,
      habits: parsed.habits && typeof parsed.habits === 'object' ? parsed.habits : {},
    };
  } catch {
    return emptyState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full or unavailable: the in-memory state still works */
  }
}

export function counterOf(state, trophy) {
  const v = Number(state.counters[trophy.id]);
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : 0;
}

export function counterComplete(state, trophy) {
  return Boolean(trophy.target) && counterOf(state, trophy) >= trophy.target;
}

// A trophy counts as earned when it is ticked, or when its PSN counter reaches
// the target. The Platinum has no tick of its own: it is earned exactly when
// every other trophy is earned, and revokes the moment one is removed.
export function isEarned(state, trophies, trophy) {
  if (trophy.id === PLATINUM_ID) {
    return trophies.every((t) => t.id === PLATINUM_ID || isEarnedDirect(state, t));
  }
  return isEarnedDirect(state, trophy);
}

function isEarnedDirect(state, trophy) {
  return state.earned[trophy.id] === true || counterComplete(state, trophy);
}

export function setEarned(state, trophy, on) {
  if (trophy.id === PLATINUM_ID) return; // automatic; see isEarned
  if (trophy.target) {
    // Keep tick and counter in step: ticking fills the counter, unticking clears it.
    state.counters[trophy.id] = on ? trophy.target : 0;
  }
  if (on) state.earned[trophy.id] = true;
  else delete state.earned[trophy.id];
}

export function setCounter(state, trophy, value) {
  const n = Math.max(0, Math.floor(Number(value) || 0));
  state.counters[trophy.id] = n;
  if (trophy.target && n >= trophy.target) state.earned[trophy.id] = true;
  else if (trophy.target) delete state.earned[trophy.id];
}

export function setNote(state, trophy, text) {
  const trimmed = String(text || '');
  if (trimmed) state.notes[trophy.id] = trimmed;
  else delete state.notes[trophy.id];
}

// The fixed demo state the screenshot mode seeds: 13 of 55 earned, the big
// counters part-way, spoiler protection on.
export function demoState() {
  const state = emptyState();
  state.spoilers = true;
  const earnedIds = [2, 3, 8, 20, 21, 33, 36, 39, 41, 44, 45, 46, 51];
  for (const id of earnedIds) state.earned[id] = true;
  const counters = { 15: 96, 16: 6, 17: 18, 19: 7, 25: 3, 28: 5, 31: 37, 32: 21, 35: 41, 48: 132, 52: 87500, 53: 34200 };
  for (const [id, value] of Object.entries(counters)) state.counters[id] = value;
  state.notes[28] = 'Balcony spot done in Chapter 1 — 13 spots still to find.';
  state.habits = { 0: true, 1: true };
  return state;
}

export function exportPayload(state) {
  return JSON.stringify(
    {
      app: EXPORT_APP,
      version: 1,
      exportedFrom: 'Vice City Midnight — GTA VI trophy tracker',
      earned: Object.keys(state.earned).filter((k) => state.earned[k]).map(Number).sort((a, b) => a - b),
      counters: state.counters,
      notes: state.notes,
      spoilers: state.spoilers,
      habits: state.habits,
    },
    null,
    2,
  );
}

// Validate an imported progress file against the catalogue. Returns
// { ok: true, state } or { ok: false, error } — foreign or malformed files
// are refused whole, never half-applied.
export function parseImport(text, trophies) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: 'That file is not valid JSON.' };
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, error: 'That file is not a progress file.' };
  }
  if (parsed.app !== EXPORT_APP) {
    return { ok: false, error: 'That file was not exported by Vice City Midnight — import refused.' };
  }
  const known = new Set(trophies.map((t) => t.id));
  const byId = new Map(trophies.map((t) => [t.id, t]));
  const state = emptyState();

  if (!Array.isArray(parsed.earned)) return { ok: false, error: 'Progress file is missing its earned list.' };
  for (const id of parsed.earned) {
    if (!Number.isInteger(id) || !known.has(id)) {
      return { ok: false, error: 'Progress file names an unknown trophy id: ' + String(id) };
    }
    if (id !== PLATINUM_ID) state.earned[id] = true; // the Platinum is derived, never stored
  }
  if (parsed.counters !== undefined) {
    if (!parsed.counters || typeof parsed.counters !== 'object' || Array.isArray(parsed.counters)) {
      return { ok: false, error: 'Progress file has a malformed counters section.' };
    }
    for (const [key, value] of Object.entries(parsed.counters)) {
      const id = Number(key);
      if (!Number.isInteger(id) || !known.has(id) || !byId.get(id).target) {
        return { ok: false, error: 'Progress file has a counter for an unknown trophy: ' + key };
      }
      if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
        return { ok: false, error: 'Progress file has a bad counter value for trophy ' + key };
      }
      state.counters[id] = Math.floor(value);
    }
  }
  if (parsed.notes !== undefined) {
    if (!parsed.notes || typeof parsed.notes !== 'object' || Array.isArray(parsed.notes)) {
      return { ok: false, error: 'Progress file has a malformed notes section.' };
    }
    for (const [key, value] of Object.entries(parsed.notes)) {
      const id = Number(key);
      if (!Number.isInteger(id) || !known.has(id) || typeof value !== 'string') {
        return { ok: false, error: 'Progress file has a malformed note for trophy ' + key };
      }
      if (value) state.notes[id] = value;
    }
  }
  if (parsed.spoilers !== undefined) state.spoilers = parsed.spoilers !== false;
  if (parsed.habits && typeof parsed.habits === 'object' && !Array.isArray(parsed.habits)) {
    for (const [key, value] of Object.entries(parsed.habits)) {
      if (value === true) state.habits[key] = true;
    }
  }
  return { ok: true, state };
}
