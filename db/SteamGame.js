import { DataTypes } from 'sequelize';
import sequelize from './db.js';

const SteamGame = sequelize.define('SteamGame', {
  appId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
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
    allowNull: true
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
    allowNull: true
  },
  categories: {
    type: DataTypes.JSON,
    allowNull: true
  },
  genres: {
    type: DataTypes.JSON,
    allowNull: true
  },
  released: {
    type: DataTypes.STRING,
    allowNull: true
  },
}, { timestamps: true });

export default SteamGame;