import { addAlert } from '../middlewares/alertMiddleware.js';

export const pageIndex = (req, res) => {
  addAlert(req, 'Testing the alert', 'success');

  res.render('pages/index', {
    title: 'Dashboard'
  });
}