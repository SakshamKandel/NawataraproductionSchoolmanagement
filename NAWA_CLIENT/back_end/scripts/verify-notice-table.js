import sequelize from '../config/database.js';
import Notice from '../models/Notice.js';

const verifyNoticeTable = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection successful.');

    // Check if Notice table exists
    const [results] = await sequelize.query("SHOW TABLES LIKE 'Notices'");
    if (results.length === 0) {
      console.log('Notice table does not exist. Creating it...');
      await Notice.sync({ force: false });
      console.log('Notice table created successfully.');
    } else {
      console.log('Notice table exists.');

      // Check table structure
      const [columns] = await sequelize.query("SHOW COLUMNS FROM Notices");
      console.log('\nNotice table structure:');
      columns.forEach(column => {
        console.log(`- ${column.Field}: ${column.Type}`);
      });

      // Check if there are any notices
      const noticeCount = await Notice.count();
      console.log(`\nTotal notices in database: ${noticeCount}`);
    }

  } catch (error) {
    console.error('Error verifying notice table:', error);
  } finally {
    await sequelize.close();
  }
};

verifyNoticeTable(); 