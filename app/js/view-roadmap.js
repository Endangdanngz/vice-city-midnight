// The Platinum roadmap: four stages, each with its reasoning, its
// working tips, its live progress roll-up from the tracker, and its
// trophies as chips that jump to the checklist. The plan comes first;
// below the stages, the roadmap facts box — time, difficulty, cheats,
// online — each with the source it comes from. The roadmap is built
// from the official trophy descriptions, and it says what it is
// built from.

import { h, progressBar } from "./dom.js";
import { ROADMAP_FACTS, ROADMAP_STAGES } from "./data.js";
import { stageProgress } from "./stats.js";
import { isMasked } from "./filters.js";
import { isEarned } from "./store.js";

export function createRoadmap(container, ctx) {
  const { trophies, state } = ctx;
  for (const stage of ROADMAP_STAGES) {
    const progress = stageProgress(trophies, state, stage.stage);
    const card = h(
      "section",
      { class: "panel stage-card" },
      h(
        "div",
        { class: "stage-head" },
        h("span", { class: "stage-number" }, `Stage ${stage.stage}`),
        h("h2", {}, stage.title),
        h("span", { class: "stage-count" }, `${progress.earned} / ${progress.total} earned`),
      ),
      progressBar(progress.earned, progress.total),
      h("p", { class: "stage-blurb" }, stage.blurb),
    );
    if (stage.stage === 1) {
      card.append(
        h(
          "div",
          { class: "warning warning-hard" },
          h("strong", {}, "Before anything else: the Chapter 1 warning"),
          h(
            "p",
            {},
            "One meditation spot for Positive Mental Attitude sits on Lucia's balcony " +
              "during Chapter 1 and disappears when the chapter ends — and there is no " +
              "mission replay. Meditate there during Chapter 1, and keep a manual save " +
              "at the start of every chapter and one before the final mission.",
          ),
        ),
      );
    }
    card.append(
      h(
        "ul",
        { class: "tips" },
        stage.tips.map((tip) => h("li", {}, tip)),
      ),
      h(
        "div",
        { class: "stage-trophies" },
        progress.trophies.map((trophy) => {
          const masked = isMasked(trophy, state, trophies);
          const earned = isEarned(trophy, state, trophies);
          return h(
            "button",
            {
              type: "button",
              class: `trophy-chip grade-${trophy.grade} ${earned ? "trophy-chip-earned" : ""}`,
              onclick: () => ctx.gotoTrophy(trophy.id),
            },
            `${earned ? "✓ " : ""}${masked ? "Hidden trophy" : trophy.name}${trophy.missable ? " · missable" : ""}`,
          );
        }),
      ),
    );
    container.append(card);
  }

  container.append(
    h(
      "section",
      { class: "panel facts-panel" },
      h("h2", {}, "The facts behind this roadmap"),
      h(
        "div",
        { class: "facts-grid" },
        ROADMAP_FACTS.map((fact) =>
          h(
            "div",
            { class: "fact" },
            h("p", { class: "fact-label" }, fact.label),
            h("p", { class: "fact-value" }, fact.value),
            h("p", { class: "fact-source" }, `Source: ${fact.source}`),
          ),
        ),
      ),
    ),
  );
  return { refresh: () => {} };
}
