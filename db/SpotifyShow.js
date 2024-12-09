import { DataTypes } from 'sequelize';
import sequelize from './db.js';

const SpotifyShow = sequelize.define('SpotifyShow', {
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
  description: {
    type: DataTypes.STRING,
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
  total_episodes: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, { timestamps: true });

export default SpotifyShow;