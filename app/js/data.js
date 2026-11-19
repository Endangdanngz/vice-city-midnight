// data.js — loads the trophy catalogue (the only file the app fetches, and it is
// a relative path inside app/) and holds the roadmap's cited facts.

export const KIND_LABELS = {
  story: 'Story',
  collectibles: 'Collectibles',
  activities: 'Activities',
  crime: 'Crime',
  world: 'World',
  partner: 'Partner',
  platinum: 'Platinum',
};

export const KIND_ORDER = ['story', 'collectibles', 'activities', 'crime', 'world', 'partner', 'platinum'];

export const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

export const STAGES = [
  {
    n: 1,
    name: 'The Chapter Run',
    tagline: 'Story first — and the one missable before Chapter 1 ends',
    detail:
      'Play the campaign in order: the chapter and mission trophies, the stranger-strand finales and Bret\u2019s hunt. ' +
      'Positive Mental Attitude belongs to this stage even though it is a collectible, because its Lucia\u2019s-balcony ' +
      'meditation spot exists only during Chapter 1. Keep a manual save at the start of every chapter and one before ' +
      'the final mission — the game has no mission replay.',
  },
  {
    n: 2,
    name: 'Two of Us & One-Off Moments',
    tagline: 'Partner plays and the world\u2019s single-scene trophies',
    detail:
      'With both Jason and Lucia playable from Chapter 2, clear the partner trophies and the one-off world moments: ' +
      'the Ocean Beach cocktail, the showroom smash, the bowling alley, the airport departure. The two money counters ' +
      'that live in the world — spending in shops and the Criminal Profile choices — tick along here too.',
  },
  {
    n: 3,
    name: 'The Long Grinds',
    tagline: 'Counters, collectibles and crimes, done steadily',
    detail:
      'The grind stage: 250 stunts, 42 shooting-range golds, 100 WAiNK locations, 100 vehicles, card sets, bank ' +
      'vaults and the laundering total. None of these is missable and all of them reward steady progress over ' +
      'single-session grinding — log the counters after every session.',
  },
  {
    n: 4,
    name: '100% & The Platinum',
    tagline: 'A Long Road, then Vice Got a Price! lights itself',
    detail:
      'Finish the 100% completion checklist for A Long Road. The Platinum, Vice Got a Price!, has no task of its ' +
      'own: it unlocks automatically the moment the other 54 are earned, and this tracker lights it for you.',
  },
];

// Facts the roadmap states, each with the source it comes from. Nothing here is
// asserted without a citation.
export const ROADMAP_FACTS = [
  {
    text: 'The story alone runs about 60 hours, and the full Platinum is estimated at roughly 200 hours.',
    source: 'Reviews via PlanetGTA6; PowerPyx estimate via GTA-Zone',
  },
  {
    text: 'Platinum difficulty is rated 4 out of 10 — a long list, not a hard one.',
    source: 'PowerPyx, via GTA-Zone',
  },
  {
    text: 'No online trophies, no difficulty trophies and no mission medals anywhere in the 55.',
    source: 'Output Lag; GTA-Zone',
  },
  {
    text: 'Exactly one trophy is flagged potentially missable: Positive Mental Attitude (a Chapter 1 meditation spot). Nothing on the 100% checklist is missable.',
    source: 'PowerPyx via GTA-Zone; Output Lag',
  },
  {
    text: 'Several trophies need Jason and Lucia together; most of the list opens once both are playable in Chapter 2.',
    source: 'Output Lag',
  },
  {
    text: 'Cheats disable trophies and saving, and every cheat only unlocks after the story — keep them off a Platinum run.',
    source: 'PowerPyx, GameSpot and PC Gamer, via PlanetGTA6',
  },
  {
    text: 'The Xbox list is identical: the same 55 achievements, worth 1,000 Gamerscore.',
    source: 'PlanetGTA6; GTA-Zone',
  },
  {
    text: '55 trophies in all: 1 platinum, 2 gold, 6 silver, 46 bronze — 28 of them hidden on PlayStation until earned.',
    source: 'Exophase; PSNProfiles',
  },
];

export const SAVE_HABITS = [
  'Make a manual save at the start of every chapter.',
  'Meditate on Lucia\u2019s balcony during Chapter 1, before the chapter ends.',
  'Make a manual save before the final mission.',
  'Never rely on autosave alone — there is no mission replay.',
  'Keep cheats off: they disable trophies and saving.',
];

let catalogue = null;

export async function loadCatalogue() {
  if (catalogue) return catalogue;
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error('Could not load data/trophies.json (' + response.status + ')');
  catalogue = await response.json();
  return catalogue;
}

export function trophiesOf(data) {
  return data.trophies;
}

export function trophyById(data, id) {
  return data.trophies.find((t) => t.id === id) || null;
}
