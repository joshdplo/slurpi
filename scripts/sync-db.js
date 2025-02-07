import sequelize from '../db/db.js';
import Meta from '../db/Meta.js';
import Message from '../db/Message.js';
import Movie from '../db/Movie.js';
import Show from '../db/Show.js';
import SteamGame from '../db/SteamGame.js';
import SpotifySong from '../db/SpotifySong.js';
import SpotifyAlbum from '../db/SpotifyAlbum.js';
import SpotifyArtist from '../db/SpotifyArtist.js';
import SpotifyShow from '../db/SpotifyShow.js';
import RadioStation from '../db/RadioStation.js';

async function syncDB() {
  await sequelize.sync({ force: true }); // force table drop + recreate
  console.log('Database synced successfully');
}

syncDB().catch((err) => console.error('Error syncing DB', err));