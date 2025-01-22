import Meta from "../db/Meta.js";
import { getDBSize, formatNumber } from "../be-util.js";

export default async function metaMiddleware(req, res, next) {
  try {
    // Get Meta from DB
    let meta = await Meta.findByPk(1);

    // Missing meta?
    if (!meta) {
      console.log('Meta not found in the DB - Creating it...');
      meta = await Meta.create(); // everything in meta schema has default values
    }

    // Get DB Size
    const dbSize = await getDBSize();

    // Set Locals
    res.locals.dbSize = dbSize;
    res.locals.totalApiCalls = formatNumber(meta.totalApiCalls);
    res.locals.totalDBWrites = formatNumber(meta.totalDBWrites);
    res.locals.totalImageDownloads = formatNumber(meta.totalImageDownloads);

    next();
  } catch (error) {
    console.error('Error in metaMiddleware');
    error.status = 500;
    next(error);
  }
}