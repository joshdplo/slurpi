// Base Styles
import './css/_css.js';

// JS & Components
import './global/alerts.js';
import './global/loader.js';
import './global/ws.js';
import Sidebar from './components/Sidebar/Sidebar.js';
import Fetcher from './components/Fetcher/Fetcher.js';
import CardsList from './components/CardsList/CardsList.js';

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
  CardsList(tmdbMoviesContainer, 'tmdb', 'movies');
  CardsList(tmdbShowsContainer, 'tmdb', 'tv');

  // steam cards
  const steamContainer = document.querySelector('.steam-games');
  CardsList(steamContainer, 'steam', 'games');
});