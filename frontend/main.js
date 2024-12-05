// Base Styles
import './css/reset.css';
import './css/base.css';
import './css/layout.css';
import './css/loader.css';

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