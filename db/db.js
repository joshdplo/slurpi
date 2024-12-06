import 'dotenv/config';
import { Sequelize } from 'sequelize';
import { join } from '../be-util.js';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: join(process.env.DB_URL),
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