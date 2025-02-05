import { writeFile } from 'node:fs/promises';
import { join } from '../be-util.js';
import Meta from '../db/Meta.js';
import Movie from '../db/Movie.js';
import Show from '../db/Show.js';
import SteamGame from '../db/SteamGame.js';
import SpotifySong from '../db/SpotifySong.js';
import SpotifyAlbum from '../db/SpotifyAlbum.js';
import SpotifyArtist from '../db/SpotifyArtist.js';
import SpotifyShow from '../db/SpotifyShow.js';
import RadioStation from '../db/RadioStation.js';

(async () => {
  const meta = await Meta.findAll();
  const movies = await Movie.findAll();
  const shows = await Show.findAll();
  const steamGames = await SteamGame.findAll();
  const spotifySongs = await SpotifySong.findAll();
  const spotifyAlbums = await SpotifyAlbum.findAll();
  const spotifyArtists = await SpotifyArtist.findAll();
  const spotifyShows = await SpotifyShow.findAll();
  const radioStations = await RadioStation.findAll();

  const data = { meta, movies, shows, steamGames, spotifySongs, spotifyAlbums, spotifyArtists, spotifyShows, radioStations };
  for (const key of Object.keys(data)) {
    console.log(`Writing ${key} JSON (${data[key].length} items)...`);
    await writeFile(join(`/json/${key}.json`), JSON.stringify(data[key]));
  }

  console.log('JSON DONE!');
})()