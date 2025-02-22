import { DataTypes } from 'sequelize';
import sequelize from './db.js';

const SpotifyArtist = sequelize.define('SpotifyArtist', {
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
  genres: {
    type: DataTypes.JSON,
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
  super: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  mega: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, { timestamps: true });

export default SpotifyArtist;