import 'dotenv/config';
import express from 'express';
import session from 'express-session';

import './wss.js';
import routes from './routes.js';
import initAppData from './middlewares/initAppMiddleware.js';
import { alertMiddleware } from './middlewares/alertMiddleware.js';

const app = express();

// Set up sessions
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

// Middlewares
app.use(express.static('./public'));

// Middleware dubugging
if (process.env.DEBUG === 'true') {
  app.use((req, res, next) => {
    console.log(`Path: ${req.path}, Method: ${req.method}`);
    console.log(`Request path: ${req.path}`);
    next();
  });
}

// Custom Middlewares
initAppData(app);
app.use(alertMiddleware);

// Views
app.set('view engine', 'ejs');

// Routes
app.use('/', routes);

// 404s
app.use((req, res, next) => {
  const error = {
    status: 404,
    message: "Page Not Found"
  };

  next(error);
});

// Error Handling
app.use((error, req, res, next) => {
  console.error(`Error in server.js error catcher: ${error.message}`);
  res.status(error.status || 500);

  if (error.status === 404) {
    res.status(404).render('pages/404', { error });
  } else {
    res.status(error.status || 500).render('pages/error', { error })
  }
});

// Server Start
const PORT = process.env.PORT;
const server = app.listen(PORT, () => console.log(`${process.env.NAME} Server running on port ${PORT}`));

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. You can change the server's port by editing the .env file. Exiting...`)
  } else {
    console.error('Server error:', err.message);
  }

  process.exit(1);
});