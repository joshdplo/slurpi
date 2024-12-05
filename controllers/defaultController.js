import { addAlert } from '../middlewares/alertMiddleware.js';

export const pageIndex = async (req, res) => {
  try {
    addAlert(req, 'Testing the alert', 'success');

    res.render('pages/index', {
      title: 'Dashboard'
    });
  } catch (error) {
    console.error(error.message);
    error.status = 500;
    next(error);
  }
}