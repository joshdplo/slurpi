import './TMDBCards.css';
import { sendEvent, createElement } from '../../fe-util.js';

export default function TMDBCards(container, service, category, cardsMax = 15) {
  const cardsArr = JSON.parse(container.getAttribute('data-cards'));
  let loadButton = null;
  let cardElements = [];
  const totalCards = cardsArr.length;
  let cardsShowing = 0;

  function createCard(data) {
    const id = data?.id || data?.appid;
    const imgSrc = `/images/${service}/${id}.jpg`;
    const title = data?.name || data?.title;
    const favorite = data?.rating || data?.favorite ? 'favorite' : null;
    const mega = data?.mega ? 'mega' : null;

    const wrapper = createElement('div', ['card', favorite, mega]);
    wrapper.setAttribute('data-id', id);
    wrapper.innerHTML = `
      <image src="${imgSrc}" alt="${title}" loading="lazy">
      <div class="info">
        <span class="title">${title}</span>
        <span class="">more to come</span>
        <div class="edit">
          <label for="mega${id}">
            MEGA
            <input type="checkbox" name="mega" id="mega${id}" ${mega ? 'checked' : ''}>
          </label>
        </div>
      </div>
    `;

    cardElements.push(wrapper);
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

  function loadMoreCards() {
    cardsShowing += cardsMax;
    for (let i = 0; i < cardsMax; i++) {
      const el = cardElements.shift();
      container.appendChild(el);
    }

    cardsShowing += cardsMax;
    if (cardsShowing >= totalCards) loadButton.setAttribute('disabled', true);
  }

  async function onClick(e) {
    // load button click
    if (e.target === loadButton) loadMoreCards();

    // item checkbox click
    if (e.target.tagName === 'INPUT' && e.target.getAttribute('type') === 'checkbox') {
      const itemId = e.target.closest('.card').getAttribute('data-id');
      const checked = e.target.checked;

      e.target.setAttribute('disabled', 'true');
      await updateValue(`/api/tmdb-item/${category}/${itemId}`, { mega: checked });
      e.target.removeAttribute('disabled');
    }
  }

  function init() {
    // set up
    loadButton = createElement('button', ['load-more'], 'Load More', container);
    container.addEventListener('click', onClick);

    // populate initial elements
    cardsArr.forEach(c => createCard(c));

    // do first load
    loadMoreCards();
  }

  init();
}