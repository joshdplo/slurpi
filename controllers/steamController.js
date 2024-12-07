import 'dotenv/config';
import { sleep } from '../be-util.js';
import { sendMessage } from '../wss.js';
import Meta from '../db/Meta.js';
import SteamGame from "../db/SteamGame.js";

/**
 * Steam Pages
 */
export async function pageSteam(req, res, next) {
  const steamGames = await SteamGame.findAll();

  try {
    res.render('pages/steam', {
      title: 'Steam',
      description: 'Games Data from Steam (steampowered.com)',
      steamGames
    });
  } catch (error) {
    console.error(error.message);
    error.status = 500;
    next(error);
  }
}

/**
 * Steam API
 */
const apiKey = process.env.STEAM_API_KEY;
const steamId64 = process.env.STEAM_ID_64;

const urls = {
  games: `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${steamId64}`,
  recentgames: `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${apiKey}&steamid=${steamId64}`,
  gamedetails: (appId) => `https://store.steampowered.com/api/appdetails/?key=${apiKey}&appids=${appId}`,
}

const validCats = ['games', 'recentgames', 'gamedetails'];

// Steam Fetch Helper
async function steamFetch(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      console.log(response);
      throw new Error('steamFetch() response fetch not ok');
    };

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('error with steamFetch()', error);
  }
}

// Get Steam Data
export const getSteamData = async (req, res) => {
  const cat = req.params.category;
  if (validCats.indexOf(cat) === -1) return res.json({ error: `Invalid category: ${cat}` });

  try {
    if (cat !== 'gamedetails') {

    } else {
      // Game details monster request
      const dbGames = await SteamGame.findAll();
      if (dbGames.length === 0) return res.json({ error: 'No games found - fetch games before fetching game details', t: Date.now() });
    }
  } catch (error) {
    console.error(error);
    res.json({ error, t: Date.now() });
  }
}