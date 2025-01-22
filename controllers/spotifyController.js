import 'dotenv/config';
import querystring from 'node:querystring';
import { writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { Readable } from 'node:stream';
import { generateRandomString } from "../be-util.js";
import { join } from '../be-util.js';
import { sendMessage } from '../wss.js';
import Meta from '../db/Meta.js';
import SpotifySong from '../db/SpotifySong.js';
import SpotifyAlbum from '../db/SpotifyAlbum.js';
import SpotifyArtist from '../db/SpotifyArtist.js';
import SpotifyShow from '../db/SpotifyShow.js';

const REDIRECT_URI = process.env.NODE_ENV === 'production' ? process.env.SPOTIFY_REDIRECT_URI_PROD : process.env.SPOTIFY_REDIRECT_URI;

/**
 * Meta Data
 */
let metaApiCalls = 0;
let metaDBWrites = 0;
let metaImageDownloads = 0;

/**
 * Spotify Page
 */
export async function pageSpotify(req, res, next) {
  try {
    const songs = await SpotifySong.findAll();
    const albums = await SpotifyAlbum.findAll();
    const artists = await SpotifyArtist.findAll();
    const shows = await SpotifyShow.findAll();

    res.render('pages/spotify', {
      title: 'Spotify',
      songs,
      albums,
      artists,
      shows
    });
  } catch (error) {
    console.error(error.message);
    error.status = 500;
    next(error);
  }
}

/**
 * Spotify Auth
 */
const scopes = ['user-library-read', 'user-top-read', 'user-follow-read'];
const state = generateRandomString(16);

// Spotify Login (Redirect)
export async function getSpotifyLogin(req, res) {
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope: scopes.join(' '),
      redirect_uri: REDIRECT_URI,
      state: state
    }));
}

// Spotify Callback
export async function getSpotifyCallback(req, res) {
  const code = req.query.code || null;
  const stateStr = req.query.state || null;

  console.log('--- In Spotify Callback ---');
  console.log(`code: ${code}`);
  console.log(`state: ${stateStr}`);

  // match state for extra security as suggested by spotify api
  if (stateStr === null || stateStr !== state) return res.json({ error: 'state mismatch', t: Date.now() });

  // Set up fetch
  const fetchBodyObj = {
    code,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code'
  };
  const urlSearchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(fetchBodyObj)) {
    urlSearchParams.append(key, value);
  }
  const url = 'https://accounts.spotify.com/api/token';
  const fetchOptions = {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + (new Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'))
    },
    body: urlSearchParams
  };

  try {
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      console.log(response);
      throw new Error('spotify callback fetch response not ok');
    };

    const data = await response.json();
    if (data.access_token) {
      req.session.spotifyAccessToken = data.access_token;
      req.session.spotifyLoggedIn = true;

      res.redirect('/spotify');
    } else {
      req.session.spotifyLoggedIn = false;
      return res.json({ error: 'Did not receive access token from auth' });
    }
  } catch (error) {
    console.error(error);
    req.session.spotifyLoggedIn = false;
    return res.json({ error: 'Error getting spotify callback', t: Date.now() });
  }

};

/**
 * Spotify API
 */
const validCats = ['tracks', 'songs', 'albums', 'shows', 'artists', 'toptracks'];
const baseUrl = 'https://api.spotify.com/v1/me';
const catUrls = {
  tracks: '/tracks?offset=0&limit=50&locale=en-US', // saved tracks @ user-library-read
  albums: '/albums?offset=0&limit=50&locale=en-US', // saved albums @ user-library-read
  shows: '/shows?offset=0&limit=50&locale=en-US', // saved shows (podcasts) @ user-library-read
  artists: '/following?type=artist&limit=10&locale=en-US', // user followed artists @ user-follow-read // @TODO RESET LIMIT AFTER TESTING
  toptracks: '/top/tracks?limit=10&time_range=long_term&locale=en-US' // top tracks @ user-top-read
};

