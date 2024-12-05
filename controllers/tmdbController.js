import Movie from '../db/Movie.js';
import Show from '../db/Show.js';

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