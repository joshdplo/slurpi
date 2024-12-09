import 'dotenv/config';
import querystring from 'node:querystring';
import { generateRandomString } from "../be-util.js";

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

// Spotify Auth
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
  tracks: '/tracks?offset=0&limit=50', // saved tracks @ user-library-read
  albums: '/albums?offset=0&limit=50', // saved albums @ user-library-read
  shows: '/shows?offset=0&limit=50', // saved shows (podcasts) @ user-library-read
  artists: '/following?type=artist&limit=50', // user followed artists @ user-follow-read
  toptracks: '/top/tracks?limit=10&time_range=long_term' // top tracks @ user-top-read
};

export async function getSpotifyData(req, res) {
  const cat = req.params.category;
  if (validCats.indexOf(cat) === -1) return res.json({ error: `Invalid category: ${cat}` });
  const fetchUrl = `${baseUrl}${catUrls[cat]}`;

  try {

  } catch (error) {
    console.error(error);
    res.json({ error, t: Date.now() });
  }
};