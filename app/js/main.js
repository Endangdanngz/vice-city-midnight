// main.js — Vice City Midnight's shell: loads the catalogue, owns the state,
// routes between the four views (checklist, roadmap, missables, next up),
// wires export / import / reset, and implements the deterministic screenshot
// mode (?shot=<view>&seed=demo).

import { loadCatalogue, trophiesOf } from './data.js';
import { clear, el } from './dom.js';
import { defaultFilters } from './filters.js';
import {
  demoState,
  exportPayload,
  loadState,
  parseImport,
  saveState,
  setCounter,
  setEarned,
  setNote,
} from './store.js';
import { computeStats } from './stats.js';
import { renderDashboard, renderList, renderToolbar } from './view-checklist.js';
import { renderDetail } from './view-detail.js';
import { renderMissables } from './view-missables.js';
import { renderNextUp } from './view-nextup.js';
import { renderRoadmap } from './view-roadmap.js';

const VIEWS = [
  { id: 'checklist', label: 'Tracker & guides' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'missables', label: 'Missables' },
  { id: 'nextup', label: 'Next up' },
];

const shotParams = new URLSearchParams(location.search);
const shotView = shotParams.get('shot');
const inShotMode = Boolean(shotView && shotParams.get('seed') === 'demo');

const ctx = {
  trophies: [],
  state: inShotMode ? demoState() : loadState(),
  filters: defaultFilters(),
  selectedId: inShotMode ? 28 : 1,
  view: 'checklist',
  stats: null,
  els: {},
  persist() {
    if (!inShotMode) saveState(ctx.state);
  },
  refreshStats() {
    ctx.stats = computeStats(ctx.state, ctx.trophies);
  },
  renderAll() {
    ctx.refreshStats();
    renderNav();
    renderView();
  },
  renderList() {
    ctx.refreshStats();
    renderDashboard(ctx.els.dashboard, ctx.stats);
    renderListInto();
    renderDetail(ctx.els.detail, ctx);
  },
  select(id) {
    ctx.selectedId = id;
    renderListInto();
    renderDetail(ctx.els.detail, ctx);
  },
  toggleEarned(trophy, on) {
    setEarned(ctx.state, trophy, on);
    ctx.persist();
    ctx.renderList();
  },
  setCounter(trophy, value) {
    setCounter(ctx.state, trophy, value);
    ctx.persist();
    ctx.renderList();
  },
  setNote(trophy, text) {
    setNote(ctx.state, trophy, text);
    ctx.persist();
  },
  goToTrophy(id) {
    ctx.selectedId = id;
    setView('checklist');
  },
};

function renderListInto() {
  renderList(ctx.els.list, ctx);
}

function setView(view) {
  ctx.view = view;
  if (location.hash !== '#/' + view) {
    history.replaceState(null, '', '#/' + view);
  }
  ctx.renderAll();
}

function renderNav() {
  clear(ctx.els.nav);
  for (const view of VIEWS) {
    const btn = el('button', 'nav-btn' + (ctx.view === view.id ? ' is-active' : ''), view.label);
    btn.type = 'button';
    btn.addEventListener('click', () => setView(view.id));
    ctx.els.nav.append(btn);
  }
}

function renderView() {
  const main = ctx.els.view;
  clear(main);
  if (ctx.view === 'checklist') {
    const layout = el('div', 'checklist-layout');
    const left = el('div', 'checklist-left');
    ctx.els.dashboard = el('section', 'dashboard panel');
    ctx.els.toolbar = el('section', 'toolbar panel');
    ctx.els.list = el('section', 'list-wrap');
    left.append(ctx.els.dashboard, ctx.els.toolbar, ctx.els.list);
    ctx.els.detail = el('aside', 'detail panel');
    layout.append(left, ctx.els.detail);
    main.append(layout);
    ctx.refreshStats();
    renderDashboard(ctx.els.dashboard, ctx.stats);
    renderToolbar(ctx.els.toolbar, ctx);
    renderListInto();
    renderDetail(ctx.els.detail, ctx);
  } else if (ctx.view === 'roadmap') {
    const panel = el('section', 'panel wide');
    main.append(panel);
    renderRoadmap(panel, ctx);
  } else if (ctx.view === 'missables') {
    const panel = el('section', 'panel wide');
    main.append(panel);
    renderMissables(panel, ctx);
  } else if (ctx.view === 'nextup') {
    const panel = el('section', 'panel wide');
    main.append(panel);
    renderNextUp(panel, ctx);
  }
}

