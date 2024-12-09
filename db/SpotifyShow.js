import { DataTypes } from 'sequelize';
import sequelize from './db.js';

const SpotifyShow = sequelize.define('SpotifyShow', {
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
  artists: {
    type: DataTypes.JSON,
    allowNull: true
  },
  url: {
    type: DataTypes.JSON,
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

export default SpotifyShow;