import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Teacher from './Teacher.js';

const TeacherPayroll = sequelize.define('TeacherPayroll', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  teacherId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Teacher,
      key: 'id'
    }
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  // Make sure this is DataTypes.JSON for MySQL 8+
  records: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {
      Baishakh: { salary: 0, allowance: 0, remarks: '', status: 'pending', date: new Date() },
      Jestha: { salary: 0, allowance: 0, remarks: '', status: 'pending', date: new Date() },
      Asadhh: { salary: 0, allowance: 0, remarks: '', status: 'pending', date: new Date() },
      Shrawan: { salary: 0, allowance: 0, remarks: '', status: 'pending', date: new Date() },
      Bhadra: { salary: 0, allowance: 0, remarks: '', status: 'pending', date: new Date() },
      Ashwin: { salary: 0, allowance: 0, remarks: '', status: 'pending', date: new Date() },
      Kartik: { salary: 0, allowance: 0, remarks: '', status: 'pending', date: new Date() },
      Mangsir: { salary: 0, allowance: 0, remarks: '', status: 'pending', date: new Date() },
      Poush: { salary: 0, allowance: 0, remarks: '', status: 'pending', date: new Date() },
      Magh: { salary: 0, allowance: 0, remarks: '', status: 'pending', date: new Date() },
      Falgun: { salary: 0, allowance: 0, remarks: '', status: 'pending', date: new Date() },
      Chaitra: { salary: 0, allowance: 0, remarks: '', status: 'pending', date: new Date() }
    }
  }
}, {
  timestamps: true
});

// Associations moved here to avoid circular dependency
TeacherPayroll.belongsTo(Teacher, { foreignKey: 'teacherId' });
Teacher.hasMany(TeacherPayroll, { foreignKey: 'teacherId' });

export default TeacherPayroll; 