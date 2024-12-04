export const pageIndex = (req, res) => {
  res.render('pages/index', {
    title: 'Dashboard'
  });
}