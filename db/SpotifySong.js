import { DataTypes } from 'sequelize';
import sequelize from './db.js';

const SpotifySong = sequelize.define('SpotifySong', {
  id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
    unique: true
  },
  isTopTrack: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  artists: {
    type: DataTypes.JSON,
    allowNull: true
  },
  duration_ms: {
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

export default SpotifySong;