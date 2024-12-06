import 'dotenv/config';
import { sendMessage } from '../wss.js';
import Meta from '../db/Meta.js';
import Movie from '../db/Movie.js';
import Show from '../db/Show.js';

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
    return data;
  } catch (error) {
    console.error('error with tmdbFetch()', error);
  }
}

// Get TMDB Data
export async function getTMDBData(req, res) {
  const cat = req.params.category;
  const subcat = req.params.subcategory;

  if (validCats.indexOf(cat) === -1) return res.json({ error: `Invalid category: ${cat}` });
  if (validSubcats.indexOf(subcat) === -1) return res.json({ error: `Invalid subcategory: ${subcat}` });

  let currentPage = 1;
  const url = () => `/account/${accountId}/${subcat}/${cat}?language=en-US&page=${currentPage}&sort_by=created_at.asc`;

  try {
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
        } else {
          await currentModel.create(fetchedItem)
            .catch(err => console.error(err));
        }
      });

      res.json({ success: true, items: tmdbData.length, t: Date.now() });
    }
  } catch (error) {
    console.error(error);
    res.json({ error, t: Date.now() })
  }
}