/**
 * Global Alerts
 */
const alertContainer = document.getElementById('global-alerts');
const durationDefault = 3500;
const animationDuration = 300;
const alertTopOffset = 4.25; //em

function shiftAlerts() {
  const alerts = alertContainer.querySelectorAll('.alert');
  for (let i = 0; i < alerts.length; i++) {
    alerts[i].style.top = `${i * alertTopOffset}em`;
  }
}

export const showAlert = (text, type = 'info', duration = durationDefault) => {
  const totalAlerts = alertContainer.childNodes.length;

  const alert = document.createElement('div');
  alert.setAttribute('aria-role', 'alert');
  alert.className = `alert ${type}`;
  alert.innerText = text;

  if (totalAlerts > 0) {
    alert.style.top = `${totalAlerts * 4.25}em`;
  }

  // Add class after append (for animation)
  const inTimeout = setTimeout(() => {
    alert.classList.add('active');
    clearTimeout(inTimeout);
  }, 10);

  // Set up remove function (to ensure animation)
  function removeAlert() {
    const removeTimeout = setTimeout(() => {
      alert.remove();
      shiftAlerts();
      clearTimeout(removeTimeout);
    }, animationDuration);
  }

  // Auto-remove after duration
  const durationTimeout = setTimeout(() => {
    alert.classList.remove('active');
    removeAlert();
    clearTimeout(durationTimeout);
  }, duration);

  // Add alert click listener and append to DOM
  alert.addEventListener('click', () => {
    alert.classList.remove('active');
    removeAlert();
  });
  alertContainer.appendChild(alert);
}

// Alerts Custom Event Listener
document.addEventListener('alert', (e) => {
  const { detail } = e;
  showAlert(detail.message, detail.type);
});