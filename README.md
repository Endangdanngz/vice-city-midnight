[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Endangdanngz/vice-city-midnight/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Endangdanngz/vice-city-midnight/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Vice City Midnight — GTA VI Trophy Guide & Tracker

A free, open-source, fully offline guide and tracker for the 55 PlayStation 5
trophies of Grand Theft Auto VI, built for the make.fun bounty
[gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01).
Open `app/index.html` in a browser — it runs from its own files, with the
network off, and makes no requests.

## What it does

- **The complete official list.** All 55 trophies with their official names,
  descriptions and grades (1 Platinum, 2 Gold, 6 Silver, 46 Bronze, 28 hidden),
  exactly as PlayStation publishes them.
- **A guide to every trophy, with its sources.** Each guide is written in our
  own words — what to do, where and how, and when it can be missed — and names
  the sources its facts come from (the official list on Exophase and
  PSNProfiles, plus PowerPyx, GTA-Zone, Output Lag and PlanetGTA6 where their
  reporting informs a guide). Where no source has pinned a trophy down yet,
  the guide says so honestly instead of inventing steps.
- **A real tracker.** Tick trophies off, log PSN progress counters for the 15
  counted trophies (250 stunts, 42 range golds, $250,000 laundered, and the
  rest), and keep a private note on any trophy. Progress saves in the
  browser's localStorage; **Vice Got a Price!** marks itself earned the moment
  the other 54 are done.
- **Search and combined filters** by text, kind (story, collectibles,
  activities, crime, world, partner, platinum), grade, status and
  missable-only.
- **Spoiler protection.** Hidden trophies show neither name nor description —
  in the list, the roadmap, the planner and even search — until you earn them.
- **A four-stage roadmap to the Platinum**, with live roll-ups per stage and a
  facts box that cites every number it uses (about 60 hours of story, about
  200 hours to the Platinum at 4/10 difficulty, no online or difficulty
  trophies, the cheat rule).
- **A Missables page.** Exactly one trophy is potentially missable —
  Positive Mental Attitude, whose meditation spot on Lucia's balcony exists
  only during Chapter 1 — plus the permanent-choice caution on Actions Speak
  Louder, and a save-habit checklist that is saved with your progress.
- **A Next Up planner** that orders what's left: missable first, then roadmap
  stage, then the counter nearest to done, each with its reason.
- **Export and import** of your progress as a JSON file. Imports are validated
  and refused whole if the file is malformed or isn't a Vice City Midnight
  export. Reset sits behind a confirming second click.

## Run it

Serve the app folder with any static file server, for example the kit's own:

```sh
node serve.ts          # then open http://localhost:8080
```

or simply open `app/index.html` in a desktop browser. There is no build step.

## Hand it in (the entry program)

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
to the output directory and writes `dossier.json` with the kit's
`vendor/makefun-frontend.ts`, which is shipped unchanged:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Sources and honesty

Trophy names, descriptions and grades are the official list as published on
PlayStation Network, listed by [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/)
and [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi)
(the two agree on every name, description and grade). Roadmap and missable
facts come from [GTA-Zone](https://gta-zone.com/news/gta-6-trophies-achievements/)
(including PowerPyx's guide as reported there),
[Output Lag](https://outputlag.com/guides/gta-6-trophy-list/) and
[PlanetGTA6](https://www.planetgta6.com/en/gta-6-trophies/). Nothing here is
copied from those guides: they are cited, never reproduced. Four trophies
(Challenging Tank, Personal Best, Bad Luck, I Guess and The Truth Is Out
There) have no pinned-down trigger in any cited source yet, and their guides
say exactly that.

## Fine print

Vice City Midnight is an unofficial fan project. It is not affiliated with
Rockstar Games or Take-Two Interactive, and it contains no Rockstar logo,
artwork or game imagery — the Vice City Midnight look (midnight navy, a neon
sunset gradient, and the bundled Noto Sans Display typeface under the SIL Open
Font License, see `app/fonts/OFL.txt`) is its own.

Licensed under the MIT License — see `LICENSE`.