// Spotify Fetch Helper
async function spotifyFetch(req, path) {
  const token = req?.session?.spotifyAccessToken;
  if (!token) {
    const err = 'Invalid token in spotifyFetch:';
    console.error(err, token);
    throw new Error(err);
  }

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${req.session.spotifyAccessToken}`
    }
  };

  try {
    const response = await fetch(path, options);
    if (!response.ok) {
      console.log(response);
      throw new Error('spotifyFetch() response fetch not ok');
    };

    const data = await response.json();
    metaApiCalls++;
    return data;
  } catch (error) {
    console.error('error with spotifyFetch()', error);
  }
}

// Spotify Model Helper
function getSpotifyModel(category) {
  let model;
  if (category === 'tracks' || category === 'toptracks' || category === 'songs') model = SpotifySong;
  if (category === 'albums') model = SpotifyAlbum;
  if (category === 'artists') model = SpotifyArtist;
  if (category === 'shows') model = SpotifyShow;

  return model;
}

// Spotify Formatting Helper
function formatSpotifyData(cat, data) {
  const formatted = [];

  for (let i = 0; i < data.length; i++) {
    let item = data[i];

    // tracks/toptracks formatting
    if (cat === 'tracks' || cat === 'toptracks') {
      item = cat === 'tracks' ? data[i].track : data[i];

      formatted.push({
        id: item.id,
        isTopTrack: cat === 'toptracks',
        name: item.name,
        artists: item.artists.map(a => ({ name: a.name, url: a.external_urls?.spotify })),
        duration_ms: item.duration_ms,
        url: item.external_urls?.spotify,
        image: item.album?.images[1].url, // ~300px
        release_date: item.album?.release_date
      });
    }

    // albums formatting
    if (cat === 'albums') {
      item = data[i].album;

      formatted.push({
        id: item.id,
        name: item.name,
        artists: item.artists.map(a => ({ name: a.name, url: a.external_urls?.spotify })),
        total_tracks: item.total_tracks,
        url: item.external_urls?.spotify,
        image: item?.images[1].url, // ~300px
        release_date: item.release_date
      });
    }

    // artists formatting
    if (cat === 'artists') {

      formatted.push({
        id: item.id,
        name: item.name,
        genres: item.genres,
        url: item.external_urls?.spotify,
        image: item?.images[1].url // ~300px
      });
    }

    // shows formatting
    if (cat === 'shows') {
      item = data[i].show;

      formatted.push({
        id: item.id,
        name: item.name,
        description: item.description,
        total_episodes: item.total_episodes,
        url: item.external_urls?.spotify,
        image: item?.images[1].url // ~300px
      });
    }
  }

  return formatted;
}

/* Get Spotify Data */
export async function getSpotifyData(req, res) {
  const cat = req.params.category;
  const force = req.query?.force;
  if (validCats.indexOf(cat) === -1) return res.json({ error: `Invalid category: ${cat}` });
  const fetchUrl = `${baseUrl}${catUrls[cat]}`;
  const currentModel = getSpotifyModel(cat);

  try {
    const meta = await Meta.findByPk(1);

    let currentPage = 1;
    const initialData = await spotifyFetch(req, fetchUrl);

    // Top-level data (varies between request type)
    // this should contain the fields 'limit', 'total', 'next', etc.
    const getUnwrappedData = (raw) => {
      if (cat === 'artists') return raw.artists;
      return raw;
    }

    const unwrappedData = getUnwrappedData(initialData);
    const iterableData = unwrappedData.items;

    const getTotalResults = () => {
      if (cat === 'toptracks') return unwrappedData.limit;
      return unwrappedData.total;
    }

    let spotifyData = [...iterableData];
    let nextUrl = unwrappedData.next;
    const limit = unwrappedData.limit;
    const totalResults = getTotalResults();
    const totalPages = Math.ceil(totalResults / limit);

    if ((totalPages > currentPage) && nextUrl) {
      currentPage++;

      for (let i = currentPage; i <= totalPages; i++) {
        if (!nextUrl) return;
        const newData = await spotifyFetch(req, nextUrl);
        const newDataUnwrapped = getUnwrappedData(newData);

        console.log('@@@@@@@@@@');//REMOVE
        console.log(newDataUnwrapped.next);//REMOVE
        spotifyData = [...newDataUnwrapped.items, ...spotifyData];

        sendMessage({
          fetch: req.path,
          error: false,
          complete: false,
          progress: Math.floor((currentPage / totalPages) * 100),
          message: `Page ${currentPage}/${totalPages} (${totalResults} items)`,
        });

        nextUrl = newDataUnwrapped.next;
        currentPage++;
      }
    }

    // format the data for DB writing
    const formattedData = formatSpotifyData(cat, spotifyData);

    // write the data to DB
    for (let i = 0; i < formattedData.length; i++) {
      const dbItem = await currentModel.findByPk(formattedData[i].id);

      if (force || !dbItem) {
        currentModel.create(formattedData[i]);
        metaDBWrites++;
      } else {
        await dbItem.update(formattedData[i]);
      }
    }

    await meta.update({
      totalApiCalls: meta.totalApiCalls + metaApiCalls,
      totalDBWrites: meta.totalDBWrites + metaDBWrites
    });
    metaApiCalls = 0;
    metaDBWrites = 0;

    res.json({ success: true, items: formattedData.length, t: Date.now() });
  } catch (error) {
    console.error(error);
    res.json({ error, t: Date.now() });
  }
};

/* Get Spotify Images */
export async function getSpotifyImages(req, res) {
  const cat = req.params.category;
  const force = req.query?.force;
  if (validCats.indexOf(cat) === -1) return res.json({ error: `Invalid category: ${cat}` });

  try {
    const meta = await Meta.findByPk(1);
    const currentModel = getSpotifyModel(cat);
    const imageFolder = '/public/images/spotify';
    const dbItems = await currentModel.findAll();

    const imageURLs = [];
    for (let i = 0; i < dbItems.length; i++) {
      if (dbItems[i].image) imageURLs.push({ id: dbItems[i].id, url: dbItems[i].image });
    }

    for (let i = 0; i < imageURLs.length; i++) {
      const imagePath = join(`${imageFolder}/${imageURLs[i].id}.jpg`);
      const imageExists = await existsSync(imagePath);

      if (!force && imageExists) {
        sendMessage({
          fetch: req.path,
          error: false,
          complete: false,
          progress: Math.floor((i + 1 / imageURLs.length) * 100),
          message: `Skipping image ${i + 1}/${imageURLs.length} (already exists)`,
        });
        console.log(`Skipping image ${i + 1}/${imageURLs.length} (already exists)`);
      } else {
        sendMessage({
          fetch: req.path,
          error: false,
          complete: false,
          progress: Math.floor((i + 1 / imageURLs.length) * 100),
          message: `Image ${i + 1}/${imageURLs.length}`,
        });
        console.log(`Image ${i + 1}/${imageURLs.length}`);

        const response = await fetch(imageURLs[i].url);
        const stream = Readable.fromWeb(response.body);
        await writeFile(imagePath, stream);
        metaImageDownloads++;
      }

      // it looks like images may not be rate limited, so we don't need to sleep() here!
      // if you get a 429, try throwing in a sleep(500) here or higher
    }

    await meta.update({
      totalImageDownloads: meta.totalImageDownloads + metaImageDownloads
    });
    metaImageDownloads = 0;

    res.json({ success: true, items: imageURLs.length, t: Date.now() });
  } catch (error) {
    console.error(error);
    res.json({ error, t: Date.now() });
  }
}

/* Update Spotify Item */
export async function postSpotifyItem(req, res) {
  const cat = req.params.category;
  const id = req.params.id;
  if (validCats.indexOf(cat) === -1) return res.json({ error: `Invalid category: ${cat}` });

  try {
    const currentModel = getSpotifyModel(cat);
    const item = await currentModel.findByPk(id);
    if (item) {
      if (req.body.delete) {
        await item.destroy();
      } else {
        for (let [key, val] of Object.entries(req.body)) {
          item[key] = val;
        }
        await item.save();
      }
      res.json({ success: true, items: 1, t: Date.now() });
    } else {
      res.json({ error: `Item with id ${id} not found`, t: Date.now() });
    }
  } catch (error) {
    console.error(error);
    res.json({ error, t: Date.now() });
  }
}