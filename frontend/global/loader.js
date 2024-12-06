const animationDuration = 300;
const progressAnimationDuration = 800;

function addLoader(element, text = 'Loading') {
  const wrapper = document.createElement('div');
  wrapper.classList.add('loader-wrapper');

  const progressBar = document.createElement('div');
  progressBar.classList.add('loader-progress');
  wrapper.appendChild(progressBar);

  const textEl = document.createElement('div');
  textEl.classList.add('loader-text');
  textEl.innerText = text;

  const textUpdateEl = document.createElement('span');
  textEl.appendChild(textUpdateEl);
  wrapper.appendChild(textEl);

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
  const tt = setTimeout(() => {
    existingLoader.classList.remove('active');
    clearTimeout(tt);

    const t = setTimeout(() => {
      existingLoader.remove();
      element.classList.remove('has-loader');
      clearTimeout(t);
    }, animationDuration);
  }, progressAnimationDuration);
}

function onLoaderEvent(e) {
  const { element, text, textUpdate, complete, progress } = e.detail;

  if (!element) {
    console.warn('No element provided to loader');
    return;
  }

  const existingLoader = element.querySelector('.loader-wrapper');

  if (existingLoader && progress) {
    const progressBar = existingLoader.querySelector('.loader-progress');
    progressBar.style.width = `${progress}%`;
  }

  if (existingLoader && textUpdate) {
    const textUpdateEl = existingLoader.querySelector('.loader-text span');
    textUpdateEl.innerText = textUpdate;
    return;
  }

  if (existingLoader && complete) {
    removeLoader(element, existingLoader);
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