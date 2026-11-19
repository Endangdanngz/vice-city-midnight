// Vice City Midnight — entry program for make.fun's gta6-trophy-guide-01
// (Node 22, standard library only, no build step).
//
// The guide itself is the static web app in app/: open app/index.html in a
// browser and it runs entirely from its own files — the trophy catalogue is
// app/data/trophies.json, fetched relatively, and progress lives in the
// browser's localStorage. Nothing is requested over the network.
//
// This program's only job is the hand-in. It copies app/ and screenshots/
// into the output directory and writes dossier.json there with the vendored
// library in vendor/makefun-frontend.ts, which must stay byte-identical to
// the kit's copy: the scorer rebuilds the dossier with its own copy and
// compares the two byte for byte. The caps passed to buildDossier are the
// scorer's own (at most 4 screenshots of at most 256 KiB each; app/ at most
// 993 files and 48 MiB; dossier text capped at 163,840 bytes).
//
// Run it the way the grader does, or locally with an output override:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the app locally with `node serve.ts` (http://localhost:8080).

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoDir, 'app'), join(outputDir, 'app'), { recursive: true });

mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
const localShots = join(repoDir, 'screenshots');
if (existsSync(localShots)) {
  cpSync(localShots, join(outputDir, 'screenshots'), { recursive: true });
}

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
