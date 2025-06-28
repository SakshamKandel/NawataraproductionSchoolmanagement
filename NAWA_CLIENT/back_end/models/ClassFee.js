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
  admissionFee: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  monthlyFee: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  computerFee: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  }
}, {
  timestamps: true
});

export default ClassFee; 