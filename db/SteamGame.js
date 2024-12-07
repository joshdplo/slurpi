import { DataTypes } from 'sequelize';
import sequelize from './db.js';

const SteamGame = sequelize.define('SteamGame', {
  appid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  recent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  playtime_forever: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  is_free: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  short_description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true
  },
  header_image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  capsule_image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  developers: {
    type: DataTypes.JSON,
    allowNull: true
  },
  publishers: {
    type: DataTypes.JSON,
    allowNull: true
  },
  platforms: {
    type: DataTypes.JSON,
    allowNull: true
  },
  categories: {
    type: DataTypes.JSON,
    allowNull: true
  },
  genres: {
    type: DataTypes.JSON,
    allowNull: true
  },
  release_date: {
    type: DataTypes.JSON,
    allowNull: true
  },
}, { timestamps: true });

export default SteamGame;