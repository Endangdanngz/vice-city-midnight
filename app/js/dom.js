// dom.js — tiny DOM helpers and value formatting shared by every view.

export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = String(text);
  return node;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}

export function append(parent, ...children) {
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    parent.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return parent;
}

export function formatCount(value, unit) {
  const n = Math.max(0, Math.floor(Number(value) || 0));
  if (unit === 'money') return '$' + n.toLocaleString('en-US');
  return n.toLocaleString('en-US');
}

export function formatTarget(trophy, value) {
  return formatCount(value, trophy.unit) + ' / ' + formatCount(trophy.target, trophy.unit);
}

export function percent(done, total) {
  if (!total) return 0;
  return Math.round((done / total) * 1000) / 10;
}

export function progressBar(done, total, className) {
  const wrap = el('div', 'bar ' + (className || ''));
  const fill = el('div', 'bar-fill');
  const pct = total > 0 ? Math.min(100, (done / total) * 100) : 0;
  fill.style.width = pct.toFixed(1) + '%';
  wrap.append(fill);
  return wrap;
}
