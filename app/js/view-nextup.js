// The Next Up planner view: the recommended trophies to chase next,
// each with its reason, its live counter where PSN counts one, and a
// jump to its guide — plus the full progress picture (per-grade and
// per-kind) so the plan sits next to the numbers it is planned from.

import { h, gradeChip, progressBar } from "./dom.js";
import { GRADES, GRADE_LABELS, KINDS } from "./data.js";
import { counterOf } from "./store.js";
import { computeStats } from "./stats.js";
import { formatCount, nextUp } from "./recommend.js";

export function createNextUp(container, ctx) {
  const { trophies, state } = ctx;
  const stats = computeStats(trophies, state);
  const picks = nextUp(trophies, state, 8);

  container.append(
    h(
      "section",
      { class: "panel" },
      h("h2", {}, "Chase these next"),
      h(
        "p",
        { class: "guide-text" },
        "Ordered by what protects the run first — the missable trophy, then the " +
          "roadmap's order, with counters that are already moving ahead of fresh " +
          "starts. Spoiler-hidden trophies are never named here while spoiler " +
          "protection is on.",
      ),
      picks.length === 0
        ? h("p", { class: "empty" }, "Nothing left to recommend — the list is done. Enjoy Leonida.")
        : h(
            "ol",
            { class: "nextup-list" },
            picks.map(({ trophy, reason }) =>
              h(
                "li",
                { class: "nextup-item" },
                h(
                  "div",
                  { class: "nextup-main" },
                  h(
                    "div",
                    { class: "row-title" },
                    h("span", { class: "row-name" }, trophy.name),
                    gradeChip(trophy.grade),
                    trophy.missable ? h("span", { class: "missable-tag" }, "missable") : null,
                  ),
                  h("p", { class: "nextup-reason" }, reason),
                  trophy.target
                    ? progressBar(counterOf(trophy, state), trophy.target)
                    : null,
                  trophy.target
                    ? h(
                        "p",
                        { class: "row-counter-label" },
                        `${formatCount(trophy, counterOf(trophy, state))} / ${formatCount(trophy, trophy.target)}`,
                      )
                    : null,
                ),
                h(
                  "button",
                  { type: "button", class: "go-btn", onclick: () => ctx.gotoTrophy(trophy.id) },
                  "Open guide",
                ),
              ),
            ),
          ),
    ),
    h(
      "section",
      { class: "panel" },
      h("h2", {}, "The whole picture"),
      h(
        "p",
        { class: "platinum-line" },
        stats.platinumReady
          ? "Platinum ready — all 54 other trophies are earned, so Vice Got a Price! is yours."
          : `${stats.othersEarned} of ${stats.othersTotal} trophies stand between you and the Platinum.`,
      ),
      h(
        "div",
        { class: "stats-grid" },
        h(
          "div",
          {},
          h("h3", { class: "detail-h" }, "By grade"),
          GRADES.map((grade) =>
            h(
              "div",
              { class: "stat-row" },
              h("span", { class: "stat-label" }, GRADE_LABELS[grade]),
              progressBar(stats.perGrade[grade].earned, stats.perGrade[grade].total),
              h("span", { class: "stat-num" }, `${stats.perGrade[grade].earned}/${stats.perGrade[grade].total}`),
            ),
          ),
        ),
        h(
          "div",
          {},
          h("h3", { class: "detail-h" }, "By kind"),
          KINDS.map((kind) =>
            h(
              "div",
              { class: "stat-row" },
              h("span", { class: "stat-label" }, kind.label),
              progressBar(stats.perKind[kind.id].earned, stats.perKind[kind.id].total),
              h("span", { class: "stat-num" }, `${stats.perKind[kind.id].earned}/${stats.perKind[kind.id].total}`),
            ),
          ),
        ),
      ),
    ),
  );
  return { refresh: () => {} };
}
