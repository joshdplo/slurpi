import 'dotenv/config';

// Populate app.locals with initial data
function initAppData(app) {
  app.locals.title = null; // overridden by res, needed for all pages
  app.locals.messages = null; // overridden by res, needed for all pages
  app.locals.global = {
    NAME: process.env.NAME,
  };

  console.log(`app.locals populated successfully (${Object.keys(app.locals).length} items)`);
};

export default initAppData;