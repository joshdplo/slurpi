import 'dotenv/config';
import { Sequelize } from 'sequelize';
import { resolve } from '../be-util.js';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: resolve('./db/db.sqlite'),
  // logging: false
});

// Confirm connection
sequelize.authenticate()
  .catch((error) => {
    console.error(error);
    console.error('Unable to connect to sqlite database via sequelize. We need that. Exiting now.');
    process.exit(1);
  });

export default sequelize;
