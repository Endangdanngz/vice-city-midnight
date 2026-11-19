// store.js — the tracker's saved state: earned flags, PSN counters, per-trophy notes,
// the spoiler setting and the save-habit checklist, all kept in localStorage, with a
// validated export/import so progress can move between browsers as a JSON file.

export const STORAGE_KEY = 'vice-city-midnight/v1';
export const EXPORT_APP_ID = 'vice-city-midnight';

export function blankState() {
  return {
    earned: {},    // trophy id -> true
    counters: {},  // trophy id -> number logged toward its PSN target
    notes: {},     // trophy id -> the player's own note
    spoiler: true, // spoiler protection starts ON: hidden trophies stay masked
    habits: {},    // save-habit checklist key -> true
  };
}

export function isPlatinumEarned(trophies, state) {
  const others = trophies.filter((t) => t.kind !== 'platinum');
  return others.every((t) => state.earned[t.id] === true);
}

export function isEarned(trophy, trophies, state) {
  if (trophy.kind === 'platinum') return isPlatinumEarned(trophies, state);
  return state.earned[trophy.id] === true;
}

export function counterOf(state, trophy) {
  const n = Number(state.counters[trophy.id]);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function createStore(trophies, { persist = true } = {}) {
  let state = blankState();
  if (persist) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) state = { ...blankState(), ...JSON.parse(raw) };
    } catch {
      state = blankState();
    }
  }

  function save() {
    if (!persist) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full or blocked: the tracker keeps working in memory.
    }
  }

  return {
    get state() {
      return state;
    },

    toggleEarned(trophy) {
      if (trophy.kind === 'platinum') return; // the Platinum is automatic, never toggled
      if (state.earned[trophy.id]) {
        delete state.earned[trophy.id];
      } else {
        state.earned[trophy.id] = true;
        if (trophy.target) state.counters[trophy.id] = trophy.target;
      }
      save();
    },

    setCounter(trophy, value) {
      if (!trophy.target) return;
      const n = Math.max(0, Math.min(trophy.target, Math.floor(Number(value) || 0)));
      if (n > 0) state.counters[trophy.id] = n;
      else delete state.counters[trophy.id];
      // The counter is the source of truth for a counted trophy.
      if (n >= trophy.target) state.earned[trophy.id] = true;
      else delete state.earned[trophy.id];
      save();
    },

    setNote(id, text) {
      const clean = String(text || '').slice(0, 2000);
      if (clean.trim()) state.notes[id] = clean;
      else delete state.notes[id];
      save();
    },

    setSpoiler(on) {
      state.spoiler = on === true;
      save();
    },

    toggleHabit(key) {
      if (state.habits[key]) delete state.habits[key];
      else state.habits[key] = true;
      save();
    },

    replace(nextState) {
      state = { ...blankState(), ...nextState };
      save();
    },

    reset() {
      state = blankState();
      if (persist) {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // Nothing to remove.
        }
      }
    },
  };
}

// ---- Export / import -------------------------------------------------------

export function buildExport(state) {
  return {
    app: EXPORT_APP_ID,
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: Object.keys(state.earned).map(Number).sort((a, b) => a - b),
    counters: { ...state.counters },
    notes: { ...state.notes },
    spoiler: state.spoiler === true,
    habits: { ...state.habits },
  };
}

// Returns { ok: true, state } or { ok: false, error }. A file that is not a
// Vice City Midnight export — or that carries anything malformed — is refused
// whole; progress is never half-imported.
export function validateImport(parsed, trophies) {
  const fail = (error) => ({ ok: false, error });
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return fail('That file is not a Vice City Midnight progress export.');
  }
  if (parsed.app !== EXPORT_APP_ID || parsed.version !== 1) {
    return fail('That file is not a Vice City Midnight progress export.');
  }
  const validIds = new Set(trophies.map((t) => t.id));
  const byId = new Map(trophies.map((t) => [t.id, t]));

  if (!Array.isArray(parsed.earned)) return fail('The export\u2019s earned list is malformed.');
  const earned = {};
  for (const id of parsed.earned) {
    if (!Number.isInteger(id) || !validIds.has(id)) return fail('The export names a trophy this guide does not hold.');
    if (byId.get(id).kind !== 'platinum') earned[id] = true; // the Platinum re-derives itself
  }

  const counters = {};
  if (parsed.counters !== undefined) {
    if (!parsed.counters || typeof parsed.counters !== 'object' || Array.isArray(parsed.counters)) {
      return fail('The export\u2019s counters are malformed.');
    }
    for (const [key, value] of Object.entries(parsed.counters)) {
      const id = Number(key);
      const trophy = byId.get(id);
      if (!Number.isInteger(id) || !trophy || !trophy.target) return fail('The export holds a counter for a trophy without one.');
      if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return fail('The export holds a counter that is not a number.');
      const clamped = Math.min(trophy.target, Math.floor(value));
      if (clamped > 0) counters[id] = clamped;
      if (clamped >= trophy.target) earned[id] = true;
    }
  }

  const notes = {};
  if (parsed.notes !== undefined) {
    if (!parsed.notes || typeof parsed.notes !== 'object' || Array.isArray(parsed.notes)) {
      return fail('The export\u2019s notes are malformed.');
    }
    for (const [key, value] of Object.entries(parsed.notes)) {
      const id = Number(key);
      if (!Number.isInteger(id) || !validIds.has(id) || typeof value !== 'string') {
        return fail('The export holds a note that does not belong to a trophy.');
      }
      notes[id] = value.slice(0, 2000);
    }
  }

  const habits = {};
  if (parsed.habits !== undefined) {
    if (!parsed.habits || typeof parsed.habits !== 'object' || Array.isArray(parsed.habits)) {
      return fail('The export\u2019s habit checklist is malformed.');
    }
    for (const [key, value] of Object.entries(parsed.habits)) {
      if (value === true) habits[String(key).slice(0, 64)] = true;
    }
  }

  return {
    ok: true,
    state: {
      earned,
      counters,
      notes,
      spoiler: parsed.spoiler !== false,
      habits,
    },
  };
}

// The fixed demo state behind ?seed=demo: a believable mid-run file — 13 of 55
// earned, several counters part-way, a note on the missable trophy — so the
// screenshots show the tracker as a player would actually see it.
export function demoState() {
  const state = blankState();
  for (const id of [2, 3, 8, 9, 16, 20, 21, 33, 39, 41, 44, 45, 51]) state.earned[id] = true;
  Object.assign(state.counters, {
    15: 137, // Cunning Stunts, of 250
    16: 9,   // Master of None, complete
    17: 12,  // The Shootist, of 42
    28: 7,   // Positive Mental Attitude, of 18
    31: 41,  // You WAiNKer!, of 100
    34: 1,   // Retail Therapy, of 3
    35: 63,  // Whip It Good, of 100
    52: 86500, // Dime on the Dollar, of $250,000
  });
  state.notes[28] = 'Balcony spot done in Chapter 1 — 7 of 18 spots so far.';
  state.spoiler = true;
  state.habits['save-chapter-start'] = true;
  state.habits['balcony-chapter-1'] = true;
  return state;
}
