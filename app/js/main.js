// main.js — boots Vice City Midnight: loads the trophy database, restores the
// saved state, wires the header (spoiler protection, export, import, reset),
// routes between the four views, and — for the entry's screenshots — offers a
// deterministic ?shot= mode that seeds a fixed demo file and never persists.

import { loadTrophies, trophyById } from './data.js';
import { applyFilters } from './filters.js';
import { buildExport, createStore, demoState, validateImport } from './store.js';
import { computeStats } from './stats.js';
import { renderControls, renderDashboard, renderDetail, renderList, updateResultCount } from './view-tracker.js';
import { renderRoadmap } from './view-roadmap.js';
import { renderMissables } from './view-missables.js';
import { renderPlanner } from './view-planner.js';

const SHOT_VIEWS = { checklist: 'tracker', roadmap: 'roadmap', missables: 'missables', planner: 'planner' };

async function boot() {
  const params = new URLSearchParams(location.search);
  const shot = params.get('shot');
  const shotMode = shot !== null && SHOT_VIEWS[shot] !== undefined;

  const trophies = await loadTrophies();
  const store = createStore(trophies, { persist: !shotMode });
  if (params.get('seed') === 'demo') store.replace(demoState());

  const ui = { query: '', kind: 'all', grade: 'all', status: 'all', missableOnly: false };
  let selectedId = 28; // Positive Mental Attitude: the guide every player should read first
  let currentView = shotMode ? SHOT_VIEWS[shot] : 'tracker';

  const refs = {
    dashboard: document.getElementById('dashboard'),
    controls: document.getElementById('controls'),
    list: document.getElementById('trophy-list'),
    detail: document.getElementById('detail-pane'),
    roadmap: document.getElementById('view-roadmap'),
    missables: document.getElementById('view-missables'),
    planner: document.getElementById('view-planner'),
    status: document.getElementById('status-line'),
    spoilerToggle: document.getElementById('spoiler-toggle'),
  };

  function setStatus(text, isError) {
    refs.status.textContent = text || '';
    refs.status.classList.toggle('error', isError === true);
  }

  function stats() {
    return computeStats(trophies, store.state);
  }

  function renderTracker() {
    renderDashboard(refs.dashboard, trophies, store.state, stats());
    const visible = applyFilters(trophies, store.state, ui);
    renderList(refs.list, trophies, store.state, visible, selectedId, actions);
    updateResultCount(refs.controls, visible.length, trophies.length);
    renderDetail(refs.detail, trophies, store.state, trophyById(trophies, selectedId), actions);
  }

  function renderCurrentView() {
    if (currentView === 'tracker') renderTracker();
    else if (currentView === 'roadmap') renderRoadmap(refs.roadmap, trophies, store.state, stats(), actions);
    else if (currentView === 'missables') renderMissables(refs.missables, trophies, store.state, actions);
    else if (currentView === 'planner') renderPlanner(refs.planner, trophies, store.state, actions);
  }

  function refresh() {
    refs.spoilerToggle.checked = store.state.spoiler === true;
    renderCurrentView();
  }

  function switchView(name) {
    currentView = name;
    for (const section of document.querySelectorAll('.view')) {
      section.hidden = section.id !== 'view-' + name;
    }
    for (const btn of document.querySelectorAll('.nav-btn')) {
      btn.classList.toggle('active', btn.dataset.view === name);
    }
    renderCurrentView();
  }

  const actions = {
    select(id) {
      selectedId = id;
      renderDetail(refs.detail, trophies, store.state, trophyById(trophies, selectedId), actions);
      // Keep the selected row highlight in step without rebuilding the controls.
      for (const row of refs.list.querySelectorAll('.trophy-row')) {
        row.classList.toggle('selected', Number(row.dataset.id) === id);
      }
    },
    toggle(trophy) {
      store.toggleEarned(trophy);
      refresh();
    },
    setCounter(trophy, value) {
      store.setCounter(trophy, value);
      refresh();
    },
    setNote(id, text) {
      store.setNote(id, text);
      const visible = applyFilters(trophies, store.state, ui);
      renderList(refs.list, trophies, store.state, visible, selectedId, actions);
    },
    setUi(patch) {
      Object.assign(ui, patch);
      const onlyQuery = Object.keys(patch).length === 1 && 'query' in patch;
      if (!onlyQuery) renderControls(refs.controls, ui, actions);
      const visible = applyFilters(trophies, store.state, ui);
      renderList(refs.list, trophies, store.state, visible, selectedId, actions);
      updateResultCount(refs.controls, visible.length, trophies.length);
    },
    openTrophy(id) {
      selectedId = id;
      switchView('tracker');
      refs.detail.scrollIntoView({ block: 'nearest' });
    },
    toggleHabit(key) {
      store.toggleHabit(key);
    },
  };

  // Header: view navigation.
  for (const btn of document.querySelectorAll('.nav-btn')) {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  }

  // Header: spoiler protection.
  refs.spoilerToggle.checked = store.state.spoiler === true;
  refs.spoilerToggle.addEventListener('change', () => {
    store.setSpoiler(refs.spoilerToggle.checked);
    setStatus(refs.spoilerToggle.checked ? 'Spoiler protection on — hidden trophies are masked until earned.' : 'Spoiler protection off — hidden trophies are shown.');
    refresh();
  });

  // Header: export the progress file.
  document.getElementById('export-btn').addEventListener('click', () => {
    const payload = JSON.stringify(buildExport(store.state), null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vice-city-midnight-progress.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    setStatus('Progress exported — keep the file somewhere safe.');
  });

  // Header: import a progress file, validated before anything is applied.
  const importFile = document.getElementById('import-file');
  document.getElementById('import-btn').addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', async () => {
    const file = importFile.files && importFile.files[0];
    importFile.value = '';
    if (!file) return;
    let parsed;
    try {
      parsed = JSON.parse(await file.text());
    } catch {
      setStatus('Import refused: that file is not valid JSON.', true);
      return;
    }
    const result = validateImport(parsed, trophies);
    if (!result.ok) {
      setStatus('Import refused: ' + result.error, true);
      return;
    }
    store.replace(result.state);
    setStatus('Progress imported.');
    refresh();
  });

  // Header: reset, behind a confirming second click.
  const resetBtn = document.getElementById('reset-btn');
  let resetArmed = false;
  let resetTimer = null;
  resetBtn.addEventListener('click', () => {
    if (!resetArmed) {
      resetArmed = true;
      resetBtn.textContent = 'Tap again to confirm reset';
      resetBtn.classList.add('armed');
      resetTimer = setTimeout(() => {
        resetArmed = false;
        resetBtn.textContent = 'Reset';
        resetBtn.classList.remove('armed');
      }, 4000);
      return;
    }
    clearTimeout(resetTimer);
    resetArmed = false;
    resetBtn.textContent = 'Reset';
    resetBtn.classList.remove('armed');
    store.reset();
    selectedId = 28;
    setStatus('Progress reset — a fresh file, ready when you are.');
    refresh();
  });

  renderControls(refs.controls, ui, actions);
  switchView(currentView);
  refresh();

  if (shotMode) {
    document.body.classList.add('shot-mode');
    const ready = () => {
      window.__shotReady = true;
      document.body.classList.add('shot-ready');
    };
    if (document.fonts && document.fonts.ready) {
      Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]).then(() => requestAnimationFrame(ready));
    } else {
      requestAnimationFrame(ready);
    }
  }
}

boot().catch((error) => {
  const status = document.getElementById('status-line');
  if (status) {
    status.textContent = 'The guide could not start: ' + error.message;
    status.classList.add('error');
  }
  console.error(error);
});
