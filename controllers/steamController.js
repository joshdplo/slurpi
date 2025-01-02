import 'dotenv/config';
import { writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { Readable } from 'node:stream';
import { join, sleep } from '../be-util.js';
import { sendMessage } from '../wss.js';
import Meta from '../db/Meta.js';
import SteamGame from "../db/SteamGame.js";

/**
 * Meta Data
 */
let metaApiCalls = 0;
let metaDBWrites = 0;
let metaImageDownloads = 0;

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
const validCats = ['games', 'recentgames', 'gamedetails', 'capsule'];
const urls = {
  games: `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${steamId64}`,
  recentgames: `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${apiKey}&steamid=${steamId64}`,
  gamedetails: (appId) => `https://store.steampowered.com/api/appdetails/?key=${apiKey}&appids=${appId}`,
};

// Steam Fetch Helper
async function steamFetch(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      console.log(response);
      throw new Error('steamFetch() response fetch not ok');
    };

    metaApiCalls++;
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('error with steamFetch()', error);
  }
}

/* Get Steam Data */
export const getSteamData = async (req, res) => {
  const cat = req.params.category;
  const force = req.query?.force;
  if (validCats.indexOf(cat) === -1) return res.json({ error: `Invalid category: ${cat}` });
  const fetchUrl = urls[cat];

  try {
    const meta = await Meta.findByPk(1);

    if (cat !== 'gamedetails') {
      // Standard categories
      const fetchedData = await steamFetch(fetchUrl);
      const fetchedGames = fetchedData.response.games;

      let numResults = 0;
      for (let i = 0; i < fetchedGames.length; i++) {
        const dbGame = await SteamGame.findOne({ where: { appid: fetchedGames[i].appid } });
        if (dbGame) {
          await dbGame.update(fetchedGames[i]);
          metaDBWrites++;
        } else {
          await SteamGame.create(fetchedGames[i]);
          metaDBWrites++;
        }

        numResults++;
      }

      if (cat === 'recentgames') {
        const allDbGames = await SteamGame.findAll();
        for (let i = 0; i < allDbGames.length; i++) {
          const isRecent = fetchedGames.find(f => f.appid === allDbGames[i].appid) !== undefined;
          await allDbGames[i].update({ recent: isRecent });
          metaDBWrites++;
        }

        await meta.update({ totalRecentSteamGames: fetchedGames.length, totalApiCalls: meta.totalApiCalls + metaApiCalls, totalDBWrites: meta.totalDBWrites + metaDBWrites });
      }

      if (cat === 'games') await meta.update({ totalSteamGames: fetchedGames.length, totalApiCalls: meta.totalApiCalls + metaApiCalls, totalDBWrites: meta.totalDBWrites + metaDBWrites });

      metaDBWrites = 0;
      metaApiCalls = 0;
      return res.json({ success: true, items: numResults, t: Date.now() });
    } else {
      // Game details monster request
      const dbGames = await SteamGame.findAll();
      if (dbGames.length === 0) return res.json({ error: 'No games found - can\'t fetch details', t: Date.now() });

      for (let i = 0; i < dbGames.length; i++) {
        const progress = Math.floor(((i + 1) / (dbGames.length)) * 100);
        const message = `Game ${i + 1}/${dbGames.length}`;

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

          // Delay to (hopefully) not get per-minute rate-limited
          // - you will still get per-hour rate limited if you have too many games.
          //   steam allows 100k requests/day at the time of writing, which
          //   comes out to ~69 request/minute
          metaDBWrites++;
          await sleep();
        }
      }

      await meta.update({ totalApiCalls: meta.totalApiCalls + metaApiCalls, totalDBWrites: meta.totalDBWrites + metaDBWrites });
      return res.json({ success: true, items: dbGames.length, t: Date.now() });
    }
  } catch (error) {
    console.error(error);
    res.json({ error, t: Date.now() });
  }
}

/* Get Steam Images */
export async function getSteamImages(req, res) {
  const cat = req.params.category;
  const force = req.query?.force;
  if (validCats.indexOf(cat) === -1) return res.json({ error: `Invalid category: ${cat}` });

  try {
    const meta = await Meta.findByPk(1);
    const imageFolder = '/public/images/steam';
    const dbItems = await SteamGame.findAll();

    const imageURLs = [];
    for (let i = 0; i < dbItems.length; i++) {
      if (dbItems[i]?.capsule_image) imageURLs.push({ appid: dbItems[i].appid, url: dbItems[i].capsule_image })
    }

    for (let i = 0; i < imageURLs.length; i++) {
      const imagePath = join(`${imageFolder}/${imageURLs[i].appid}.jpg`);
      const imageExists = await existsSync(imagePath);
      if (!force && imageExists) {
        sendMessage({
          fetch: req.path,
          error: false,
          complete: false,
          progress: Math.floor((i + 1 / imageURLs.length) * 100),
          message: `Skipping image ${i + 1}/${imageURLs.length} (already exists)`,
        });
        console.log(`Skipping image ${i + 1}/${imageURLs.length} (already exists)`);
      } else {
        sendMessage({
          fetch: req.path,
          error: false,
          complete: false,
          progress: Math.floor((i + 1 / imageURLs.length) * 100),
          message: `Image ${i + 1}/${imageURLs.length}`,
        });
        console.log(`Image ${i + 1}/${imageURLs.length}`);

        const response = await fetch(imageURLs[i].url);
        const stream = Readable.fromWeb(response.body);
        await writeFile(imagePath, stream);
        metaImageDownloads++;
      }

      // it looks like images may not be rate limited, so we don't need to sleep() here!
      // if you get a 429, try throwing in a sleep(500) here or higher
    }

    await meta.update({ totalImageDownloads: meta.totalImageDownloads + metaImageDownloads });
    metaImageDownloads = 0;
    res.json({ success: true, items: dbItems.length, t: Date.now() });
  } catch (error) {
    console.error(error);
    res.json({ error, t: Date.now() });
  }
}

/* Update Steam Item */
export async function postSteamItem(req, res) {
  const cat = req.params.category;
  const id = req.params.id;
  if (validCats.indexOf(cat) === -1) return res.json({ error: `Invalid category: ${cat}` });

  try {
    const item = await SteamGame.findOne({ where: { appid: id } });

    if (item) {
      for (let [key, val] of Object.entries(req.body)) {
        item[key] = val;
      }
      await item.save();
      res.json({ success: true, items: 1, t: Date.now() });
    } else {
      res.json({ error: `Item with appid ${id} not found`, t: Date.now() });
    }
  } catch (error) {
    console.error(error);
    res.json({ error, t: Date.now() });
  }
}