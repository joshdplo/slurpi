import 'dotenv/config';
import { DataTypes } from 'sequelize';
import sequelize from './db.js';

const Meta = sequelize.define('Meta', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: process.env.NAME
  },
  totalApiCalls: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalDBWrites: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalImageDownloads: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalMovies: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  ratedMovies: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalShows: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  ratedShows: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalSteamGames: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalRecentSteamGames: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalSpotifySongs: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalSpotifyArtists: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalSpotifyShows: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
}, { timestamps: true });

export default Meta;