import { addAlert } from '../middlewares/alertMiddleware.js';

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
}