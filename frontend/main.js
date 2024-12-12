// Base Styles
import './css/_css.js';

// JS & Components
import './global/alerts.js';
import './global/loader.js';
import './global/ws.js';
import Sidebar from './components/Sidebar/Sidebar.js';
import Fetcher from './components/Fetcher/Fetcher.js';
import TMDBCards from './components/TMDBCards/TMDBCards.js';

// DOM Load
document.addEventListener('DOMContentLoaded', function DOMLoaded() {
  console.log('🥤> Main JS initialized');

  // global components
  Sidebar();

  // fetchers
  const fetchers = document.querySelectorAll('.fetcher');
  [...fetchers].map(el => Fetcher(el));

  // tmdb cards
  const tmdbMoviesContainer = document.querySelector('.tmdb-movies');
  const tmdbShowsContainer = document.querySelector('.tmdb-shows');
  TMDBCards(tmdbMoviesContainer, 'tmdb', 'movies');
  TMDBCards(tmdbShowsContainer, 'tmdb', 'tv');
});