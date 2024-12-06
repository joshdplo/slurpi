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
      const fetchedGames = fetchedData.response.games;

      let numResults = 0;
      for (let i = 0; i < fetchedGames.length; i++) {
        const dbGame = await SteamGame.findOne({ where: { appid: fetchedGames[i].appid } });
        if (dbGame) {
          await dbGame.update(fetchedGames[i]);
        } else {
          await SteamGame.create(fetchedGames[i]);
        }

        numResults++;
      }

      if (cat === 'recentgames') {
        const allDbGames = await SteamGame.findAll();
        for (let i = 0; i < allDbGames.length; i++) {
          const isRecent = fetchedGames.find(f => f.appid === allDbGames[i].appid) !== undefined;
          await allDbGames[i].update({ recent: isRecent });
        }
      }

      return res.json({ success: true, items: numResults, t: Date.now() });
    } else {
      // Game details monster request
      const dbGames = await SteamGame.findAll();
      if (dbGames.length === 0) return res.json({ error: 'No games found - can\'t fetch details', t: Date.now() });

      for (let i = 0; i < dbGames.length; i++) {
        const progress = Math.floor(((i + 1) / (dbGames.length + 1)) * 100);
        const message = `Game ${i + 1}/${dbGames.length + 1}`;

        sendMessage({
          fetch: req.path,
          error: false,
          complete: false,
          progress,
          message,
        });

        if (!force && dbGames[i].capsule_image) {
          // already has details
          console.log(`Already have details for ${dbGames[i].name}`);
        } else if (!force && dbGames[i].invalid) {
          // game is invalid, skip it
          console.log(`Appid ${dbGames[i].appid} is invalid - skipping`);
        } else {
          // needs details
          const fetchUrl = urls[cat](dbGames[i].appid);
          const fetchedGameRaw = await steamFetch(fetchUrl);
          const fetchedGame = fetchedGameRaw[dbGames[i].appid].data;

          if (fetchedGame?.name) {
            await dbGames[i].update(fetchedGame);
          } else {
            console.log(`Appid ${dbGames[i].appid} has no details - marking as invalid`);
            await dbGames[i].update({ invalid: true });
          }

          // Delay to (hopefully) not get rate-limited
          // - you will still get rate limited if you have too many games.
          //   steam allows 100k requests/day, which comes out to like 69 request/minute and x/hr etc
          await sleep();
        }
      }

      return res.json({ success: true, items: dbGames.length, t: Date.now() });
    }
  } catch (error) {
    console.error(error);
    res.json({ error, t: Date.now() });
  }
}