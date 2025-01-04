import './CardsList.css';
import { sendEvent, createElement } from '../../fe-util.js';

export default function CardsList(container, service, category) {
  if (!container) {
    console.warn(`No container found for ${service}/${category}`);
    return;
  }
  const cardsArr = JSON.parse(container.getAttribute('data-cards'));

  function getCardLInk(data) {
    if (service === 'spotify') return data.url;
    if (service === 'steam') return `https://store.steampowered.com/app/${data.appid}`;
    if (service === 'tmdb') return `https://www.themoviedb.org/${category.replace('s', '')}/${id}`;
    return null;
  }

  function createCard(data) {
    if (data?.invalid) return;

    const id = data?.appid || data?.id;
    const imgSrc = `/images/${service}/${id}.jpg`;
    const title = data?.name || data?.title;
    const description = data?.description || data?.short_description || data?.overview || null;
    const artists = data?.artists ? data.artists.map(a => a.name) : null;
    const isMega = data?.mega ? 'mega' : null;
    const isSuper = data?.super ? 'super' : null;

    const wrapper = createElement('div', ['card', isMega, isSuper]);
    wrapper.setAttribute('data-id', id);
    wrapper.innerHTML = `
      <image src="${imgSrc}" alt="${title}" loading="lazy">
      <div class="info">
        <span class="title">${title}</span>
        ${artists ? artists.map(a => `<span class="artist">${a}</span>`) : ''}
        <div class="edit">
          <label for="super${id}">
            SUPER?
            <input type="checkbox" name="super" id="super${id}" ${isSuper ? 'checked' : ''} ${service === 'tmdb' ? 'disabled="true"' : ''}>
          </label>
          <label for="mega${id}">
            MEGA?
            <input type="checkbox" name="mega" id="mega${id}" ${isMega ? 'checked' : ''}>
          </label>
          <label for="delete${id}">
            DELETE?
            <input type="checkbox" name="delete" id="delete${id}">
          </label>
        </div>
      </div>
    `;

    container.appendChild(wrapper);
  }

  async function updateValue(path, json) {
    const response = await fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(json)
    })
      .catch(err => console.error('Error fetching', err));

    const result = await response.json();
    const status = result.success ? 'success' : 'error';

    sendEvent('alert', { message: `Update ${status}`, type: status });
  }

  async function onClick(e) {
    // item checkbox click
    if (e.target.tagName === 'INPUT' && e.target.getAttribute('type') === 'checkbox') {
      const itemId = e.target.closest('.card').getAttribute('data-id');
      const checkboxName = e.target.getAttribute('name');
      const isChecked = e.target.checked;

      e.target.setAttribute('disabled', 'true');
      await updateValue(`/api/${service}-item/${category}/${itemId}`, { [checkboxName]: isChecked });
      e.target.removeAttribute('disabled');
      if (checkboxName === 'delete') document.querySelector(`.card[data-id="${itemId}"]`)?.remove();
    }
  }

  function init() {
    container.addEventListener('click', onClick);
    cardsArr.forEach(c => createCard(c));
  }

  init();
}