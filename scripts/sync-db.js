import sequelize from '../db/db.js';
import Meta from '../db/Meta.js';
import Movie from '../db/Movie.js';
import Show from '../db/Show.js';
import Game from '../db/Game.js';

async function syncDB() {
  await sequelize.sync({ force: true }); // force table drop + recreate
  console.log('Database synced successfully');
}

syncDB().catch((err) => console.error('Error syncing DB', err));