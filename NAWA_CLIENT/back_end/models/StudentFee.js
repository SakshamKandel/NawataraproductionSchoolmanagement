import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const StudentFee = sequelize.define('StudentFee', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  studentID: { type: DataTypes.INTEGER, allowNull: false },
  records: { type: DataTypes.JSON, allowNull: false }
}, { timestamps: true });

export default StudentFee; 