// Tracker state: what is earned, the PSN progress counters, the player's
// own notes, and settings — kept in localStorage, exportable to a JSON
// file, importable back with validation, and resettable behind a
// confirmation step in the UI. The Platinum trophy is special: it is
// never ticked by hand, it is earned by earning the other 54.

export const STORAGE_KEY = "vice-city-midnight/v1";
export const EXPORT_APP = "vice-city-midnight";
export const PLATINUM_ID = 1;

export function defaultState() {
  return {
    version: 1,
    earned: {},
    counters: {},
    notes: {},
    settings: { spoilers: true },
  };
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateState(raw) {
  if (!isPlainObject(raw)) return { ok: false, error: "the file is not a progress object" };
  if (raw.app !== undefined && raw.app !== EXPORT_APP) {
    return { ok: false, error: "this file was not exported by Vice City Midnight" };
  }
  for (const field of ["earned", "counters", "notes"]) {
    if (raw[field] !== undefined && !isPlainObject(raw[field])) {
      return { ok: false, error: `"${field}" is not an object` };
    }
  }
  const state = defaultState();
  for (const [key, value] of Object.entries(raw.earned ?? {})) {
    const id = Number(key);
    if (Number.isInteger(id) && value === true) state.earned[id] = true;
  }
  for (const [key, value] of Object.entries(raw.counters ?? {})) {
    const id = Number(key);
    if (Number.isInteger(id) && typeof value === "number" && Number.isFinite(value) && value >= 0) {
      state.counters[id] = Math.floor(value);
    }
  }
  for (const [key, value] of Object.entries(raw.notes ?? {})) {
    const id = Number(key);
    if (Number.isInteger(id) && typeof value === "string" && value.length > 0) {
      state.notes[id] = value.slice(0, 2000);
    }
  }
  if (isPlainObject(raw.settings) && typeof raw.settings.spoilers === "boolean") {
    state.settings.spoilers = raw.settings.spoilers;
  }
  delete state.earned[PLATINUM_ID];
  return { ok: true, state };
}

export function loadState() {
  try {
    const text = localStorage.getItem(STORAGE_KEY);
    if (!text) return defaultState();
    const parsed = validateState(JSON.parse(text));
    return parsed.ok ? parsed.state : defaultState();
  } catch {
    return defaultState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable (private mode, quota). The tracker keeps
    // working in memory; the header still offers export as a backup.
  }
}

export function isEarned(trophy, state, trophies) {
  if (trophy.id === PLATINUM_ID) return platinumReady(state, trophies);
  return state.earned[trophy.id] === true;
}

export function platinumReady(state, trophies) {
  return trophies.every((t) => t.id === PLATINUM_ID || state.earned[t.id] === true);
}

export function counterOf(trophy, state) {
  return state.counters[trophy.id] ?? 0;
}

export function setCounter(state, trophy, value) {
  if (!trophy.target) return;
  const clamped = Math.max(0, Math.min(trophy.target, Math.floor(Number(value) || 0)));
  if (clamped > 0) state.counters[trophy.id] = clamped;
  else delete state.counters[trophy.id];
  if (clamped >= trophy.target) state.earned[trophy.id] = true;
  else delete state.earned[trophy.id];
}

export function setEarned(state, trophy, on) {
  if (trophy.id === PLATINUM_ID) return;
  if (on) {
    state.earned[trophy.id] = true;
    if (trophy.target) state.counters[trophy.id] = trophy.target;
  } else {
    delete state.earned[trophy.id];
    if (trophy.target && (state.counters[trophy.id] ?? 0) >= trophy.target) {
      state.counters[trophy.id] = trophy.target - 1;
    }
  }
}

export function setNote(state, id, text) {
  const trimmed = String(text ?? "").slice(0, 2000);
  if (trimmed.trim().length > 0) state.notes[id] = trimmed;
  else delete state.notes[id];
}

export function exportJSON(state) {
  return JSON.stringify(
    {
      app: EXPORT_APP,
      version: 1,
      exportedAt: new Date().toISOString(),
      earned: state.earned,
      counters: state.counters,
      notes: state.notes,
      settings: state.settings,
    },
    null,
    2,
  );
}

export function parseImport(text) {
  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: "that file is not valid JSON" };
  }
  return validateState(raw);
}

// A fixed, deterministic demo state used only for the entry's
// screenshots (?seed=demo): 13 of 55 earned, several counters part-way,
// a note on the one missable trophy, spoiler protection on.
export function demoState() {
  const state = defaultState();
  for (const id of [2, 3, 4, 8, 10, 20, 21, 22, 36, 39, 44, 45, 51]) {
    state.earned[id] = true;
  }
  state.counters = { 15: 137, 28: 6, 31: 46, 32: 21, 35: 58, 52: 97500 };
  state.notes = {
    28: "Balcony spot done in Chapter 1 — 12 spots left, sweep them in free roam.",
  };
  state.settings.spoilers = true;
  return state;
}
