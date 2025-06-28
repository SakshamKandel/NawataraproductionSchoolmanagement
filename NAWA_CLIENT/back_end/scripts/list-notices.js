import sequelize from '../config/database.js';
import Notice from '../models/Notice.js';

const listNotices = async () => {
  try {
    await sequelize.authenticate();
    const notices = await Notice.findAll();
    if (notices.length === 0) {
      console.log('No notices found.');
    } else {
      console.log('All Notices:');
      notices.forEach(n => {
        console.log({
          id: n.id,
          title: n.title,
          forTeachers: n.forTeachers,
          forStudents: n.forStudents,
          publishDate: n.publishDate,
          expiryDate: n.expiryDate,
          createdAt: n.createdAt,
          updatedAt: n.updatedAt
        });
      });
    }
  } catch (error) {
    console.error('Error listing notices:', error);
  } finally {
    await sequelize.close();
  }
};

listNotices(); 