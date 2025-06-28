import sequelize from '../../config/database.js';
import ClassFee from '../../models/ClassFee.js';

/**
 * Initialize database with required default data
 */
export const initializeDatabase = async () => {
  try {
    console.log('Starting database initialization...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Create tables if they don't exist - This is already handled by index.js
    // await sequelize.sync({ alter: true }); 
    // console.log('Database synchronized successfully.');

    // Create default class fee structures if they don't exist
    await initializeClassFeeStructures();
    
    console.log('Database initialization completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Database initialization failed:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Initialize class fee structures for all classes (1-6)
 */
const initializeClassFeeStructures = async () => {
  try {
    console.log('Checking class fee structures...');
    
    // Define default fee amounts for each class
    const classDefaults = [
      { className: '1', admissionFee: 5000, monthlyFee: 2000, computerFee: 1000 },
      { className: '2', admissionFee: 5000, monthlyFee: 2200, computerFee: 1000 },
      { className: '3', admissionFee: 5000, monthlyFee: 2400, computerFee: 1200 },
      { className: '4', admissionFee: 6000, monthlyFee: 2600, computerFee: 1200 },
      { className: '5', admissionFee: 6000, monthlyFee: 2800, computerFee: 1500 },
      { className: '6', admissionFee: 6000, monthlyFee: 3000, computerFee: 1500 }
    ];
    
    let created = 0;
    let updated = 0;
    
    // Create or update fee structures for each class
    for (const classFee of classDefaults) {
      const [feeStructure, created] = await ClassFee.findOrCreate({
        where: { className: classFee.className },
        defaults: {
          admissionFee: classFee.admissionFee,
          monthlyFee: classFee.monthlyFee,
          computerFee: classFee.computerFee
        }
      });
      
      if (created) {
        console.log(`Created fee structure for Class ${classFee.className}`);
        created++;
      } else {
        console.log(`Fee structure for Class ${classFee.className} already exists`);
        updated++;
      }
    }
    
    console.log(`Fee structure initialization complete: ${created} created, ${updated} existing`);
    return true;
  } catch (error) {
    console.error('Error initializing class fee structures:', error);
    throw error;
  }
};

export default initializeDatabase; 