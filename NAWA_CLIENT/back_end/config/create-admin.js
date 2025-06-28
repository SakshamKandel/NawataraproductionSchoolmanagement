import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import sequelize from './database.js';

async function createDefaultAdmin() {
  try {
    // Connect to the database
    await sequelize.authenticate();
    console.log('Connected to database');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      where: { email: 'admin@nawataraenglishschool.com' }
    });

    if (existingAdmin) {
      console.log('Default admin account already exists');
      return;
    }

    // Create default admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await Admin.create({
      id: 1,
      name: 'Default Admin',
      email: 'admin@nawataraenglishschool.com',
      password: hashedPassword,
      role: 'admin'
    });

    console.log('Default admin created successfully:', admin.email);
  } catch (error) {
    console.error('Error creating default admin:', error);
  } finally {
    // Close connection
    await sequelize.close();
  }
}

// Execute the function
createDefaultAdmin(); 