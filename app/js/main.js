// Vice City Midnight — boot and shell. Builds the dashboard header
// (the big earned count, per-grade and per-kind progress, the Platinum
// line, spoiler protection, export / import / reset), the view tabs,
// and routes between Checklist, Roadmap, Missables and Next Up.
// A ?shot=<view>&seed=demo mode renders one view with a fixed demo
// state for the entry's screenshots and flags window.__shotReady.

import { h, progressBar, clear } from "./dom.js";
import { GRADES, GRADE_LABELS, KINDS, loadTrophies } from "./data.js";
import {
  defaultState,
  demoState,
  exportJSON,
  loadState,
  parseImport,
  saveState,
} from "./store.js";
import { defaultFilters } from "./filters.js";
import { computeStats } from "./stats.js";
import { createChecklist } from "./view-checklist.js";
import { createRoadmap } from "./view-roadmap.js";
import { createMissables } from "./view-missables.js";
import { createNextUp } from "./view-nextup.js";

const VIEWS = [
  { id: "checklist", label: "Checklist & guides" },
  { id: "roadmap", label: "Platinum roadmap" },
  { id: "missables", label: "Missables" },
  { id: "nextup", label: "Next up" },
];

const params = new URLSearchParams(location.search);
const demoMode = params.get("seed") === "demo";

const ui = {
  view: "checklist",
  filters: defaultFilters(),
  selectedId: 28,
  status: "",
};
if (params.get("shot") && VIEWS.some((v) => v.id === params.get("shot"))) {
  ui.view = params.get("shot");
} else if (location.hash.startsWith("#/")) {
  const fromHash = location.hash.slice(2);
  if (VIEWS.some((v) => v.id === fromHash)) ui.view = fromHash;
}
const selectParam = Number(params.get("select"));
if (Number.isInteger(selectParam) && selectParam >= 1 && selectParam <= 55) {
  ui.selectedId = selectParam;
}

let trophies = [];
let state = demoMode ? demoState() : loadState();
let viewRoot = null;
let statsRoot = null;
let navRoot = null;
let statusRoot = null;

const ctx = {
  get trophies() {
    return trophies;
  },
  get state() {
    return state;
  },
  ui,
  save() {
    if (!demoMode) saveState(state);
  },
  refreshDashboard,
  gotoTrophy(id) {
    ui.selectedId = id;
    showView("checklist");
  },
  setStatus(text) {
    ui.status = text;
    if (statusRoot) statusRoot.textContent = text;
  },
};

function replaceState(next) {
  for (const key of Object.keys(state)) delete state[key];
  Object.assign(state, next);
}

function refreshDashboard() {
  if (!statsRoot) return;
  clear(statsRoot);
  const stats = computeStats(trophies, state);
  statsRoot.append(
    h(
      "div",
      { class: "dash-main" },
      h(
        "div",
        { class: "dash-count" },
        h("span", { class: "dash-big" }, `${stats.earned}`),
        h("span", { class: "dash-of" }, `/ ${stats.total} earned`),
        h("span", { class: "dash-pct" }, `${stats.percent}%`),
      ),
      progressBar(stats.earned, stats.total, "bar-hero"),
      h(
        "p",
        { class: "platinum-line" },
        stats.platinumReady
          ? "Platinum earned — Vice Got a Price! is in. Leonida is 100% yours."
          : `${stats.othersEarned} of ${stats.othersTotal} trophies toward the Platinum — ${stats.remaining} left on the list.`,
      ),
    ),
    h(
      "div",
      { class: "dash-side" },
      h(
        "div",
        { class: "dash-grades" },
        GRADES.map((grade) =>
          h(
            "span",
            { class: `dash-grade grade-text-${grade}` },
            `${GRADE_LABELS[grade]} ${stats.perGrade[grade].earned}/${stats.perGrade[grade].total}`,
          ),
        ),
      ),
      h(
        "div",
        { class: "dash-kinds" },
        KINDS.map((kind) =>
          h(
            "div",
            { class: "dash-kind", title: `${kind.label}: ${stats.perKind[kind.id].earned} of ${stats.perKind[kind.id].total}` },
            h("span", { class: "dash-kind-label" }, kind.label),
            progressBar(stats.perKind[kind.id].earned, stats.perKind[kind.id].total),
          ),
        ),
      ),
    ),
  );
}

