// The checklist view: search and the combined filters on top, the 55
// trophy rows in the middle, and the guide pane beside them. Rows carry
// the earned checkbox and, for the trophies PSN counts, a progress
// counter with a bar. Everything the row does writes through the store
// and re-syncs the list, the guide pane and the dashboard header.

import { h, gradeChip, progressBar, clear } from "./dom.js";
import { GRADES, GRADE_LABELS, KINDS } from "./data.js";
import { PLATINUM_ID, counterOf, isEarned, setCounter, setEarned, setNote } from "./store.js";
import { applyFilters, displayDescription, displayName, isMasked } from "./filters.js";
import { formatCount } from "./recommend.js";
import { counterControls, renderDetail } from "./view-detail.js";

export function createChecklist(container, ctx) {
  const { trophies, state } = ctx;
  const filters = ctx.ui.filters;

  const listRoot = h("div", { class: "rows" });
  const asideRoot = h("aside", { class: "aside", "aria-label": "Trophy guide" });
  const countLine = h("p", { class: "result-count" });

  const detailCtx = () => ({ ...ctx, selectedId: ctx.ui.selectedId, actions });
  const syncDetail = () => renderDetail(asideRoot, detailCtx());
  const actions = {
    toggleEarned(trophy, on) {
      setEarned(state, trophy, on);
      ctx.save();
      syncAll();
    },
    setCounter(trophy, value) {
      setCounter(state, trophy, value);
      ctx.save();
      syncAll();
    },
    setNote(trophy, text) {
      setNote(state, trophy.id, text);
      ctx.save();
    },
  };
  const syncAll = () => {
    renderList();
    syncDetail();
    ctx.refreshDashboard();
  };

  function renderList() {
    clear(listRoot);
    const visible = applyFilters(trophies, state, filters);
    countLine.textContent = `${visible.length} of ${trophies.length} trophies shown`;
    if (visible.length === 0) {
      listRoot.append(
        h("p", { class: "empty" }, "No trophies match that combination — loosen a filter or clear the search."),
      );
      return;
    }
    for (const trophy of visible) listRoot.append(rowFor(trophy));
  }

  function rowFor(trophy) {
    const earned = isEarned(trophy, state, trophies);
    const masked = isMasked(trophy, state, trophies);
    const row = h("article", {
      class: `row ${earned ? "row-earned" : ""} ${ctx.ui.selectedId === trophy.id ? "row-selected" : ""}`,
      "data-id": trophy.id,
    });
    const checkbox = h("input", {
      type: "checkbox",
      checked: earned,
      disabled: trophy.id === PLATINUM_ID,
      "aria-label": `Mark ${masked ? "hidden trophy" : trophy.name} as earned`,
      onchange: (event) => actions.toggleEarned(trophy, event.target.checked),
    });
    row.append(h("label", { class: "row-check" }, checkbox));
    const main = h(
      "div",
      { class: "row-main" },
      h(
        "div",
        { class: "row-title" },
        h("span", { class: `row-name ${masked ? "masked-text" : ""}` }, displayName(trophy, state, trophies)),
        gradeChip(trophy.grade),
        trophy.missable ? h("span", { class: "missable-tag" }, "missable") : null,
        trophy.hidden && !masked ? h("span", { class: "hidden-tag" }, "hidden") : null,
      ),
      h("p", { class: `row-desc ${masked ? "masked-text" : ""}` }, displayDescription(trophy, state, trophies)),
    );
    row.append(main);
    if (trophy.target && !masked) {
      row.append(
        h(
          "div",
          { class: "row-counter" },
          counterControls(trophy, state, (value) => actions.setCounter(trophy, value)),
          progressBar(counterOf(trophy, state), trophy.target),
          h("span", { class: "row-counter-label" }, `${formatCount(trophy, counterOf(trophy, state))} / ${formatCount(trophy, trophy.target)}`),
        ),
      );
    }
    row.addEventListener("click", (event) => {
      if (event.target.closest("button, input, textarea, select, a, label")) return;
      ctx.ui.selectedId = trophy.id;
      renderList();
      syncDetail();
    });
    return row;
  }

  const search = h("input", {
    class: "search",
    type: "search",
    placeholder: "Search trophies and guides…",
    value: filters.query,
    "aria-label": "Search trophies",
    oninput: (event) => {
      filters.query = event.target.value;
      renderList();
    },
  });
  const kindChips = h(
    "div",
    { class: "chip-row", role: "group", "aria-label": "Filter by kind" },
    [{ id: "all", label: "All kinds" }, ...KINDS].map((kind) =>
      h(
        "button",
        {
          type: "button",
          class: `chip-btn ${filters.kind === kind.id ? "chip-btn-on" : ""}`,
          onclick: () => {
            filters.kind = kind.id;
            for (const btn of kindChips.children) btn.classList.remove("chip-btn-on");
            eventTargetChip(kindChips, kind.id);
            renderList();
          },
        },
        kind.label,
      ),
    ),
  );
  function eventTargetChip(root, id) {
    const labels = [{ id: "all", label: "All kinds" }, ...KINDS];
    [...root.children].forEach((btn, i) => btn.classList.toggle("chip-btn-on", labels[i].id === id));
  }
  const gradeSelect = h(
    "select",
    {
      class: "select",
      "aria-label": "Filter by grade",
      onchange: (event) => {
        filters.grade = event.target.value;
        renderList();
      },
    },
    h("option", { value: "all" }, "All grades"),
    GRADES.map((grade) => h("option", { value: grade, selected: filters.grade === grade }, GRADE_LABELS[grade])),
  );
  const statusSelect = h(
    "select",
    {
      class: "select",
      "aria-label": "Filter by status",
      onchange: (event) => {
        filters.status = event.target.value;
        renderList();
      },
    },
    h("option", { value: "all", selected: filters.status === "all" }, "All statuses"),
    h("option", { value: "remaining", selected: filters.status === "remaining" }, "Remaining"),
    h("option", { value: "earned", selected: filters.status === "earned" }, "Earned"),
  );
  const missableToggle = h("input", {
    type: "checkbox",
    checked: filters.missableOnly,
    onchange: (event) => {
      filters.missableOnly = event.target.checked;
      renderList();
    },
  });

  const toolbar = h(
    "div",
    { class: "toolbar" },
    search,
    kindChips,
    h(
      "div",
      { class: "toolbar-row" },
      gradeSelect,
      statusSelect,
      h("label", { class: "toggle-label" }, missableToggle, h("span", {}, "Missable only")),
      countLine,
    ),
  );

  container.append(
    h(
      "div",
      { class: "checklist-layout" },
      h("section", { class: "list-pane" }, toolbar, listRoot),
      asideRoot,
    ),
  );
  renderList();
  syncDetail();
  return { refresh: syncAll };
}
