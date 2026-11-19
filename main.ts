// Vice City Midnight — entry program for make.fun's gta6-trophy-guide-01 bounty
// (Node 22, standard library only, no build step anywhere).
//
// The guide itself is the static web app in app/: plain HTML, CSS and ES modules
// plus its trophy database at app/data/trophies.json. It runs entirely offline
// in a browser and loads nothing over the network. This program's one job is to
// hand the entry in: copy app/ and screenshots/ into the output directory and
// write dossier.json there with buildDossier from vendor/makefun-frontend.ts.
//
// vendor/makefun-frontend.ts is the kit's library and stays byte-for-byte as it
// shipped: the scorer rebuilds the dossier with its own copy and requires the
// two to match exactly.
//
// Run it locally the way the grader does, with MAKEFUN_OUTPUT_DIR standing in
// for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the app itself with `node serve.ts` and open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The caps below are the scorer's own (reference/gate.json): the text cap shapes
// the dossier's bytes, and the rest refuse an entry the scorer would refuse —
// more than 4 screenshots or one over 256 KiB, more than 993 files and
// directories under app/, or more than 48 MiB of app files.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
