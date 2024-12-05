import { DataTypes } from 'sequelize';
import sequelize from './db.js';

const Game = sequelize.define('Game', {
  appId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  recentlyPlayed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isFree: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true
  },
  headerImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  developers: {
    type: DataTypes.JSON,
    allowNull: true
  },
  publishers: {
    type: DataTypes.JSON,
    allowNull: true
  },
  platforms: {
    type: DataTypes.JSON,
    allowNull: false
  },
  categories: {
    type: DataTypes.JSON,
    allowNull: false
  },
  genres: {
    type: DataTypes.JSON,
    allowNull: true
  },
  released: {
    type: DataTypes.STRING,
    allowNull: false
  },
}, { timestamps: true });

export default Game;