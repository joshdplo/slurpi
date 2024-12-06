import './Fetcher.css';
import { sendEvent } from '../../fe-util.js';
import { showAlert } from '../../global/alerts.js';

export default function Fetcher(element) {
  // Check that an element was passed in
  if (!element || typeof element !== 'object') {
    console.warn('Invalid fetcher element argument passed. Argument recieved:\n', element);
    return;
  }

  // Get fetcher data attributes
  const fetcherService = element.getAttribute('data-service');
  const fetcherQuery = element.getAttribute('data-query');
  const fetcherName = element.getAttribute('data-name');
  if (!fetcherService || !fetcherQuery || !fetcherName || typeof fetcherService !== 'string' || typeof fetcherQuery !== 'string' || typeof fetcherName !== 'string') {
    console.warn('Fetcher element does not have valid data-service, data-query, or data-name attributes:\n', element);
    return;
  }

  /**
   * Fetcher DOM Creation
   */
  const url = `/api/${fetcherService}/${fetcherQuery}`;

  const fetchStartButton = document.createElement('button');
  const fetchButtonSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15 10h4l-7 8-7-8h4v-10h6v10zm6 9v5h-18v-5h18zm-6 2h-1v1h1v-1zm2 0h-1v1h1v-1zm2 0h-1v1h1v-1z" /></svg>';
  fetchStartButton.innerHTML = fetchButtonSvg;

  const fetchDetailsDiv = document.createElement('div');
  fetchDetailsDiv.classList.add('details');

  const fetchNameSpan = document.createElement('span');
  fetchNameSpan.classList.add('name');
  fetchNameSpan.innerText = fetcherName;
  fetchDetailsDiv.appendChild(fetchNameSpan);

  const fetchUrlSpan = document.createElement('span');
  fetchUrlSpan.classList.add('url');
  fetchUrlSpan.innerText = url;
  fetchDetailsDiv.appendChild(fetchUrlSpan);

  element.appendChild(fetchStartButton);
  element.appendChild(fetchDetailsDiv);

  /**
   * Fetcher Logic
   */
  let isFetching = false;

  function toggleLoader(status) {
    sendEvent('loader', { element, text: `Fetching ${fetcherName}` });
    isFetching = status === true;
    fetchStartButton.disabled = status === true;
  }

  async function fetchData() {
    toggleLoader(true);

    try {
      const response = await fetch(url);
      if (response.status !== 200) {
        showAlert(`${fetcherName} failed`, 'error');
      } else {
        const json = await response.json();

        if (json.error) {
          showAlert(`${fetcherName} error: ${json.error}`, 'error');
        } else {
          showAlert(`${fetcherName} finished successfully!`, 'success');
        }
        return json;
      }
    } catch (error) {
      console.error('Error in Fetcher component fetchData()', error);
      sendEvent('loader', { element });
      showAlert(`${fetcherName} failed`, 'error');
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

  function onWSEvent(e) {
    const ws = e.detail;
    if (ws.fetch && ws.fetch === url && ws.message) {
      sendEvent('loader', { element, textUpdate: ws.message, complete: ws.complete || false, progress: ws.progress || null });
    }
  }

  function init() {
    fetchStartButton.addEventListener('click', onFetchClick);
    document.addEventListener('ws', onWSEvent);
  }

  init();
}