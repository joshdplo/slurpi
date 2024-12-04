// Base Styles
import './css/reset.css';
import './css/base.css';
import './css/layout.css';

// JS & Components
import { event } from './fe-util.js';
import './ws.js';
import Loader from './components/Loader/Loader.js';
import Sidebar from './components/Header/Sidebar.js';

// DOM Load
document.addEventListener('DOMContentLoaded', function DOMLoaded() {
  console.log('🥤> DOM Loaded');
  Loader();
  Sidebar();

  // test custom loader event
  setTimeout(() => {
    event('loader', { hello: 'loaderman' });
  }, 3000);
});