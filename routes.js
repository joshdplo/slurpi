import express from "express";
import {
  pageDashboard,
  pageTest,
  apiTestFetch
} from './controllers/defaultController.js';
import {
  pageTMDB,
  getTMDBData
} from './controllers/tmdbController.js';
import {
  pageSteam,
  getSteamData
} from './controllers/steamController.js';
import {
  pageSpotify
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

// Steam
router.get('/api/steam/:category', getSteamData);

export default router;