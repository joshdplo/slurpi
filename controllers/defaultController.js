import { addAlert } from '../middlewares/alertMiddleware.js';
import { sendMessage } from '../wss.js';

/**
 * Dashboard
 */
export const pageDashboard = async (req, res) => {
  try {
    addAlert(req, 'The Dashboard Works', 'success');

    res.render('pages/dashboard', {
      title: 'Dashboard'
    });
  } catch (error) {
    console.error(error.message);
    error.status = 500;
    next(error);
  }
};

/**
 * Test Fetch
 */
export const apiTestFetch = async (req, res, next) => {
  const delay = req.params?.delay ? parseInt(req.params.delay, 10) : 0;
  const testError = req.params?.delay === 'error';

  if (testError) {

    sendMessage({
      fetch: req.path,
      error: true,
      complete: true,
      message: `Error fetching ${req.path}`
    });
    const err = new Error('test error in apiTestFetch controller');
    err.status = 400;
    next(err);
  } else {
    sendMessage({
      fetch: req.path,
      error: false,
      complete: false,
      message: 'API Fetch Started'
    });
    const t = setTimeout(() => {
      res.json({ success: true, t: Date.now() });
    }, delay);
  }

};