// Small DOM helpers shared by every view: an element builder, the grade
// chip, the progress bar, and the sunset progress meter. Views build
// real DOM nodes (never innerHTML with data in it), so trophy text can
// contain any characters safely.

export function h(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === "checked" || key === "disabled" || key === "selected") {
      node[key] = value === true;
    } else node.setAttribute(key, String(value));
  }
  for (const child of children.flat(Infinity)) {
    if (child === undefined || child === null || child === false) continue;
    node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return node;
}

export function gradeChip(grade) {
  return h("span", { class: `chip chip-${grade}` }, grade);
}

export function progressBar(value, max, className = "") {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return h(
    "div",
    { class: `bar ${className}`.trim(), role: "progressbar", "aria-valuenow": value, "aria-valuemax": max },
    h("div", { class: "bar-fill", style: `width:${pct}%` }),
  );
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}
