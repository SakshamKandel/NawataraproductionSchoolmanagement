import sequelize from '../config/database.js';
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

async function resetDatabase() {
  try {
    console.log('Starting database reset...');

    // Disable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // Drop all tables
    await sequelize.query('DROP TABLE IF EXISTS Admins');
    await sequelize.query('DROP TABLE IF EXISTS Teachers');
    await sequelize.query('DROP TABLE IF EXISTS Students');
    await sequelize.query('DROP TABLE IF EXISTS Notices');
    await sequelize.query('DROP TABLE IF EXISTS TeacherNotices');
    await sequelize.query('DROP TABLE IF EXISTS TeacherPayrolls');
    await sequelize.query('DROP TABLE IF EXISTS Routines');
    await sequelize.query('DROP TABLE IF EXISTS StudentFees');
    await sequelize.query('DROP TABLE IF EXISTS LeaveRequests');
    await sequelize.query('DROP TABLE IF EXISTS ClassFees');
    await sequelize.query('DROP TABLE IF EXISTS TeacherInvoices');

    // Re-enable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    // Create all tables
    await sequelize.sync({ force: false });
    console.log('All tables have been recreated');

    // Initialize class fee structures
    const classDefaults = [
      { className: '1', admissionFee: 5000, monthlyFee: 2000, computerFee: 1000 },
      { className: '2', admissionFee: 5000, monthlyFee: 2200, computerFee: 1000 },
      { className: '3', admissionFee: 5000, monthlyFee: 2400, computerFee: 1200 },
      { className: '4', admissionFee: 6000, monthlyFee: 2600, computerFee: 1200 },
      { className: '5', admissionFee: 6000, monthlyFee: 2800, computerFee: 1500 },
      { className: '6', admissionFee: 6000, monthlyFee: 3000, computerFee: 1500 }
    ];

    for (const classFee of classDefaults) {
      await ClassFee.create(classFee);
      console.log(`Created fee structure for Class ${classFee.className}`);
    }

    console.log('Database reset completed successfully');
  } catch (error) {
    console.error('Error resetting database:', error);
    // Re-enable foreign key checks in case of error
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the reset function
resetDatabase(); 