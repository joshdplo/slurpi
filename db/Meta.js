import 'dotenv/config';
import { DataTypes } from 'sequelize';
import sequelize from './db.js';

const Meta = sequelize.define('Meta', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: process.env.NAME
  },

}, { timestamps: true });

export default Meta;