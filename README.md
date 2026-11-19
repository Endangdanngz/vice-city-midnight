[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Endangdanngz/vice-city-midnight/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Endangdanngz/vice-city-midnight/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Vice City Midnight — GTA VI Trophy Guide & Tracker

A free, open-source, fully offline guide and tracker for the 55 PlayStation 5
trophies of Grand Theft Auto VI. Open `app/index.html` in a browser (or serve
`app/` with any static file server) and everything runs from the app's own
files: no accounts, no network, no build step.

## What it does

- **All 55 official trophies** — every name, description and grade exactly as
  PlayStation publishes them (1 Platinum, 2 Gold, 6 Silver, 46 Bronze; 28 of
  them hidden on PSN until earned).
- **A guide for every trophy**, written for this app in its own words, with
  steps where they help and a **sources list on every guide**. Where no source
  pins a step down, the guide says so instead of inventing one.
- **Tracker** — earned checkboxes, PSN progress counters with bars for the 15
  trophies PlayStation counts (250 stunts, 42 shooting-range golds, $250,000
  laundered, and the rest), and a per-trophy personal note field.
- **Automatic Platinum** — Vice Got a Price! is never ticked by hand; the
  dashboard calculates readiness live and the Platinum lands at 54 of 54.
- **Search and combined filters** — full-text search plus kind (story,
  collectibles, activities, crime, world, partner, platinum), grade and
  status filters, and a missable-only toggle.
- **Spoiler protection** — a setting that masks hidden trophies' names,
  descriptions and guides until each one is earned.
- **Platinum roadmap** — four stages (story first; partners and the open
  world; collections and the activity grind; 100% and the Platinum), each
  with live progress, its trophies, and a facts box — about 60 hours of
  story, about 200 hours and 4/10 difficulty to Platinum, no online or
  difficulty trophies, the cheat warning — with a source named for every fact.
- **Missables page** — exactly one trophy is flagged potentially missable:
  Positive Mental Attitude, whose Chapter 1 balcony meditation spot
  disappears when the chapter ends (there is no mission replay). The page
  carries the full warning, the permanent-choice caution for Actions Speak
  Louder, and the five save-discipline habits that protect a run.
- **Next Up planner** — recommends what to chase next and why: the missable
  first, then roadmap order, with counters nearest completion ahead of fresh
  starts. Spoiler-hidden trophies are never named while protection is on.
- **Your progress, portable** — saved in the browser (localStorage), with
  export to a JSON file, validated import (a malformed or foreign file is
  refused with a clear message and your progress untouched), and a reset
  that asks for confirmation.

## Data and sources

Trophy names, descriptions and grades are the official PlayStation text, as
listed by [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/)
and [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi)
(the two agree on all 55; PSNProfiles also publishes the progress targets).
Guidance is cross-checked against the PowerPyx trophy guide, GTA-Zone,
Output Lag and PlanetGTA6, and each trophy's guide pane names the sources it
is built from. Guides are original text — sources are cited, never copied.

The data lives in `app/data/trophies.json`: one record per trophy with its
official fields plus this app's `kind`, `hidden`, `stage`, `missable`,
`target`, `guide`, `steps` and `sources`.

## Run it

```sh
node serve.ts            # serves app/ at http://localhost:8080
# or open app/index.html through any static file server
```

Requires Node.js 22.18 or later for `serve.ts` and `main.ts`; the app
itself is plain HTML, CSS and ES modules.

For screenshots and testing, the app accepts `?shot=checklist|roadmap|missables|nextup`
with `&seed=demo` to render a fixed demo state (13 of 55 earned, counters
part-way, spoiler protection on) deterministically.

## Handing it in (make.fun)

`main.ts` copies `app/` and `screenshots/` to the output directory and
writes `dossier.json` with the kit's `vendor/makefun-frontend.ts`,
unchanged:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT (see `LICENSE`). The vendored Noto Sans Display fonts are under the
SIL Open Font License 1.1 (see `app/fonts/OFL.txt`). Vice City Midnight is
a fan-made guide and is not affiliated with Rockstar Games or Take-Two
Interactive.
