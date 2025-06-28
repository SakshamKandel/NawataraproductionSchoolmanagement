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
    allowNull: true, // Changed to match DB (nullable)
    field: 'adminId'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
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
  endDate: { // Changed from expiryDate to match your DB
    type: DataTypes.DATE,
    allowNull: true,
    field: 'endDate'
  },
  eventType: {
    type: DataTypes.ENUM('notice', 'event', 'holiday', 'exam', 'meeting'),
    allowNull: true,
    field: 'eventType'
  }
}, {
  tableName: 'Notices', // Capital N to match your DB
  timestamps: true,
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

export default Notice;