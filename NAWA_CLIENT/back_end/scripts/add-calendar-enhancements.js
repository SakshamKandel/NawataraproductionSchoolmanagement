import sequelize from '../config/database.js';

const addCalendarEnhancements = async () => {
  try {
    console.log('Adding calendar enhancement columns...');
    
    // Check and add endDate column
    try {
      await sequelize.query(`
        ALTER TABLE Notices 
        ADD COLUMN endDate DATETIME NULL 
        COMMENT 'For multi-day events, this represents the end date'
      `);
      console.log('endDate column added successfully');
    } catch (error) {
      if (error.original?.code === 'ER_DUP_FIELDNAME') {
        console.log('endDate column already exists');
      } else {
        throw error;
      }
    }
    
    // Check and add eventType column
    try {
      await sequelize.query(`
        ALTER TABLE Notices 
        ADD COLUMN eventType ENUM('notice', 'event', 'holiday', 'exam', 'meeting') 
        DEFAULT 'notice' 
        COMMENT 'Type of calendar item for visual distinction'
      `);
      console.log('eventType column added successfully');
    } catch (error) {
      if (error.original?.code === 'ER_DUP_FIELDNAME') {
        console.log('eventType column already exists');
      } else {
        throw error;
      }
    }
    
    console.log('Calendar enhancement columns migration completed');
  } catch (error) {
    console.error('Error adding calendar enhancement columns:', error);
  } finally {
    await sequelize.close();
  }
};

addCalendarEnhancements();
