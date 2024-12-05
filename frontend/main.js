// Base Styles
import './css/_css.js';

// JS & Components
import './global/alerts.js';
import './global/loader.js';
import './global/ws.js';
import Sidebar from './components/Sidebar/Sidebar.js';

// DOM Load
document.addEventListener('DOMContentLoaded', function DOMLoaded() {
  console.log('🥤> Main JS initialized');
  Sidebar();
});