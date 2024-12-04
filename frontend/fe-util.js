/**
 * Custom Event Helper
 * @param {String} eventName
 * @param {Object|String|Number|Boolean} data
 */
export function event(eventName, data) {
  const customEvent = new CustomEvent(eventName, { detail: data });
  document.dispatchEvent(customEvent);
}