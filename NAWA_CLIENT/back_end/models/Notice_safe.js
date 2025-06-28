import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Notice = sequelize.define('Notice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  adminId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'adminId'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: 'Untitled Notice'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ''
  },
  forTeachers: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'forTeachers'
  },
  forStudents: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'forStudents'
  },
  publishDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'publishDate'
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'expiryDate'
  }
}, {
  tableName: 'notices',
  timestamps: true,
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

export default Notice;