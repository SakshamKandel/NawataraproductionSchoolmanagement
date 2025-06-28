import sequelize from '../config/database.js';
import Notice from '../models/Notice.js';

const migrateNotices = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful.');

    // 1. Add the visibility column
    await sequelize.query(`
      ALTER TABLE Notices 
      ADD COLUMN IF NOT EXISTS visibility ENUM('all', 'teachers_only', 'students_only', 'teachers_and_students') 
      NOT NULL DEFAULT 'all'
    `);
    console.log('Added visibility column');

    // 2. Migrate existing data
    const notices = await Notice.findAll();
    for (const notice of notices) {
      let visibility;
      if (notice.forTeachers && notice.forStudents) {
        visibility = 'teachers_and_students';
      } else if (notice.forTeachers) {
        visibility = 'teachers_only';
      } else if (notice.forStudents) {
        visibility = 'students_only';
      } else {
        visibility = 'all';
      }

      await sequelize.query(`
        UPDATE Notices 
        SET visibility = ? 
        WHERE id = ?
      `, {
        replacements: [visibility, notice.id]
      });
    }
    console.log('Migrated existing notices to new visibility system');

    // 3. Remove old columns (optional - uncomment if you want to remove them)
    /*
    await sequelize.query(`
      ALTER TABLE Notices 
      DROP COLUMN IF EXISTS forTeachers,
      DROP COLUMN IF EXISTS forStudents
    `);
    console.log('Removed old columns');
    */

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await sequelize.close();
  }
};

// Run the migration
migrateNotices(); 