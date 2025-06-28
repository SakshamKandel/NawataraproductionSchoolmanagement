import sequelize from '../config/database.js';
import Notice from '../models/Notice.js';

const addSampleEvents = async () => {
  try {
    console.log('Adding sample calendar events...');
    
    // Sample multi-day event
    await Notice.create({
      adminId: 2, // Assuming admin ID 2 exists
      title: "School Sports Week",
      content: "Annual sports week featuring various competitions, games, and activities for all students and staff.",
      eventType: "event",
      forTeachers: true,
      forStudents: true,
      publishDate: new Date('2025-06-15'),
      endDate: new Date('2025-06-20'), // 6-day event
      expiryDate: new Date('2025-06-21')
    });

    // Sample single-day notice
    await Notice.create({
      adminId: 2,
      title: "Parent-Teacher Meeting",
      content: "Important meeting with parents to discuss student progress and academic plans.",
      eventType: "meeting",
      forTeachers: true,
      forStudents: false,
      publishDate: new Date('2025-06-18'),
      endDate: null,
      expiryDate: new Date('2025-06-19')
    });

    // Sample holiday
    await Notice.create({
      adminId: 2,
      title: "National Day Holiday",
      content: "School will be closed in observance of National Day.",
      eventType: "holiday",
      forTeachers: true,
      forStudents: true,
      publishDate: new Date('2025-06-25'),
      endDate: null,
      expiryDate: new Date('2025-06-26')
    });

    // Sample exam period
    await Notice.create({
      adminId: 2,
      title: "Final Examinations",
      content: "Final examination period for all classes. Students must arrive 30 minutes early.",
      eventType: "exam",
      forTeachers: true,
      forStudents: true,
      publishDate: new Date('2025-06-30'),
      endDate: new Date('2025-07-05'), // 6-day exam period
      expiryDate: new Date('2025-07-06')
    });

    console.log('Sample events added successfully!');
  } catch (error) {
    console.error('Error adding sample events:', error);
  } finally {
    await sequelize.close();
  }
};

addSampleEvents();
