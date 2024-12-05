import { DataTypes } from 'sequelize';
import sequelize from './db.js';

const SpotifySong = sequelize.define('SpotifySong', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, { timestamps: true });

export default SpotifySong;