import 'dotenv/config';
import { getDBSize } from '../be-util.js';

// Populate app.locals with initial data
async function initAppData(app) {
  app.locals.title = null; // overridden by res, needed for all pages
  app.locals.description = null; // overridden by res, needed for all pages
  app.locals.messages = null; // overridden by res, needed for all pages
  app.locals.dbSize = await getDBSize();
  app.locals.global = {
    NAME: process.env.NAME,
    DESCRIPTION: process.env.DESCRIPTION
  };

  console.log(`app.locals populated successfully (${Object.keys(app.locals).length} items)`);
};

export default initAppData;