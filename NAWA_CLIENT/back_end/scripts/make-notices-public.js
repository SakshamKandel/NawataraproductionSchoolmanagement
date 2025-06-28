import sequelize from '../config/database.js';
import Notice from '../models/Notice.js';

const updateNoticesForPublicTest = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful.');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const noticesToUpdate = [
      { id: 7, title: 'Public Notice 1 (Updated)' }, 
      { id: 8, title: 'Public Notice 2 (Updated)' }
    ];

    for (const noticeData of noticesToUpdate) {
      const [updatedCount] = await Notice.update({
        forTeachers: false,
        forStudents: false,
        publishDate: yesterday,
        expiryDate: null,
        title: noticeData.title // Also update title for clarity
      }, {
        where: { id: noticeData.id }
      });
      if (updatedCount > 0) {
        console.log(`Notice ID ${noticeData.id} updated to be public and active.`);
      } else {
        console.log(`Notice ID ${noticeData.id} not found or no change needed.`);
      }
    }

    // Verify by listing them
    const updatedNotices = await Notice.findAll({
      where: { id: noticesToUpdate.map(n => n.id) }
    });
    console.log('\nUpdated notices details:');
    updatedNotices.forEach(n => {
      console.log({
        id: n.id,
        title: n.title,
        forTeachers: n.forTeachers,
        forStudents: n.forStudents,
        publishDate: n.publishDate,
        expiryDate: n.expiryDate
      });
    });

  } catch (error) {
    console.error('Error updating notices:', error);
  } finally {
    await sequelize.close();
  }
};

updateNoticesForPublicTest(); 