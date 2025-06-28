import sequelize from './config/database.js';
import { configDotenv } from 'dotenv';

// Load environment variables
configDotenv();

console.log('🔧 Testing Database Connection...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Database Host:', process.env.MYSQL_HOST);
console.log('Database Name:', process.env.MYSQL_DATABASE);
console.log('Database User:', process.env.MYSQL_USER);
console.log('Password Set:', !!process.env.MYSQL_PASSWORD);

async function testConnection() {
  try {
    console.log('📡 Attempting to connect to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    
    // Test a simple query
    const [results] = await sequelize.query('SELECT 1 as test');
    console.log('✅ Test query successful:', results);
    
    // List available tables
    const [tables] = await sequelize.query('SHOW TABLES');
    console.log('📋 Available tables:', tables.length);
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${Object.values(table)[0]}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Unable to connect to the database:');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    console.error('SQL State:', error.sqlState);
    console.error('Full Error:', error);
    process.exit(1);
  }
}

testConnection();