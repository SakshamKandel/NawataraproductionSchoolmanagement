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
    references: {
      model: 'Admins',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  forTeachers: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  forStudents: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  publishDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'For multi-day events, this represents the end date'
  },
  eventType: {
    type: DataTypes.ENUM('notice', 'event', 'holiday', 'exam', 'meeting'),
    defaultValue: 'notice',
    comment: 'Type of calendar item for visual distinction'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  tableName: 'Notices'
});

export default Notice;