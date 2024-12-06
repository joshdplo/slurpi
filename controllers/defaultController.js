import { addAlert } from '../middlewares/alertMiddleware.js';
import { sendMessage } from '../wss.js';

/**
 * Dashboard
 */
export const pageDashboard = async (req, res) => {
  try {
    res.render('pages/dashboard', {
      title: 'Dashboard',
    });
  } catch (error) {
    console.error(error.message);
    error.status = 500;
    next(error);
  }
};

/**
 * Test Fetches
 */
export const pageTest = (req, res) => {
  res.render('pages/test', {
    title: 'Test',
    descripton: 'API Test Page',
  })
};

export const apiTestFetch = async (req, res, next) => {
  const delay = req.params?.delay ? parseInt(req.params.delay, 10) : 0;
  const testError = req.params?.delay === 'error';

  if (testError) {
    sendMessage({
      fetch: req.path,
      error: true,
      message: `Error fetching ${req.path}`,
    });
    const err = new Error('test error in apiTestFetch controller');
    err.status = 429;
    return next(err);
  }

  let progress = 1;
  const i = setInterval(() => {
    sendMessage({
      fetch: req.path,
      error: false,
      complete: false,
      progress: Math.floor((progress / (delay / 1000)) * 100),
      message: `${progress}/${delay / 1000}`,
    });

    progress++;
  }, 1000);

  const t = setTimeout(() => {
    res.json({ success: true, t: Date.now() });

    sendMessage({
      fetch: req.path,
      error: false,
      complete: true,
      progress: 100,
      message: `${progress}/${progress}`,
    });
    clearInterval(i);
    clearTimeout(t);
  }, delay);
};