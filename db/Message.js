import 'dotenv/config';
import { DataTypes } from 'sequelize';
import sequelize from './db.js';

const Message = sequelize.define('Message', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  text: {
    type: DataTypes.JSON,
    allowNull: false
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
}, { timestamps: true });

export default Message;