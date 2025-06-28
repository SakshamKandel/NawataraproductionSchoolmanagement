import sequelize from './config/database.js';
import { DataTypes } from 'sequelize';
import { configDotenv } from 'dotenv';

// Load environment variables
configDotenv();

console.log("Starting teacher payments migration script...");
console.log("Environment:", process.env.NODE_ENV);

const addPaymentColumnsToTeachers = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Using raw SQL query to check if column exists
    console.log('Checking if payments column exists...');
    const [paymentsColumnCheck] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'Teachers' 
      AND COLUMN_NAME = 'payments'
    `);
    
    console.log('Payments column check result:', paymentsColumnCheck);
    const paymentsColumnExists = paymentsColumnCheck[0].count > 0;
    console.log('Payments column exists:', paymentsColumnExists);
    
    console.log('Checking if lastPayment column exists...');
    const [lastPaymentColumnCheck] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'Teachers' 
      AND COLUMN_NAME = 'lastPayment'
    `);
    
    console.log('LastPayment column check result:', lastPaymentColumnCheck);
    const lastPaymentColumnExists = lastPaymentColumnCheck[0].count > 0;
    console.log('LastPayment column exists:', lastPaymentColumnExists);
    
    // Add payments column if it doesn't exist
    if (!paymentsColumnExists) {
      console.log('Adding payments column to Teachers table...');
      await sequelize.query(`
        ALTER TABLE Teachers
        ADD COLUMN payments JSON DEFAULT NULL
      `);
      console.log('Successfully added payments column to Teachers table');
    } else {
      console.log('Payments column already exists in Teachers table');
    }
    
    // Add lastPayment column if it doesn't exist
    if (!lastPaymentColumnExists) {
      console.log('Adding lastPayment column to Teachers table...');
      await sequelize.query(`
        ALTER TABLE Teachers
        ADD COLUMN lastPayment JSON DEFAULT NULL
      `);
      console.log('Successfully added lastPayment column to Teachers table');
    } else {
      console.log('LastPayment column already exists in Teachers table');
    }
    
    console.log('Teacher table migration completed successfully');
  } catch (error) {
    console.error('Error migrating Teacher table:', error);
    console.error(error.stack);
  } finally {
    // Close the database connection
    console.log('Closing database connection...');
    await sequelize.close();
    console.log('Database connection closed');
  }
};

// Run the migration
console.log('Running migration function...');
addPaymentColumnsToTeachers()
  .then(() => {
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('Unhandled error in migration script:', err);
    process.exit(1);
  }); 