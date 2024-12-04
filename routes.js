import express from "express";
import {
  pageIndex
} from './controllers/defaultController.js';
const router = express.Router();

/**
 * Pages
 */
router.get('/', pageIndex);

/**
 * API
 */
router.get('/api/status', (req, res) => res.json({ success: true, t: Date.now() }));

export default router;