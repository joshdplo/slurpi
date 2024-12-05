import express from "express";
import { pageDashboard } from './controllers/defaultController.js';
import {
  pageTMDB
} from './controllers/tmdbController.js';
import {
  pageSteam
} from './controllers/steamController.js';
import {
  pageSpotify
} from './controllers/spotifyController.js';
const router = express.Router();

/**
 * Pages
 */
router.get('/', pageDashboard);
router.get('/tmdb', pageTMDB);
router.get('/steam', pageSteam);
router.get('/spotify', pageSpotify);

/**
 * API
 */
router.get('/api/status', (req, res) => res.json({ success: true, t: Date.now(), dbSize: req.locals.dbSize }));

export default router;