import bcrypt from 'bcryptjs';
import Teacher from '../models/Teacher.js';
import sequelize from './database.js';

async function createDefaultTeacher() {
  try {
    // Connect to the database
    await sequelize.authenticate();
    console.log('Connected to database');

    // Check if teacher already exists
    const existingTeacher = await Teacher.findOne({
      where: { email: 'teacher@gmail.com' }
    });

    if (existingTeacher) {
      console.log('Default teacher account already exists');
      return;
    }

    // Create default teacher
    const hashedPassword = await bcrypt.hash('teacher123', 10);
    
    const teacher = await Teacher.create({
      name: 'Default Teacher',
      email: 'teacher@gmail.com',
      password: hashedPassword
    });

    console.log('Default teacher created successfully:', teacher.email);
  } catch (error) {
    console.error('Error creating default teacher:', error);
  } finally {
    // Close connection
    await sequelize.close();
  }
}

// Execute the function
createDefaultTeacher(); 