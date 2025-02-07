import Message from '../db/Message.js';

/**
 * Messages Page
 */
export async function pageMessage(req, res, next) {
  try {
    const messages = await Message.findAll();

    res.render('pages/messages', {
      title: 'Messages',
      description: 'Messages from Web Server',
      messages,
    });
  } catch (error) {
    console.error(error.message);
    error.status = 500;
    next(error);
  }
}