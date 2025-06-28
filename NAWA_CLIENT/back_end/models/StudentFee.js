import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const StudentFee = sequelize.define('StudentFee', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  studentID: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    field: 'studentID' // Ensure this matches the database column name exactly
  },
  records: { type: DataTypes.JSON, allowNull: false }
}, { 
  timestamps: true,
  tableName: 'StudentFees'
});

export default StudentFee; 