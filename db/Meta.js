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
  tmdbMovieGenres: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  tmdbTvGenres: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  recentSearches: {
    type: DataTypes.JSON,
    defaultValue: [],
    allowNull: true
  }
}, { timestamps: true });

export default Meta;