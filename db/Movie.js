import { DataTypes } from 'sequelize';
import sequelize from './db.js';

const Movie = sequelize.define('Movie', {
  adult: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  genre_ids: {
    type: DataTypes.JSON,
    allowNull: false
  },
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  original_language: {
    type: DataTypes.STRING,
    allowNull: false
  },
  overview: {
    type: DataTypes.STRING,
    allowNull: false
  },
  poster_path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  release_date: {
    type: DataTypes.STRING,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, { timestamps: true });

export default Movie;