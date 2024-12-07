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
const validCats = ['games', 'recentgames', 'gamedetails'];
const urls = {
  games: `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${steamId64}`,
  recentgames: `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${apiKey}&steamid=${steamId64}`,
  gamedetails: (appId) => `https://store.steampowered.com/api/appdetails/?key=${apiKey}&appids=${appId}`,
}

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
  const force = req.query?.force;
  if (validCats.indexOf(cat) === -1) return res.json({ error: `Invalid category: ${cat}` });
  const fetchUrl = urls[cat];

  try {
    if (cat !== 'gamedetails') {
      // Standard categories
      const fetchedData = await steamFetch(fetchUrl);
      let numResults = 0;
      fetchedData.result.games.forEach(async game => {
        await SteamGame.findOrCreate({ where: { appid: game.appid } });
        numResults++;
      });

      if (cat === 'recentgames') {
        const allDbGames = await SteamGame.findAll();
        allDbGames.forEach(async game => {
          //@TODO: LEFT OFF HERE
        });
      }

      return res.json({ success: true, items: numResults, t: Date.now() });
    } else {
      // Game details monster request
      const dbGames = await SteamGame.findAll();
      if (dbGames.length === 0) return res.json({ error: 'No games found - can\'t fetch details', t: Date.now() });

      dbGames.forEach(game => {
        // if game already has details, we will skip it!
        // @TODO: implement force

      });
    }
  } catch (error) {
    console.error(error);
    res.json({ error, t: Date.now() });
  }
}