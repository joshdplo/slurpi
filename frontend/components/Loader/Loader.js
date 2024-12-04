export default function Loader() {
  function onLoaderEvent(e) {
    console.log(e.detail);
  }

  function init() {
    console.log('-> Loader component initialized');
    document.addEventListener('loader', onLoaderEvent);
  };

  init();
}