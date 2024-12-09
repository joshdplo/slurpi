import { DataTypes } from 'sequelize';
import sequelize from './db.js';

const SpotifyArtist = sequelize.define('SpotifyArtist', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  url: {
    type: DataTypes.JSON,
    allowNull: true
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  },
}, { timestamps: true });

export default SpotifyArtist;