import 'dotenv/config';
import { writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { Readable } from 'node:stream';
import { join } from '../be-util.js';
import { sendMessage } from '../wss.js';
import Meta from '../db/Meta.js';
import Movie from '../db/Movie.js';
import Show from '../db/Show.js';

/**
 * Meta Data
 */
let metaApiCalls = 0;
let metaDBWrites = 0;
let metaImageDownloads = 0;

/**
 * TMDB Pages
 */
export async function pageTMDB(req, res, next) {
  try {
    const movies = await Movie.findAll();
    const shows = await Show.findAll();

    res.render('pages/tmdb', {
      title: 'TMDB',
      description: 'Movies and TV Shows Data from TMDB (themoviedb.org)',
      movies,
      shows
    });
  } catch (error) {
    console.error(error.message);
    error.status = 500;
    next(error);
  }
}

/**
 * TMDB API
 */
const accessToken = process.env.TMDB_ACCESS_TOKEN;
const accountId = process.env.TMDB_ACCOUNT_ID;
const validCats = ['movies', 'tv'];
const validSubcats = ['favorite', 'rated'];

// TMDB Model Helper
function getTMDBModel(category) {
  let model;
  if (category === 'movies') model = Movie;
  if (category === 'tv') model = Show

  return model;
}

// TMDB Fetch Helper
async function tmdbFetch(path) {
  const url = `https://api.themoviedb.org/3${path}`;

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${accessToken}`
    }
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      console.log(response);
      throw new Error('tmdbFetch() response fetch not ok');
    };

    const data = await response.json();
    metaApiCalls++;
    return data;
  } catch (error) {
    console.error('error with tmdbFetch()', error);
  }
}

/* Get TMDB Data */
export async function getTMDBData(req, res) {
  const cat = req.params.category;
  const subcat = req.params.subcategory;
  if (validCats.indexOf(cat) === -1) return res.json({ error: `Invalid category: ${cat}` });
  if (validSubcats.indexOf(subcat) === -1) return res.json({ error: `Invalid subcategory: ${subcat}` });

  let currentPage = 1;
  const url = () => `/account/${accountId}/${subcat}/${cat}?language=en-US&page=${currentPage}&sort_by=created_at.asc`;

  try {
    const meta = await Meta.findByPk(1);

    // Initial fetch - get total pages
    const initialData = await tmdbFetch(url());
    const totalPages = initialData.total_pages;
    const totalResults = initialData.total_results;
    const tmdbData = [];

    initialData.results.forEach(result => tmdbData.push(result));

    // If total pages > 1, get all pages
    if (totalPages > currentPage) {
      currentPage++;

      for (let i = currentPage; i <= totalPages; i++) {
        const pageResults = await tmdbFetch(url());
        pageResults.results.forEach(result => tmdbData.push(result));

        // websocket message for loader
        sendMessage({
          fetch: req.path,
          error: false,
          complete: false,
          progress: Math.floor((currentPage / totalPages) * 100),
          message: `Page ${currentPage}/${totalPages} (${totalResults} items)`,
        });

        currentPage++;
      }
    }

    // Get fields from model and only save those fields
    const currentModel = getTMDBModel(cat);
    const currentData = await currentModel.findAll();

    if (currentData.length === 0) {
      // If there is no data, bulk create the data
      await currentModel.bulkCreate(tmdbData, { validate: true })
        .then(() => {
          metaDBWrites++;
          res.json({ success: true, items: tmdbData.length, t: Date.now() });
        })
        .catch(err => {
          console.error(err.original.message);
          res.json({ error: err.original.message, t: Date.now() });
        });
    } else {
      // If there's already data, just update the existing data
      tmdbData.forEach(async fetchedItem => {
        const dbItem = currentData.find(i => i.id === fetchedItem.id);
        if (dbItem) {
          await dbItem.update(fetchedItem)
            .catch(err => console.error(err));
          metaDBWrites++;
        } else {
          await currentModel.create(fetchedItem)
            .catch(err => console.error(err));
          metaDBWrites++;
        }
      });

      const metaTotalObj = () => {
        let key;
        if (cat === 'movies') {
          if (subcat === 'rated') {
            key = 'ratedMovies';
          } else {
            key = 'totalMovies';
          }
        }
        if (cat === 'tv') {
          if (subcat === 'rated') {
            key = 'ratedShows';
          } else {
            key = 'totalShows';
          }
        }

        return { [key]: totalResults };
      }

      await meta.update({
        totalApiCalls: meta.totalApiCalls + metaApiCalls,
        totalDBWrites: meta.totalDBWrites + metaDBWrites,
        ...metaTotalObj()
      });

      res.json({ success: true, items: tmdbData.length, t: Date.now() });
    }
  } catch (error) {
    console.error(error);
    res.json({ error, t: Date.now() });
  }
}

/* Get TMDB Images */
export async function getTMDBImages(req, res) {
  const cat = req.params.category;
  const force = req.query?.force;
  if (validCats.indexOf(cat) === -1) return res.json({ error: `Invalid category: ${cat}` });

  try {
    const meta = await Meta.findByPk(1);

    const currentModel = getTMDBModel(cat);
    const imageFolder = '/public/images/tmdb';
    const dbItems = await currentModel.findAll();

    const imageURLs = [];
    for (let i = 0; i < dbItems.length; i++) {
      if (dbItems[i].poster_path) imageURLs.push({ id: dbItems[i].id, url: `https://image.tmdb.org/t/p/w200/${dbItems[i].poster_path}` })
    }

    for (let i = 0; i < imageURLs.length; i++) {
      const imagePath = join(`${imageFolder}/${imageURLs[i].id}.jpg`);
      const imageExists = await existsSync(imagePath);
      if (!force && imageExists) {
        sendMessage({
          fetch: req.path,
          error: false,
          complete: false,
          progress: Math.floor((i + 1 / imageURLs.length) * 100),
          message: `Skipping image ${i + 1}/${imageURLs.length} (already exists)`,
        });
      } else {
        sendMessage({
          fetch: req.path,
          error: false,
          complete: false,
          progress: Math.floor((i + 1 / imageURLs.length) * 100),
          message: `Image ${i + 1}/${imageURLs.length}`,
        });

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
    res.json({ success: true, items: imageURLs.length, t: Date.now() });
  } catch (error) {
    console.error(error);
    res.json({ error, t: Date.now() });
  }
}
