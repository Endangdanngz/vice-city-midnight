// data.js — loads the trophy database and holds the labels the views share.

export const GRADE_LABELS = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};

export const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

export const KIND_LABELS = {
  story: 'Story',
  collectibles: 'Collectibles',
  activities: 'Activities',
  crime: 'Crime',
  world: 'World & One-Offs',
  partner: 'Partner',
  platinum: 'Platinum',
};

export const KIND_ORDER = ['story', 'collectibles', 'activities', 'crime', 'world', 'partner', 'platinum'];

// The four roadmap stages. Titles and blurbs are this guide's own words, built from the
// official trophy descriptions and the cited roadmap facts shown in the Roadmap view.
export const STAGE_INFO = {
  1: {
    title: 'Stage 1 — The Story, and the One Warning',
    blurb: 'Play the story: chapters 1 to 4, the named missions, the contact strands and the final mission. Reviews put the story at roughly 60 hours. One thing cannot wait: the meditation spot on Lucia\u2019s balcony exists only during Chapter 1, so use it before the chapter ends.',
  },
  2: {
    title: 'Stage 2 — Two of You, One City',
    blurb: 'Both Jason and Lucia are playable from Chapter 2, which unlocks the partner trophies and most of the world list. Sweep the one-off world trophies and the partner jobs while the map is fresh and travel is still a pleasure.',
  },
  3: {
    title: 'Stage 3 — The Long Counters',
    blurb: 'The grind stage: stunts, shooting-range golds, races, strands, collectibles and the crime counters. None of it is hard — PowerPyx rates the Platinum 4/10 — but all of it takes time, so log progress in the counters as you go rather than in one sweep.',
  },
  4: {
    title: 'Stage 4 — 100% and the Platinum',
    blurb: 'Close out the 100% completion checklist for A Long Road, and Vice Got a Price! follows on its own the moment the other 54 are earned. Total time for the Platinum is estimated at roughly 200 hours.',
  },
};

export async function loadTrophies() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error('Could not load data/trophies.json (' + response.status + ')');
  const data = await response.json();
  const trophies = Array.isArray(data) ? data : data.trophies;
  if (!Array.isArray(trophies) || trophies.length === 0) throw new Error('data/trophies.json holds no trophies');
  return trophies;
}

export function trophyById(trophies, id) {
  return trophies.find((t) => t.id === id) || null;
}

export function platinumTrophy(trophies) {
  return trophies.find((t) => t.kind === 'platinum') || null;
}
