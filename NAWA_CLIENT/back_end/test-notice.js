/**
 * Simple test endpoint for debugging notice issues
 * Add this to your index.js temporarily for debugging
 */
import Notice from './models/Notice.js';
import Admin from './models/Admin.js';

// Add this route to your index.js for testing
const testNoticeRoute = async (req, res) => {
  try {
    console.log('🔍 Testing Notice model...');
    
    // Test 1: Simple count
    const count = await Notice.count();
    console.log(`✅ Found ${count} notices in database`);
    
    // Test 2: Simple findAll without associations
    const notices = await Notice.findAll({ limit: 5 });
    console.log(`✅ Retrieved ${notices.length} notices`);
    
    // Test 3: Test with associations
    let noticesWithAdmin = [];
    try {
      noticesWithAdmin = await Notice.findAll({
        limit: 5,
        include: [{
          model: Admin,
          attributes: ['name'],
          required: false
        }]
      });
      console.log(`✅ Retrieved ${noticesWithAdmin.length} notices with admin association`);
    } catch (assocError) {
      console.log(`❌ Association error: ${assocError.message}`);
    }
    
    // Test 4: Check table structure
    const tableInfo = await Notice.describe();
    console.log('📋 Notice table columns:', Object.keys(tableInfo));
    
    res.json({
      success: true,
      tests: {
        count: count,
        simpleQuery: notices.length,
        associationQuery: noticesWithAdmin.length,
        columns: Object.keys(tableInfo)
      },
      sampleNotice: notices.length > 0 ? {
        id: notices[0].id,
        title: notices[0].title,
        adminId: notices[0].adminId,
        forTeachers: notices[0].forTeachers,
        forStudents: notices[0].forStudents
      } : null
    });
    
  } catch (error) {
    console.error('❌ Notice test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
};

export default testNoticeRoute;
