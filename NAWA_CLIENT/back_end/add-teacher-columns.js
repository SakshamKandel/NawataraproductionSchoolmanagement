import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';

// Function to prompt the user for database credentials
async function getDatabaseCredentials() {
  console.log("Please enter your MySQL database credentials:");
  
  // In an interactive Node.js environment, we would prompt for these
  // For this script, we'll try common configurations
  
  // List of potential configurations to try
  const configurations = [
    { host: 'localhost', user: 'root', password: '', database: 'nawa_db' },
    { host: 'localhost', user: 'root', password: 'root', database: 'nawa_db' },
    { host: 'localhost', user: 'root', password: 'password', database: 'nawa_db' },
    { host: '127.0.0.1', user: 'root', password: '', database: 'nawa_db' },
    { host: 'localhost', user: 'admin', password: 'admin', database: 'nawa_db' },
  ];
  
  // Try to read credentials from .env file if it exists
  try {
    const envPath = path.join(process.cwd(), '.env');
    const envFileExists = await fs.access(envPath).then(() => true).catch(() => false);
    
    if (envFileExists) {
      console.log("Found .env file, trying to read database credentials...");
      const envContents = await fs.readFile(envPath, 'utf8');
      
      // Simple parsing of .env file
      const envLines = envContents.split('\n');
      const envVars = {};
      
      for (const line of envLines) {
        if (line.trim() && !line.startsWith('#')) {
          const [key, value] = line.split('=');
          if (key && value) envVars[key.trim()] = value.trim();
        }
      }
      
      if (envVars.MYSQL_HOST && envVars.MYSQL_USER && envVars.MYSQL_DATABASE) {
        configurations.unshift({
          host: envVars.MYSQL_HOST,
          user: envVars.MYSQL_USER,
          password: envVars.MYSQL_PASSWORD || '',
          database: envVars.MYSQL_DATABASE
        });
        
        console.log("Added credentials from .env file to try first");
      }
    }
  } catch (error) {
    console.log("Error reading .env file:", error.message);
  }
  
  return configurations;
}

async function testConnection(config) {
  let connection;
  try {
    console.log(`Trying to connect with user: ${config.user}, host: ${config.host}, database: ${config.database}`);
    connection = await mysql.createConnection(config);
    console.log('Connection successful!');
    return { success: true, connection };
  } catch (error) {
    console.log(`Connection failed: ${error.message}`);
    return { success: false, error };
  }
}

async function addMissingColumns() {
  const configurations = await getDatabaseCredentials();
  let connection;
  let successful = false;
  
  for (const config of configurations) {
    const result = await testConnection(config);
    if (result.success) {
      connection = result.connection;
      successful = true;
      console.log(`Successfully connected with user: ${config.user}`);
      break;
    }
  }
  
  if (!successful) {
    console.error('Failed to connect to the database with any of the provided credentials.');
    console.error('Please update your database credentials and try again.');
    return;
  }
  
  try {
    // Check if payments column exists
    console.log('Checking for payments column...');
    const [paymentsColumns] = await connection.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
      AND TABLE_NAME = 'Teachers'
      AND COLUMN_NAME = 'payments'
    `, [connection.config.database]);
    
    // Add payments column if it doesn't exist
    if (paymentsColumns.length === 0) {
      console.log('Adding payments column...');
      await connection.query(`
        ALTER TABLE Teachers
        ADD COLUMN payments JSON DEFAULT NULL
      `);
      console.log('Payments column added successfully');
    } else {
      console.log('Payments column already exists');
    }
    
    // Check if lastPayment column exists
    console.log('Checking for lastPayment column...');
    const [lastPaymentColumns] = await connection.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
      AND TABLE_NAME = 'Teachers'
      AND COLUMN_NAME = 'lastPayment'
    `, [connection.config.database]);
    
    // Add lastPayment column if it doesn't exist
    if (lastPaymentColumns.length === 0) {
      console.log('Adding lastPayment column...');
      await connection.query(`
        ALTER TABLE Teachers
        ADD COLUMN lastPayment JSON DEFAULT NULL
      `);
      console.log('LastPayment column added successfully');
    } else {
      console.log('LastPayment column already exists');
    }
    
    // Check if position column exists
    console.log('Checking for position column...');
    const [positionColumns] = await connection.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
      AND TABLE_NAME = 'Teachers'
      AND COLUMN_NAME = 'position'
    `, [connection.config.database]);
    
    // Add position column if it doesn't exist
    if (positionColumns.length === 0) {
      console.log('Adding position column...');
      await connection.query(`
        ALTER TABLE Teachers
        ADD COLUMN position VARCHAR(255) DEFAULT 'Teacher'
      `);
      console.log('Position column added successfully');
    } else {
      console.log('Position column already exists');
    }
    
    // Check if contact column exists
    console.log('Checking for contact column...');
    const [contactColumns] = await connection.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
      AND TABLE_NAME = 'Teachers'
      AND COLUMN_NAME = 'contact'
    `, [connection.config.database]);
    
    // Add contact column if it doesn't exist
    if (contactColumns.length === 0) {
      console.log('Adding contact column...');
      await connection.query(`
        ALTER TABLE Teachers
        ADD COLUMN contact VARCHAR(255) DEFAULT NULL
      `);
      console.log('Contact column added successfully');
    } else {
      console.log('Contact column already exists');
    }
    
    console.log('Database update completed successfully');
  } catch (error) {
    console.error('Error updating database:', error);
  } finally {
    if (connection) {
      console.log('Closing database connection');
      await connection.end();
    }
  }
}

// Execute the function
addMissingColumns()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  }); 