import { DataTypes } from 'sequelize';
import sequelize from './db.js';

const SpotifyAlbum = sequelize.define('SpotifyAlbum', {
  id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  artists: {
    type: DataTypes.JSON,
    allowNull: true
  },
  total_tracks: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  release_date: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, { timestamps: true });

export default SpotifyAlbum;