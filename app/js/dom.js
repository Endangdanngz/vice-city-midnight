// dom.js — tiny element-building and number-formatting helpers shared by every view.

export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'class') el.className = value;
    else if (key === 'text') el.textContent = value;
    else if (key.startsWith('data-')) el.setAttribute(key, String(value));
    else if (key in el && key !== 'list') el[key] = value;
    else el.setAttribute(key, String(value));
  }
  for (const child of children.flat(9)) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return el;
}

export function fmtInt(n) {
  return Math.round(n).toLocaleString('en-US');
}

// A counter value the way the game shows it: money gets a dollar sign, counts stay plain.
export function fmtValue(trophy, n) {
  if (trophy.unit === 'money') return '$' + fmtInt(n);
  return fmtInt(n);
}

export function fmtTarget(trophy) {
  if (!trophy.target) return '';
  if (trophy.unit === 'money') return '$' + fmtInt(trophy.target);
  return fmtInt(trophy.target) + ' ' + trophy.unit;
}

export function clear(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
  return el;
}
