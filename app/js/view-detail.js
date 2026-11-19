// The guide pane: one trophy in full — official name and description,
// grade and kind, the earned toggle, the PSN counter, the original
// guide with its steps, the missable warning where one applies, the
// player's own note, and the sources the guide is built from. A masked
// (spoiler-hidden) trophy shows none of it until it is earned.

import { h, gradeChip, progressBar, clear } from "./dom.js";
import { KIND_LABELS } from "./data.js";
import { PLATINUM_ID, counterOf, isEarned } from "./store.js";
import { displayDescription, displayName, isMasked } from "./filters.js";
import { formatCount } from "./recommend.js";

export function counterControls(trophy, state, onCounter) {
  const now = counterOf(trophy, state);
  const step = trophy.unit === "$" ? 500 : 1;
  const input = h("input", {
    class: "counter-input",
    type: "number",
    min: 0,
    max: trophy.target,
    step,
    value: now,
    "aria-label": `Progress count for ${trophy.name}`,
    onchange: (event) => onCounter(Number(event.target.value)),
  });
  return h(
    "div",
    { class: "counter" },
    h("button", { type: "button", class: "counter-btn", "aria-label": "Decrease", onclick: () => onCounter(now - step) }, "−"),
    input,
    h("button", { type: "button", class: "counter-btn", "aria-label": "Increase", onclick: () => onCounter(now + step) }, "+"),
    h("span", { class: "counter-of" }, `of ${formatCount(trophy, trophy.target)}`),
  );
}

export function renderDetail(root, ctx) {
  clear(root);
  const { trophies, state, actions } = ctx;
  const trophy = trophies.find((t) => t.id === ctx.selectedId) ?? trophies[0];
  if (!trophy) return;

  if (isMasked(trophy, state, trophies)) {
    root.append(
      h(
        "div",
        { class: "detail masked-detail" },
        h("p", { class: "detail-kicker" }, "Spoiler protection is on"),
        h("h2", {}, "Hidden trophy"),
        h(
          "p",
          { class: "detail-desc" },
          "This trophy is hidden on PlayStation until it is earned. Its name, " +
            "description and guide stay covered while spoiler protection is on — " +
            "earn it in game, tick it here, and the guide opens.",
        ),
        h("p", { class: "detail-meta" }, `${KIND_LABELS[trophy.kind]} · roadmap stage ${trophy.stage}`),
      ),
    );
    return;
  }

  const earned = isEarned(trophy, state, trophies);
  const isPlatinum = trophy.id === PLATINUM_ID;
  const detail = h("div", { class: "detail" });

  detail.append(
    h(
      "div",
      { class: "detail-head" },
      gradeChip(trophy.grade),
      h("span", { class: "kind-tag" }, KIND_LABELS[trophy.kind]),
      trophy.hidden ? h("span", { class: "hidden-tag" }, "hidden on PSN") : null,
      trophy.missable ? h("span", { class: "missable-tag" }, "missable") : null,
    ),
    h("h2", { class: "detail-name" }, displayName(trophy, state, trophies)),
    h("p", { class: "detail-desc" }, displayDescription(trophy, state, trophies)),
  );

  if (trophy.missable || trophy.missableNote) {
    detail.append(
      h(
        "div",
        { class: `warning ${trophy.missable ? "warning-hard" : "warning-soft"}` },
        h("strong", {}, trophy.missable ? "Missable — read before you play on" : "Permanent choice — read first"),
        h("p", {}, trophy.missableNote ?? ""),
      ),
    );
  }

  const toggle = h("input", {
    type: "checkbox",
    checked: earned,
    disabled: isPlatinum,
    onchange: (event) => actions.toggleEarned(trophy, event.target.checked),
  });
  detail.append(
    h(
      "label",
      { class: "earned-toggle" },
      toggle,
      h(
        "span",
        {},
        isPlatinum
          ? earned
            ? "Platinum earned — all 54 others are in"
            : "Platinum is automatic at 54 of 54 others"
          : earned
            ? "Earned"
            : "Mark as earned",
      ),
    ),
  );

  if (trophy.target) {
    detail.append(
      h(
        "div",
        { class: "detail-counter" },
        h("p", { class: "counter-label" }, `PSN progress — ${trophy.name}`),
        counterControls(trophy, state, (value) => actions.setCounter(trophy, value)),
        progressBar(counterOf(trophy, state), trophy.target),
      ),
    );
  }

  detail.append(h("h3", { class: "detail-h" }, "Guide"));
  detail.append(h("p", { class: "guide-text" }, trophy.guide));
  if (Array.isArray(trophy.steps) && trophy.steps.length > 0) {
    detail.append(
      h(
        "ol",
        { class: "steps" },
        trophy.steps.map((step) => h("li", {}, step)),
      ),
    );
  }

  const note = h("textarea", {
    class: "note",
    rows: 3,
    placeholder: "Your own note — a route, a reminder, a count…",
    "aria-label": `Your note for ${trophy.name}`,
    onchange: (event) => actions.setNote(trophy, event.target.value),
  });
  note.value = state.notes[trophy.id] ?? "";
  detail.append(h("h3", { class: "detail-h" }, "Your note"), note);

  detail.append(h("h3", { class: "detail-h" }, "Sources"));
  detail.append(
    h(
      "ul",
      { class: "sources" },
      (trophy.sources ?? []).map((source) =>
        h(
          "li",
          {},
          source.url
            ? h("a", { href: source.url, target: "_blank", rel: "noreferrer" }, source.name)
            : h("span", {}, source.name),
        ),
      ),
    ),
    h(
      "p",
      { class: "sources-note" },
      "Names, descriptions and grades are the official PlayStation text. Every guide " +
        "here is written for this app in its own words; the sources above are what it " +
        "is built from, and where no source pins a step down, the guide says so.",
    ),
  );

  root.append(detail);
}
