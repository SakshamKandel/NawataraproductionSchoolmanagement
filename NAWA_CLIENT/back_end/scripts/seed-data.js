import sequelize from '../config/database.js';
import Admin from '../models/Admin.js';
import Teacher from '../models/Teacher.js';
import Notice from '../models/Notice.js';
import bcrypt from 'bcrypt';

async function seedData() {
  try {
    console.log('Starting data seeding...');

    // Create default admin if it doesn't exist
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminData = {
      name: 'Admin',
      email: 'admin@navatara.edu.np',
      password: hashedPassword,
      role: 'admin',
      canManageYear: true,
      canManageAdmins: true
    };

    let admin;
    try {
      admin = await Admin.findOne({ where: { email: adminData.email } });
      if (!admin) {
        admin = await Admin.create(adminData);
        console.log('Admin account created');
      } else {
        console.log('Admin account already exists');
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      throw error;
    }

    // Create developer account if it doesn't exist
    const developerData = {
      name: 'Developer',
      email: 'developer@nawatara.edu.np',
      password: await bcrypt.hash('Developer@123', 10),
      role: 'developer',
      canManageYear: true,
      canManageAdmins: true
    };

    try {
      const developer = await Admin.findOne({ where: { email: developerData.email } });
      if (!developer) {
        await Admin.create(developerData);
        console.log('Developer account created');
      } else {
        console.log('Developer account already exists');
      }
    } catch (error) {
      console.error('Error creating developer:', error);
      throw error;
    }

    // Create some sample notices
    const noticesData = [
      {
        title: 'Welcome to New Academic Year',
        content: 'Welcome to the new academic year 2024. We hope this year brings success to all students.',
        adminId: admin.id,
        forTeachers: true,
        forStudents: true,
        publishDate: new Date(),
        expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
      },
      {
        title: 'Teacher Meeting Notice',
        content: 'All teachers are requested to attend the monthly meeting.',
        adminId: admin.id,
        forTeachers: true,
        forStudents: false,
        publishDate: new Date(),
        expiryDate: new Date(new Date().setDate(new Date().getDate() + 7))
      },
      {
        title: 'Exam Schedule',
        content: 'Final examination schedule has been published. Please check the calendar.',
        adminId: admin.id,
        forTeachers: true,
        forStudents: true,
        publishDate: new Date(),
        expiryDate: new Date(new Date().setDate(new Date().getDate() + 30))
      }
    ];

    for (const noticeData of noticesData) {
      try {
        const existingNotice = await Notice.findOne({
          where: {
            title: noticeData.title,
            adminId: noticeData.adminId
          }
        });

        if (!existingNotice) {
          await Notice.create(noticeData);
          console.log(`Notice "${noticeData.title}" created`);
        } else {
          console.log(`Notice "${noticeData.title}" already exists`);
        }
      } catch (error) {
        console.error(`Error creating notice "${noticeData.title}":`, error);
      }
    }

    // Create a sample teacher
    const teacherData = {
      name: 'John Doe',
      email: 'teacher@navatara.edu.np',
      password: await bcrypt.hash('teacher123', 10),
      role: 'teacher',
      subject: 'Mathematics',
      phone: '9876543210',
      address: 'Kathmandu',
      salary: 25000
    };

    try {
      const existingTeacher = await Teacher.findOne({ where: { email: teacherData.email } });
      if (!existingTeacher) {
        await Teacher.create(teacherData);
        console.log('Sample teacher account created');
      } else {
        console.log('Sample teacher account already exists');
      }
    } catch (error) {
      console.error('Error creating teacher:', error);
    }

    console.log('Data seeding completed successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the seeding function
seedData(); 