import Meta from '../db/Meta.js';
import Message from '../db/Message.js';

/**
 * Messages Page
 */
export async function pageMessage(req, res, next) {
  try {
    const meta = await Meta.findByPk(1);
    const messagesData = await Message.findAll();

    res.render('pages/messages', {
      title: 'Messages',
      description: 'Messages from Web Server',
      messagesData,
      meta
    });
  } catch (error) {
    console.error(error.message);
    error.status = 500;
    next(error);
  }
}