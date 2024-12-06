const animationDuration = 300;

function addLoader(element, text) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('loader-wrapper');

  if (text) {
    const textEl = document.createElement('div');
    textEl.classList.add('loader-text');
    textEl.innerText = text;
    wrapper.appendChild(textEl);
  }

  const loader = document.createElement('div');
  loader.classList.add('loader');
  wrapper.appendChild(loader);

  element.appendChild(wrapper);
  element.classList.add('has-loader');

  const t = setTimeout(() => {
    wrapper.classList.add('active');
    clearTimeout(t);
  }, 10);
}

function removeLoader(element, existingLoader) {
  existingLoader.classList.remove('active');
  const t = setTimeout(() => {
    existingLoader.remove();
    element.classList.remove('has-loader');
    clearTimeout(t);
  }, animationDuration);
}

function onLoaderEvent(e) {
  const { element, text, textUpdate } = e.detail;

  if (!element) {
    console.warn('No element provided to loader');
    return;
  }

  const existingLoader = element.querySelector('.loader-wrapper');
  if (existingLoader && textUpdate) {
    const textEl = existingLoader.querySelector('.loader-text');
    textEl.innerText = textUpdate;
    return;
  }

  if (existingLoader && !textUpdate) {
    removeLoader(element, existingLoader);
    return;
  }

  addLoader(element, text);
}

// Loader Custom Event Listener
document.addEventListener('loader', onLoaderEvent);