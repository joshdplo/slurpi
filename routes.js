import express from "express";
import {
  pageDashboard,
  pageTest,
  apiTestFetch,
} from './controllers/defaultController.js';
import {
  pageTMDB,
  getTMDBData,
  getTMDBImages,
  postTMDBItem
} from './controllers/tmdbController.js';
import {
  pageSteam,
  getSteamData,
  getSteamImages,
  postSteamItem,
} from './controllers/steamController.js';
import {
  pageSpotify,
  getSpotifyLogin,
  getSpotifyCallback,
  getSpotifyData,
  getSpotifyImages
} from './controllers/spotifyController.js';
const router = express.Router();

/**
 * Pages
 */
router.get('/', pageDashboard);
router.get('/test', pageTest);
router.get('/tmdb', pageTMDB);
router.get('/steam', pageSteam);
router.get('/spotify', pageSpotify);

/**
 * API
 */
// Generic
router.get('/api/status', (req, res) => res.json({ success: true, t: Date.now() }));
router.get(['/api/test-fetch', '/api/test-fetch/:delay'], apiTestFetch);

// TMDB
router.get('/api/tmdb/:category/:subcategory', getTMDBData);
router.get('/api/tmdb-images/:category', getTMDBImages);
router.post('/api/tmdb-item/:category/:id', postTMDBItem);

// Steam
router.get('/api/steam/:category', getSteamData);
router.get('/api/steam-images/:category', getSteamImages);
router.post('/api/steam-item/:category/:id', postSteamItem);

// Spotify
router.get('/spotify/login', getSpotifyLogin);
router.get('/auth/spotify', getSpotifyCallback);
router.get('/api/spotify/:category', getSpotifyData);
router.get('/api/spotify-images/:category', getSpotifyImages);

export default router;