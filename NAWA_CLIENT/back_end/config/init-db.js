import sequelize from './database.js';
import Admin from '../models/Admin.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import Notice from '../models/Notice.js';
import TeacherNotice from '../models/TeacherNotice.js';
import TeacherPayroll from '../models/TeacherPayroll.js';
import Routine from '../models/Routine.js';
import StudentFee from '../models/StudentFee.js';
import LeaveRequest from '../models/LeaveRequest.js';
import ClassFee from '../models/ClassFee.js';

// Define associations
// Teacher associations
Teacher.hasMany(TeacherNotice, { foreignKey: 'teacherId' });
TeacherNotice.belongsTo(Teacher, { foreignKey: 'teacherId' });

Teacher.hasMany(TeacherPayroll, { foreignKey: 'teacherId' });
TeacherPayroll.belongsTo(Teacher, { foreignKey: 'teacherId' });

Teacher.hasMany(Routine, { foreignKey: 'teacherId' });
Routine.belongsTo(Teacher, { foreignKey: 'teacherId' });

Teacher.hasMany(LeaveRequest, { foreignKey: 'teacherId' });
LeaveRequest.belongsTo(Teacher, { foreignKey: 'teacherId' });

// Admin and Notice association
Admin.hasMany(Notice, { foreignKey: 'adminId' });
Notice.belongsTo(Admin, { foreignKey: 'adminId' });

// Student associations - StudentFee uses studentID directly, not as foreign key
// No need to define hasMany/belongsTo here

async function initializeDatabase() {
  try {
    // Use normal sync without altering tables to prevent data loss
    await sequelize.sync({ alter: false });
    console.log('Database synchronized successfully');
    
    // Only check for missing columns without altering existing data
    try {
      // Check if publishDate column exists
      const [publishDateColumns] = await sequelize.query("SHOW COLUMNS FROM Notices LIKE 'publishDate'");
      if (publishDateColumns.length === 0) {
        console.log('Adding publishDate column to Notices table');
        await sequelize.query("ALTER TABLE Notices ADD COLUMN IF NOT EXISTS publishDate DATETIME DEFAULT CURRENT_TIMESTAMP");
      }
      
      // Check if expiryDate column exists
      const [expiryDateColumns] = await sequelize.query("SHOW COLUMNS FROM Notices LIKE 'expiryDate'");
      if (expiryDateColumns.length === 0) {
        console.log('Adding expiryDate column to Notices table');
        await sequelize.query("ALTER TABLE Notices ADD COLUMN IF NOT EXISTS expiryDate DATETIME DEFAULT NULL");
      }
      
      console.log('Notice table columns checked successfully');
    } catch (err) {
      console.error('Error checking Notice table columns:', err.message);
    }
    
    // Fee structure migration
    try {
      // Check ClassFees table structure and migrate if needed
      const [classFeeColumns] = await sequelize.query("SHOW COLUMNS FROM ClassFees");
      const columnNames = classFeeColumns.map(col => col.Field);
      console.log('ClassFees current columns:', columnNames);
      
      // Add new columns if they don't exist
      if (!columnNames.includes('transportationFee')) {
        console.log('Adding transportationFee column to ClassFees table');
        await sequelize.query("ALTER TABLE ClassFees ADD COLUMN transportationFee FLOAT NOT NULL DEFAULT 0");
      }
      
      if (!columnNames.includes('examFee')) {
        console.log('Adding examFee column to ClassFees table');
        await sequelize.query("ALTER TABLE ClassFees ADD COLUMN examFee FLOAT NOT NULL DEFAULT 0");
      }
      
      // Handle computerFee migration
      if (columnNames.includes('computerFee')) {
        console.log('Migrating computerFee data to transportationFee...');
        // Copy data from computerFee to transportationFee if transportationFee is 0
        await sequelize.query(
          "UPDATE ClassFees SET transportationFee = computerFee WHERE computerFee IS NOT NULL AND transportationFee = 0"
        );
        
        console.log('Removing computerFee column...');
        await sequelize.query("ALTER TABLE ClassFees DROP COLUMN computerFee");
      }
      
      // Remove admissionFee if it exists
      if (columnNames.includes('admissionFee')) {
        console.log('Removing admissionFee column...');
        await sequelize.query("ALTER TABLE ClassFees DROP COLUMN admissionFee");
      }
      
      console.log('ClassFees table migration completed successfully');
    } catch (err) {
      console.error('Error migrating ClassFees table:', err.message);
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

export default initializeDatabase; 