// Loads the trophy database and holds the guide's editorial content:
// the kind and grade vocabularies, the four roadmap stages, the cited
// roadmap facts and the save-discipline checklist. The trophy records
// themselves live in app/data/trophies.json and are fetched from the
// app's own files — nothing is ever requested from the network.

export const GRADES = ["platinum", "gold", "silver", "bronze"];

export const GRADE_LABELS = {
  platinum: "Platinum",
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
};

export const KINDS = [
  { id: "story", label: "Story" },
  { id: "collectibles", label: "Collectibles" },
  { id: "activities", label: "Activities" },
  { id: "crime", label: "Crime & money" },
  { id: "world", label: "World & one-offs" },
  { id: "partner", label: "Partner" },
  { id: "platinum", label: "Platinum" },
];

export const KIND_LABELS = Object.fromEntries(KINDS.map((k) => [k.id, k.label]));

export const ROADMAP_STAGES = [
  {
    stage: 1,
    title: "Story first",
    blurb:
      "Play the campaign before anything else. Every story trophy is hidden and " +
      "unmissable, the chapters unlock the rest of the list, and one collectible " +
      "spot — a meditation spot on Lucia's balcony — exists only during Chapter 1. " +
      "Story first is not a preference here; it is the only safe order.",
    tips: [
      "Meditate at the Chapter 1 balcony spot before you finish Chapter 1",
      "Keep a manual save at the start of every chapter, and one before the final mission",
      "Do not touch cheats: they disable trophies and saving",
    ],
  },
  {
    stage: 2,
    title: "Partners and the open world",
    blurb:
      "With both Jason and Lucia playable from Chapter 2, the partner trophies, the " +
      "stranger strands' final missions and the one-off world moments all open up. " +
      "Work these between story sessions: they are short, varied, and several feed " +
      "the 100% checklist directly.",
    tips: [
      "Do partner trophies while the two characters are together in free roam",
      "Finish stranger strands as their markers appear — they chain over time",
      "Buy garages and register vehicles as income allows; both are slow burns",
    ],
  },
  {
    stage: 3,
    title: "Collections and the activity grind",
    blurb:
      "The counters live here: 250 stunts, 42 shooting-range golds, 100 WAiNK spots, " +
      "100 vehicles, cards, challenges and the robbery tallies. None of it is hard, " +
      "all of it is volume — the winning move is to start early and let ordinary " +
      "travel do the work, then sweep what is left region by region.",
    tips: [
      "Check the counters weekly; the nearest ones finish fastest",
      "Route collectibles into exploration so the miles count twice",
      "Launder every batch of Marked Bills from your first robbery onward",
    ],
  },
  {
    stage: 4,
    title: "100% completion and the Platinum",
    blurb:
      "The endgame is a checklist, not a boss fight. A Long Road wants the game's " +
      "own 100% checklist complete; current guides report nothing on it is " +
      "missable, so what remains is simply everything you have not done yet. When " +
      "the last of the 54 lands, Vice Got a Price! follows on its own.",
    tips: [
      "Work the in-game 100% checklist one category at a time",
      "Your pre-finale manual save is the safety net if anything looks off",
      "The Platinum needs no action of its own — it pops at 54 of 54",
    ],
  },
];

export const ROADMAP_FACTS = [
  {
    label: "Story length",
    value: "About 60 hours for the campaign, per launch reviews.",
    source: "PlanetGTA6, citing VGC and Push Square reviews",
  },
  {
    label: "Platinum time",
    value: "About 200 hours all-in — long, not hard.",
    source: "Output Lag and PowerPyx, via GTA-Zone",
  },
  {
    label: "Difficulty",
    value: "4 out of 10. No difficulty trophies and no mission medals.",
    source: "PowerPyx, via GTA-Zone",
  },
  {
    label: "Online trophies",
    value: "None. All 55 unlock in single player; the Xbox list is identical at 1,000 Gamerscore.",
    source: "GTA-Zone and Output Lag",
  },
  {
    label: "Missables",
    value: "One trophy is flagged potentially missable: Positive Mental Attitude (a Chapter 1 meditation spot).",
    source: "PowerPyx via GTA-Zone; Output Lag",
  },
  {
    label: "Cheats",
    value: "Cheats disable trophies and saving, and every cheat only unlocks after the story ends — keep them out of a Platinum run.",
    source: "PowerPyx, GameSpot and PC Gamer, via PlanetGTA6",
  },
  {
    label: "Two protagonists",
    value: "Several trophies need Jason and Lucia together; most of the list opens once both are playable in Chapter 2.",
    source: "Output Lag",
  },
];

export const SAVE_CHECKLIST = [
  "Keep a manual save at the start of every chapter — the game has no mission replay.",
  "Meditate at Lucia's Chapter 1 balcony spot before you finish Chapter 1.",
  "Save manually once more before starting the final mission.",
  "Never enable a cheat on this save: cheats switch trophies and saving off.",
  "Export this tracker regularly — your progress file is your backup of the plan.",
];

export async function loadTrophies() {
  const response = await fetch("data/trophies.json");
  if (!response.ok) throw new Error(`trophies.json: HTTP ${response.status}`);
  const doc = await response.json();
  const trophies = Array.isArray(doc) ? doc : doc.trophies;
  if (!Array.isArray(trophies) || trophies.length === 0) {
    throw new Error("trophies.json holds no trophy list");
  }
  return trophies;
}
