// The missables page: exactly one trophy is flagged potentially
// missable by the guides this app cites, and it gets the front of the
// page with its full warning and its live counter. Below it, the
// permanent-choice caution for Actions Speak Louder, an honest note
// about everything else, and the save-discipline checklist that keeps
// a Platinum run safe.

import { h, gradeChip, progressBar } from "./dom.js";
import { SAVE_CHECKLIST } from "./data.js";
import { counterOf, isEarned } from "./store.js";
import { formatCount } from "./recommend.js";

export function createMissables(container, ctx) {
  const { trophies, state } = ctx;
  const missable = trophies.find((t) => t.missable);
  const caution = trophies.find((t) => t.id === 48);

  if (missable) {
    const earned = isEarned(missable, state, trophies);
    container.append(
      h(
        "section",
        { class: "panel missable-hero" },
        h("p", { class: "detail-kicker" }, "The one missable trophy"),
        h(
          "div",
          { class: "missable-title" },
          h("h2", {}, missable.name),
          gradeChip(missable.grade),
          h("span", { class: "missable-tag" }, "potentially missable"),
        ),
        h("p", { class: "detail-desc" }, missable.description),
        h(
          "div",
          { class: "warning warning-hard" },
          h("strong", {}, "Do the Chapter 1 spot during Chapter 1"),
          h("p", {}, missable.missableNote ?? ""),
        ),
        h("p", { class: "guide-text" }, missable.guide),
        missable.target
          ? h(
              "div",
              { class: "detail-counter" },
              h(
                "p",
                { class: "counter-label" },
                earned
                  ? "Done — every spot meditated at"
                  : `Your progress: ${formatCount(missable, counterOf(missable, state))} of ${formatCount(missable, missable.target)} spots`,
              ),
              progressBar(counterOf(missable, state), missable.target),
            )
          : null,
        h(
          "button",
          { type: "button", class: "go-btn", onclick: () => ctx.gotoTrophy(missable.id) },
          "Open its full guide and counter",
        ),
        h(
          "p",
          { class: "fact-source" },
          "Flagged potentially missable by PowerPyx (via GTA-Zone) and Output Lag; " +
            "the 18 spots in 10 locations and the no-replay warning are theirs, " +
            "checked against the official description.",
        ),
      ),
    );
  }

  if (caution) {
    container.append(
      h(
        "section",
        { class: "panel" },
        h("p", { class: "detail-kicker" }, "Not missable — but permanent"),
        h(
          "div",
          { class: "missable-title" },
          h("h2", {}, caution.name),
          gradeChip(caution.grade),
        ),
        h("p", { class: "detail-desc" }, caution.description),
        h(
          "div",
          { class: "warning warning-soft" },
          h("strong", {}, "Permanent choice warning"),
          h("p", {}, caution.missableNote ?? ""),
        ),
        h("p", { class: "guide-text" }, caution.guide),
        h(
          "button",
          { type: "button", class: "go-btn", onclick: () => ctx.gotoTrophy(caution.id) },
          "Open its guide",
        ),
      ),
    );
  }

  container.append(
    h(
      "section",
      { class: "panel" },
      h("h2", {}, "Everything else"),
      h(
        "p",
        { class: "guide-text" },
        "No other trophy is flagged missable by the sources this guide cites, and the " +
          "100% completion checklist is reported to contain nothing missable — story " +
          "trophies cannot be skipped, and every collectible, activity and world task " +
          "stays available in free roam. If a later guide update flags another trophy, " +
          "this page is where it will appear.",
      ),
      h("p", { class: "fact-source" }, "Sources: GTA-Zone (100% checklist), PowerPyx and Output Lag (missable checks)."),
    ),
    h(
      "section",
      { class: "panel" },
      h("h2", {}, "Save discipline — the five habits that protect the run"),
      h(
        "ul",
        { class: "save-list" },
        SAVE_CHECKLIST.map((item) => h("li", {}, item)),
      ),
    ),
  );
  return { refresh: () => {} };
}
