[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Endangdanngz/vice-city-midnight/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Endangdanngz/vice-city-midnight/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Vice City Midnight — GTA VI Trophy Guide & Tracker

An offline guide and tracker for all **55 official PlayStation 5 trophies** of
Grand Theft Auto VI: 1 platinum, 2 gold, 6 silver, 46 bronze — 28 of them
hidden until earned. Open `app/index.html` in a browser and everything runs
from this folder: no build step, no network requests, and your progress is
saved in the browser's localStorage.

Built for make.fun's [gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01)
bounty ("Build the best GTA 6 trophy guide").

## What it does

- **Tracker & guides** — a dashboard with the big earned count, percentage,
  per-grade and per-kind progress bars, and a Platinum line that earns
  *Vice Got a Price!* automatically at 54 of 54. Below it, the full checklist
  of 55 trophies with grade chips, earned toggles, and PSN counters
  (+/− buttons and direct input, with progress bars) for the 15 trophies
  PlayStation counts — 250 stunts, 42 shooting-range golds, $250,000 of
  laundered bills and the rest, money counters formatted as dollars.
- **A guide for every trophy** — click any trophy for its guide in our own
  words: what to do, the steps, a missable banner where one applies, its
  counter, a personal note field saved per trophy, and the sources each fact
  came from. Where no source has pinned a trigger down yet (four trophies),
  the guide says so honestly instead of inventing a method.
- **Search & combined filters** — text search across names, descriptions and
  guides, plus kind chips (story, collectibles, activities, crime, world,
  partner, platinum), grade and status selects, and a missable-only switch.
- **Spoiler protection** — a toggle that masks the names and descriptions of
  hidden trophies everywhere (checklist, roadmap, planner) until you earn
  them.
- **Roadmap to the Platinum** — four stages with live roll-ups, a facts box
  where every claim names its source (about 60 hours of story, roughly 200
  hours to Platinum, difficulty 4/10, no online trophies, cheats disabling
  trophies and saving), and the Chapter 1 warning.
- **Missables** — exactly one trophy is flagged potentially missable by the
  guides: *Positive Mental Attitude*, whose Lucia's-balcony meditation spot
  exists only during Chapter 1. The page carries the warning, the
  permanent-choice caution for *Actions Speak Louder* (an "Irredeemable"
  Criminal Profile cannot be undone), and a save-discipline checklist.
- **Next Up planner** — your next twelve trophies in play order: the missable
  first, then roadmap stage order, then the counter nearest completion —
  each with a one-line reason, spoiler-safe.
- **Your data stays yours** — export progress to a JSON file, import it back
  (files are validated strictly; foreign or malformed files are refused
  whole), and reset behind a confirming second click.

## Data & sources

Official trophy names, descriptions and grades are PlayStation's, as listed
by [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/)
and [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi)
(the two agree on all 55). Guides are written for this app and cite their
sources per trophy — PowerPyx's trophy guide, GTA-Zone, Output Lag and
PlanetGTA6 among them. A source is cited, never copied. This is an unofficial
fan work: no Rockstar Games logos or artwork.

## Run it

```sh
node serve.ts            # serves app/ at http://localhost:8080
```

Or open `app/index.html` through any static file server. To produce the
competition hand-in (copies `app/` and `screenshots/` and writes
`dossier.json`):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Screenshots are deterministic: append `?shot=checklist|roadmap|missables|planner&seed=demo`
to the app URL to render a fixed demo state (13 of 55 earned, counters
part-way, spoiler protection on).

## Layout

- `app/index.html` — the page; `app/css/` — the Vice City Midnight theme
- `app/js/` — ES modules: `data`, `store`, `filters`, `stats`, `recommend`,
  `dom`, one `view-*` module per view, and `main`
- `app/data/trophies.json` — the 55 trophies with guides, kinds, stages,
  counters, missable flags and per-trophy sources
- `app/fonts/` — the local display font (Noto Sans Display, OFL license
  included)
- `main.ts` — the hand-in program; `vendor/makefun-frontend.ts` — the kit's
  dossier library, unchanged

## License

MIT — see `LICENSE`.
