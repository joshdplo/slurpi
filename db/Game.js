import { DataTypes } from 'sequelize';
import sequelize from './db.js';

const Game = sequelize.define('Game', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isRecent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, { timestamps: true });

export default Game;