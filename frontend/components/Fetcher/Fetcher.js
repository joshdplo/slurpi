import './Fetcher.css';
import { sendEvent } from '../../fe-util.js';
import { showAlert } from '../../global/alerts.js';

export default function Fetcher(element) {
  // Check that an element was passed in
  if (!element || typeof element !== 'object') {
    console.warn('Invalid fetcher element argument passed. Argument recieved:\n', element);
    return;
  }

  // Check for fetcher status container element
  const statusContainer = document.querySelector('#fetcher-status');
  if (!statusContainer) {
    console.warn('No #fetcher-status found on the page\n', element);
    return;
  }

  // Check for fetch start button
  const fetchStartButton = element.querySelector('button.fetcher-start');
  if (!fetchStartButton) {
    console.warn('No button.fetcher-start found in the Fetcher component\n', element);
    return;
  }

  // Get fetcher service and query
  const fetcherService = element.getAttribute('data-service');
  const fetcherQuery = element.getAttribute('data-query');
  const fetcherName = element.getAttribute('data-name');
  if (!fetcherService || !fetcherQuery || !fetcherName || typeof fetcherService !== 'string' || typeof fetcherQuery !== 'string' || typeof fetcherName !== 'string') {
    console.warn('Fetcher element does not have valid data-service, data-query, or data-name attributes:\n', element);
    return;
  }

  function toggleLoader(status) {
    sendEvent('loader', { element, text: `Fetching ${fetcherName}` });
    isFetching = status === true;
    fetchStartButton.disabled = status === true;

  }

  let isFetching = false;
  async function fetchData() {
    const url = `/api/${fetcherService}/${fetcherQuery}`;

    toggleLoader(true);

    try {
      const response = await fetch(url);
      if (response.status !== 200) {
        showAlert(`${fetcherName} fetch failed`, 'error');
      } else {
        showAlert(`${fetcherName} fetch finished successfully!`, 'success');
        return response.json();
      }
    } catch (error) {
      console.error('Error in Fetcher component fetchData()', error);
      sendEvent('loader', { element });
      showAlert(`${fetcherName} fetch failed`, 'error');
    } finally {
      isFetching = false;
      toggleLoader();
    }
  }

  async function onFetchClick() {
    if (isFetching) return;

    const data = await fetchData();
    if (data) {
      console.log(data);
    }
  }

  function init() {
    fetchStartButton.addEventListener('click', onFetchClick);
  }

  init();
}