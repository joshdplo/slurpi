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

export async function getSpotifyLogin(req, res) {
  const state = generateRandomString(16);

  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope: scopes.join(' '),
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
      state: state
    }));
}

export async function getSpotifyCallback(req, res) {
  res.json({ placeholder: true });
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