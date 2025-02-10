import 'dotenv/config';
import { DataTypes } from 'sequelize';
import sequelize from './db.js';

const Meta = sequelize.define('Meta', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: process.env.NAME
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
  },
  buildHistory: {
    type: DataTypes.JSON,
    defaultValue: [],
    allowNull: true
  },
  lastMessageDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  spamHistory: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, { timestamps: true });

export default Meta;