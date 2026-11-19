// Vice City Midnight — the hand-in program for the gta6-trophy-guide-01
// bounty (Node 22, standard library only, no build step anywhere).
//
// The guide itself is the static web app in app/: open app/index.html in
// a browser and it runs entirely from its own files — ES modules, three
// stylesheets, two vendored display fonts, and the trophy database at
// app/data/trophies.json. This program's whole job is delivery: copy
// app/ and screenshots/ into the output directory, then write
// dossier.json with buildDossier from vendor/makefun-frontend.ts (the
// kit's library, left byte for byte as shipped, because the scorer
// rebuilds the dossier with its own copy and compares).
//
// Run it locally the same way the grader does:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// (MAKEFUN_OUTPUT_DIR stands in for /output outside the grader.)
// Serve the app itself with `node serve.ts` and open localhost:8080.

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

// The caps below are the scorer's own (the kit's reference/gate.json):
// the dossier text budget, at most 4 screenshots of at most 256 KiB,
// and app/ within 993 files and 48 MiB. buildDossier refuses anything
// past them, which is what we want — an entry the scorer would refuse
// should fail here, loudly, instead of at grading time.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
