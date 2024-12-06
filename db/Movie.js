import { DataTypes } from 'sequelize';
import sequelize from './db.js';

const Movie = sequelize.define('Movie', {
  adult: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  genre_ids: {
    type: DataTypes.JSON,
    allowNull: true
  },
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    unique: true
  },
  original_language: {
    type: DataTypes.STRING,
    allowNull: true
  },
  overview: {
    type: DataTypes.STRING,
    allowNull: true
  },
  poster_path: {
    type: DataTypes.STRING,
    allowNull: true
  },
  release_date: {
    type: DataTypes.STRING,
    allowNull: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
  }
}, { timestamps: true });

export default Movie;