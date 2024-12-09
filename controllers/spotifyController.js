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
    res.render('pages/spotify', {
      title: 'Spotify'
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
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
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
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
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
const validCats = ['tracks', 'albums', 'shows', 'artists', 'toptracks'];
const baseUrl = 'https://api.spotify.com/v1/me';
const catUrls = {
  tracks: '/tracks?offset=0&limit=50&locale=en-US', // saved tracks @ user-library-read
  albums: '/albums?offset=0&limit=50&locale=en-US', // saved albums @ user-library-read
  shows: '/shows?offset=0&limit=50&locale=en-US', // saved shows (podcasts) @ user-library-read
  artists: '/following?type=artist&limit=50&locale=en-US', // user followed artists @ user-follow-read
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
  if (category === 'tracks' || category === 'toptracks') model = SpotifySong;
  if (category === 'albums') model = SpotifyAlbum;
  if (category === 'artists') model = SpotifyArtist;
  if (category === 'shows') model = SpotifyShow;

  return model;
}

export async function getSpotifyData(req, res) {
  const cat = req.params.category;
  if (validCats.indexOf(cat) === -1) return res.json({ error: `Invalid category: ${cat}` });
  const fetchUrl = `${baseUrl}${catUrls[cat]}`;
  const currentModel = getSpotifyModel(cat);

  try {
    const meta = await Meta.findByPk(1);
    const initialData = await spotifyFetch(req, fetchUrl);

    // Top-level data (varies between request type)
    // this should contain the fields 'limit', 'total', 'next', etc.
    const getUnwrappedData = () => {
      if (cat === 'artists') return initialData.artists;
      return initialData;
    }

    // Iterable data (varies between request type)
    // this would be the items[] array
    const getIterableData = () => {
      if (cat === 'artists') return initialData.artists.items;
      return initialData.items;
    }

    const unwrappedData = getUnwrappedData();
    const iterableData = getIterableData();

    const getTotalResults = () => {
      if (cat === 'toptracks') return unwrappedData.limit;
      return unwrappedData.total;
    }

    let spotifyData = [...iterableData];
    const nextUrl = unwrappedData.next;
    const limit = unwrappedData.limit;
    const totalResults = getTotalResults();
    const numPages = Math.ceil(totalResults / limit);

    if (limit < totalResults && nextUrl) {
      for (let i = 0; i < numPages; i++) {
        const newData = await spotifyFetch(req, nextUrl);
        spotifyData = [...newData.items, ...spotifyData];

        sendMessage({
          fetch: req.path,
          error: false,
          complete: false,
          progress: Math.floor((i + 1 / numPages) * 100),
          message: `Page ${i + 1}/${numPages}`,
        });
      }
    }

    // TESTING: WRITE THE JSON SO WE CAN EASILY SEE THE STRUCTURE
    await writeFile(join(`/scripts/${cat}.json`), JSON.stringify(spotifyData));
    // END TESTING

    res.json({ success: true, items: spotifyData.length, t: Date.now() });
  } catch (error) {
    console.error(error);
    res.json({ error, t: Date.now() });
  }
};