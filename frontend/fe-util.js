/**
 * Custom Event Helper
 * @param {String} eventName
 * @param {Object|String|Number|Boolean} data
 */
export function sendEvent(eventName, data) {
  const customEvent = new CustomEvent(eventName, { detail: data });
  document.dispatchEvent(customEvent);
}