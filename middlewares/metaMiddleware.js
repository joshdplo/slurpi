import Meta from "../db/Meta.js";
import { formatNumber } from "../be-util.js";

export default async function metaMiddleware(req, res, next) {
  try {
    // Get Meta from DB
    let meta = await Meta.findByPk(1);

    // Missing meta?
    if (!meta) {
      console.log('Meta not found in the DB - Creating it...');
      meta = await Meta.create(); // everything in meta schema has default values
    }

    // Get Total Items
    const trackedTotals = ['totalMovies', 'totalShows', 'totalSteamGames', 'totalSpotifySongs', 'totalSpotifyArtists', 'totalSpotifyShows'];
    let totalItems = 0;
    for (let i of Object.keys(meta.dataValues)) {
      if (trackedTotals.indexOf(i) > -1) totalItems += meta.dataValues[i];
    }

    // Set Locals
    res.locals.totalApiCalls = formatNumber(meta.totalApiCalls);
    res.locals.totalDBWrites = formatNumber(meta.totalDBWrites);
    res.locals.totalImageDownloads = formatNumber(meta.totalImageDownloads);
    res.locals.totalItems = formatNumber(totalItems);
    res.locals.totalMovies = formatNumber(meta.totalMovies);
    res.locals.ratedMovies = formatNumber(meta.ratedMovies);
    res.locals.totalShows = formatNumber(meta.totalShows);
    res.locals.ratedShows = formatNumber(meta.ratedShows);
    res.locals.totalSteamGames = formatNumber(meta.totalSteamGames);
    res.locals.totalRecentSteamGames = formatNumber(meta.totalRecentSteamGames);
    res.locals.totalSpotifySongs = formatNumber(meta.totalSpotifySongs);
    res.locals.totalSpotifyArtists = formatNumber(meta.totalSpotifyArtists);
    res.locals.totalSpotifyShows = formatNumber(meta.totalSpotifyShows);

    next();
  } catch (error) {
    console.error('Error in metaMiddleware');
    error.status = 500;
    next(error);
  }
}