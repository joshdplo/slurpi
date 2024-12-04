export const addMessage = (req, message, type = 'info') => {
  if (!req.session.messages) req.session.messages = [];
  req.session.messages.push({ text: message, type });
};

export const messageMiddleware = (req, res, next) => {
  res.locals.messages = req.session.messages || [];
  req.session.messages = []; // Clear message after transferring to res.locals
  next();
}