function buildHeader() {
  const spoilerToggle = h("input", {
    type: "checkbox",
    checked: state.settings.spoilers,
    onchange: (event) => {
      state.settings.spoilers = event.target.checked;
      ctx.save();
      showView(ui.view);
      ctx.setStatus(
        event.target.checked
          ? "Spoiler protection on — hidden trophies stay covered until earned."
          : "Spoiler protection off — hidden trophy names and guides are visible.",
      );
    },
  });
  const importInput = h("input", {
    type: "file",
    accept: "application/json,.json",
    class: "file-hidden",
    onchange: async (event) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;
      const result = parseImport(await file.text());
      if (!result.ok) {
        ctx.setStatus(`Import refused: ${result.error}. Your current progress is untouched.`);
        return;
      }
      replaceState(result.state);
      ctx.save();
      spoilerToggle.checked = state.settings.spoilers;
      refreshDashboard();
      showView(ui.view);
      const stats = computeStats(trophies, state);
      ctx.setStatus(`Progress imported — ${stats.earned} of ${stats.total} trophies earned.`);
    },
  });
  let resetArmed = false;
  let resetTimer = null;
  const resetButton = h(
    "button",
    {
      type: "button",
      class: "tool-btn tool-btn-danger",
      onclick: () => {
        if (!resetArmed) {
          resetArmed = true;
          resetButton.textContent = "Sure? Click again to reset";
          resetTimer = setTimeout(() => {
            resetArmed = false;
            resetButton.textContent = "Reset";
          }, 4000);
          return;
        }
        clearTimeout(resetTimer);
        resetArmed = false;
        resetButton.textContent = "Reset";
        replaceState(defaultState());
        ctx.save();
        spoilerToggle.checked = state.settings.spoilers;
        refreshDashboard();
        showView(ui.view);
        ctx.setStatus("Tracker reset — all progress, counters and notes cleared.");
      },
    },
    "Reset",
  );
  const exportButton = h(
    "button",
    {
      type: "button",
      class: "tool-btn",
      onclick: () => {
        const blob = new Blob([exportJSON(state)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = h("a", { href: url, download: "vice-city-midnight-progress.json" });
        document.body.append(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        ctx.setStatus("Progress exported as vice-city-midnight-progress.json.");
      },
    },
    "Export progress",
  );

  return h(
    "header",
    { class: "site-header" },
    h(
      "div",
      { class: "brand" },
      h("p", { class: "brand-kicker" }, "Grand Theft Auto VI · PlayStation 5 · fully offline"),
      h("h1", { class: "brand-title" }, "Vice City ", h("span", { class: "brand-grad" }, "Midnight")),
      h(
        "p",
        { class: "brand-sub" },
        "The complete trophy guide and tracker: all 55 official trophies with a cited " +
          "guide for each, a four-stage Platinum roadmap, the one missable flagged in " +
          "neon, and your progress saved on this device.",
      ),
    ),
    (statsRoot = h("div", { class: "dash" })),
    h(
      "div",
      { class: "tools" },
      h("label", { class: "toggle-label tools-spoiler" }, spoilerToggle, h("span", {}, "Spoiler protection")),
      exportButton,
      h("label", { class: "tool-btn import-label" }, "Import progress", importInput),
      resetButton,
    ),
    (statusRoot = h("p", { class: "status-line", role: "status" }, ui.status)),
    (navRoot = h(
      "nav",
      { class: "tabs", "aria-label": "Views" },
      VIEWS.map((view) =>
        h(
          "button",
          {
            type: "button",
            class: `tab ${ui.view === view.id ? "tab-on" : ""}`,
            "data-view": view.id,
            onclick: () => showView(view.id),
          },
          view.label,
        ),
      ),
    )),
  );
}

function showView(name) {
  ui.view = name;
  if (location.hash !== `#/${name}`) history.replaceState(null, "", `#/${name}`);
  for (const btn of navRoot?.children ?? []) {
    btn.classList.toggle("tab-on", btn.getAttribute("data-view") === name);
  }
  clear(viewRoot);
  const factory = {
    checklist: createChecklist,
    roadmap: createRoadmap,
    missables: createMissables,
    nextup: createNextUp,
  }[name];
  factory(viewRoot, ctx);
  window.scrollTo(0, 0);
}

async function boot() {
  const app = document.getElementById("app");
  try {
    trophies = await loadTrophies();
  } catch (error) {
    app.append(h("p", { class: "fatal" }, `Could not load the trophy list: ${error.message}`));
    return;
  }
  app.append(
    buildHeader(),
    (viewRoot = h("main", { class: "view-root" })),
    h(
      "footer",
      { class: "site-footer" },
      h(
        "p",
        {},
        "Vice City Midnight is a fan-made, open-source guide. Trophy names, descriptions " +
          "and grades are the official PlayStation text, listed by Exophase and " +
          "PSNProfiles; every guide is written for this app and cites its sources. " +
          "Not affiliated with Rockstar Games or Take-Two Interactive.",
      ),
    ),
  );
  refreshDashboard();
  showView(ui.view);
  if (params.has("shot")) {
    const scroll = Number(params.get("scroll"));
    await document.fonts.ready;
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
    if (Number.isFinite(scroll) && scroll > 0) {
      window.scrollTo(0, scroll);
      // Let the compositor rasterize the scrolled-to region before the
      // screenshot is taken: two more frames and a beat of real time.
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
    window.__shotReady = true;
  }
}

// Top-level await: the module (and with it the document's load event)
// settles only once the app has rendered — and, in shot mode, scrolled
// and painted — so a screenshot taken at load shows the finished page.
await boot();
