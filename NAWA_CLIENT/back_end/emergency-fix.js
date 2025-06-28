// Emergency database connection and table check script
import sequelize from './config/database.js';
import { configDotenv } from 'dotenv';

configDotenv();

console.log('🚨 EMERGENCY DATABASE DIAGNOSTIC');
console.log('================================');

async function emergencyDiagnostic() {
  try {
    // 1. Test basic connection
    console.log('1️⃣ Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // 2. List all tables
    console.log('\n2️⃣ Checking available tables...');
    const [tables] = await sequelize.query('SHOW TABLES');
    console.log(`Found ${tables.length} tables:`);
    tables.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });

    // 3. Check Notices table specifically
    console.log('\n3️⃣ Checking Notices table structure...');
    try {
      const [columns] = await sequelize.query('DESCRIBE Notices');
      console.log('✅ Notices table exists with columns:');
      columns.forEach(col => {
        console.log(`   - ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'nullable' : 'required'})`);
      });
    } catch (error) {
      console.error('❌ Notices table error:', error.message);
    }
    
    // 4. Check admins table
    console.log('\n4️⃣ Checking admins table...');
    try {
      const [adminCols] = await sequelize.query('DESCRIBE Admins');
      console.log('✅ Admins table exists with columns:');
      adminCols.forEach(col => {
        console.log(`   - ${col.Field}: ${col.Type}`);
      });
    } catch (error) {
      console.error('❌ Admins table error:', error.message);
    }
    
    // 5. Test simple notice query
    console.log('\n5️⃣ Testing notice data retrieval...');
    try {
      const [notices] = await sequelize.query('SELECT id, title, adminId FROM Notices LIMIT 5');
      console.log(`✅ Found ${notices.length} notices:`);
      notices.forEach(notice => {
        console.log(`   - ID: ${notice.id}, Title: "${notice.title}", Admin: ${notice.adminId}`);
      });
    } catch (error) {
      console.error('❌ Notice query error:', error.message);
    }
    
    // 6. Test admin data
    console.log('\n6️⃣ Testing admin data...');
    try {
      const [admins] = await sequelize.query('SELECT id, name, email FROM Admins LIMIT 3');
      console.log(`✅ Found ${admins.length} admins:`);
      admins.forEach(admin => {
        console.log(`   - ID: ${admin.id}, Name: "${admin.name}", Email: ${admin.email}`);
      });
    } catch (error) {
      console.error('❌ Admin query error:', error.message);
    }
    
    console.log('\n🎯 DIAGNOSTIC COMPLETE');
    
  } catch (error) {
    console.error('\n❌ CRITICAL ERROR:', error.message);
    console.error('Error details:', {
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
  } finally {
    process.exit();
  }
}

emergencyDiagnostic();