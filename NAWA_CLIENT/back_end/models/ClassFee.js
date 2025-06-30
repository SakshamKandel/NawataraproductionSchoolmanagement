import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ClassFee = sequelize.define('ClassFee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  className: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  monthlyFee: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  transportationFee: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  examFee: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  }
}, {
  timestamps: true,
  tableName: 'ClassFees'
});

export default ClassFee; 