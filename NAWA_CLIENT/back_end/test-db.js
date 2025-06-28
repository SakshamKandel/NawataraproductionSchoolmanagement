/**
 * Simple database connection test script
 * Run this to check if your database is properly configured
 */
import { configDotenv } from 'dotenv';
import sequelize from './config/database.js';
import Admin from './models/Admin.js';
import Teacher from './models/Teacher.js';
import Student from './models/Student.js';
import Notice from './models/Notice.js';

// Load environment variables
configDotenv();

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('Database Config:', {
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT,
      database: process.env.MYSQL_DATABASE,
      user: process.env.MYSQL_USER,
      // Don't log password for security
    });

    // Test basic connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');

    // Test if tables exist
    console.log('\n🔍 Checking if tables exist...');
    
    try {
      const adminCount = await Admin.count();
      console.log(`✅ Admins table exists - ${adminCount} records`);
    } catch (error) {
      console.log('❌ Admins table issue:', error.message);
    }

    try {
      const teacherCount = await Teacher.count();
      console.log(`✅ Teachers table exists - ${teacherCount} records`);
    } catch (error) {
      console.log('❌ Teachers table issue:', error.message);
    }

    try {
      const studentCount = await Student.count();
      console.log(`✅ Students table exists - ${studentCount} records`);
    } catch (error) {
      console.log('❌ Students table issue:', error.message);
    }

    try {
      const noticeCount = await Notice.count();
      console.log(`✅ Notices table exists - ${noticeCount} records`);
    } catch (error) {
      console.log('❌ Notices table issue:', error.message);
    }

    // Test creating a simple notice (if admin exists)
    console.log('\n🔍 Testing notice creation...');
    const adminExists = await Admin.findOne();
    if (adminExists) {
      try {
        const testNotice = await Notice.create({
          adminId: adminExists.id,
          title: 'Database Test Notice',
          content: 'This is a test notice to verify database functionality.',
          forTeachers: true,
          forStudents: true,
          noticecategory: 'test',
          publishDate: new Date()
        });
        console.log('✅ Notice creation successful - ID:', testNotice.id);
        
        // Clean up - delete the test notice
        await testNotice.destroy();
        console.log('✅ Test notice cleaned up');
      } catch (error) {
        console.log('❌ Notice creation failed:', error.message);
      }
    } else {
      console.log('⚠️ No admin found - cannot test notice creation');
    }

    console.log('\n✅ Database test completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Database test failed:', error);
    console.error('Full error:', JSON.stringify(error, null, 2));
    process.exit(1);
  }
}

// Run the test
testDatabase();
