/**
 * Custom Event Helper
 * @param {String} eventName
 * @param {Object|String|Number|Boolean} data
 */
export function sendEvent(eventName, data) {
  const customEvent = new CustomEvent(eventName, { detail: data });
  document.dispatchEvent(customEvent);
}

/**
 * Create Element Helper
 */
export function createElement(tag = 'div', classes = [], innerHTML = '', appendToEl = null) {
  const el = document.createElement(tag);
  classes.forEach(c => { if (c && c.length) el.classList.add(c) });
  el.innerHTML = innerHTML;
  if (appendToEl) appendToEl.appendChild(el);

  return el;
}