function renderTools() {
  const tools = ctx.els.tools;
  clear(tools);

  const exportBtn = el('button', 'btn', 'Export progress');
  exportBtn.type = 'button';
  exportBtn.addEventListener('click', () => {
    const blob = new Blob([exportPayload(ctx.state)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = el('a');
    link.href = url;
    link.download = 'vice-city-midnight-progress.json';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    flash('Progress exported as a JSON file.');
  });
  tools.append(exportBtn);

  const importBtn = el('button', 'btn', 'Import progress');
  importBtn.type = 'button';
  const fileInput = el('input');
  fileInput.type = 'file';
  fileInput.accept = '.json,application/json';
  fileInput.hidden = true;
  importBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files && fileInput.files[0];
    fileInput.value = '';
    if (!file) return;
    const text = await file.text();
    const result = parseImport(text, ctx.trophies);
    if (!result.ok) {
      flash(result.error, true);
      return;
    }
    ctx.state = result.state;
    ctx.persist();
    ctx.renderAll();
    flash('Progress imported.');
  });
  tools.append(importBtn, fileInput);

  const resetBtn = el('button', 'btn btn-danger', 'Reset all progress');
  resetBtn.type = 'button';
  let armed = false;
  let armTimer = null;
  resetBtn.addEventListener('click', () => {
    if (!armed) {
      armed = true;
      resetBtn.textContent = 'Click again to confirm reset';
      resetBtn.classList.add('is-armed');
      armTimer = setTimeout(() => {
        armed = false;
        resetBtn.textContent = 'Reset all progress';
        resetBtn.classList.remove('is-armed');
      }, 4000);
      return;
    }
    clearTimeout(armTimer);
    armed = false;
    resetBtn.textContent = 'Reset all progress';
    resetBtn.classList.remove('is-armed');
    ctx.state = { earned: {}, counters: {}, notes: {}, spoilers: ctx.state.spoilers, habits: {} };
    ctx.persist();
    ctx.renderAll();
    flash('Progress reset. A clean run at Leonida.');
  });
  tools.append(resetBtn);

  ctx.els.flash = el('span', 'tools-flash');
  tools.append(ctx.els.flash);
}

function flash(message, isError) {
  if (!ctx.els.flash) return;
  ctx.els.flash.textContent = message;
  ctx.els.flash.classList.toggle('is-error', Boolean(isError));
}

function viewFromHash() {
  const match = /^#\/(\w+)/.exec(location.hash || '');
  const id = match ? match[1] : 'checklist';
  return VIEWS.some((v) => v.id === id) ? id : 'checklist';
}

async function boot() {
  const app = document.getElementById('app');
  const header = el('header', 'site-header');
  const titleBox = el('div', 'title-box');
  titleBox.append(el('p', 'title-kicker', 'Grand Theft Auto VI · PlayStation 5 · fully offline'));
  titleBox.append(el('h1', 'site-title', 'Vice City Midnight'));
  titleBox.append(
    el(
      'p',
      'title-sub',
      'A trophy guide and tracker for all 55 official PS5 trophies: cited guides, a four-stage roadmap to the ' +
        'Platinum, the one missable flagged, and your progress saved in this browser.',
    ),
  );
  header.append(titleBox);
  ctx.els.nav = el('nav', 'site-nav');
  header.append(ctx.els.nav);
  ctx.els.tools = el('div', 'data-tools');
  header.append(ctx.els.tools);
  app.append(header);

  ctx.els.view = el('main', 'site-main');
  app.append(ctx.els.view);

  const footer = el('footer', 'site-footer');
  footer.append(
    el(
      'p',
      null,
      'Official trophy names, descriptions and grades are PlayStation\u2019s, as listed by Exophase and ' +
        'PSNProfiles. Guides are this app\u2019s own words and cite their sources. An unofficial fan work — ' +
        'no Rockstar Games artwork or logos. Everything runs from this folder; the only file fetched is ' +
        'data/trophies.json, its own data.',
    ),
  );
  app.append(footer);

  try {
    const data = await loadCatalogue();
    ctx.trophies = trophiesOf(data);
  } catch (error) {
    clear(ctx.els.view);
    ctx.els.view.append(el('p', 'load-error', 'The trophy data could not be loaded: ' + error.message));
    return;
  }

  ctx.view = inShotMode ? shotViewToView(shotView) : viewFromHash();
  if (inShotMode) history.replaceState(null, '', location.pathname + location.search);
  renderTools();
  ctx.renderAll();

  window.addEventListener('hashchange', () => {
    const next = viewFromHash();
    if (next !== ctx.view && !inShotMode) {
      ctx.view = next;
      ctx.renderAll();
    }
  });

  if (inShotMode) {
    // Wait for the local display font so the screenshot never catches a
    // half-painted header.
    await document.fonts.ready;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      window.__shotReady = true;
    }));
  }
}

function shotViewToView(shot) {
  if (shot === 'planner' || shot === 'nextup') return 'nextup';
  if (shot === 'roadmap' || shot === 'missables' || shot === 'checklist') return shot;
  return 'checklist';
}

boot();
