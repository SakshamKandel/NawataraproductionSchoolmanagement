import bcrypt from 'bcryptjs';
import Admin from './models/Admin.js';
import sequelize from './config/database.js';

async function createDeveloperAdmin() {
  try {
    // Connect to the database
    await sequelize.authenticate();
    console.log('Connected to database');

    // Check if developer admin already exists
    const existingDeveloper = await Admin.findOne({
      where: { email: 'developer@nawataraenglishschool.com' }
    });

    if (existingDeveloper) {
      console.log('Developer admin account already exists');
      return;
    }

    // Create developer admin
    const hashedPassword = await bcrypt.hash('developer123', 10);
    
    const admin = await Admin.create({
      name: 'Developer Admin',
      email: 'developer@nawataraenglishschool.com',
      password: hashedPassword,
      role: 'admin'
    });

    console.log('Developer admin created successfully:', admin.email);
    console.log('Password: developer123');
  } catch (error) {
    console.error('Error creating developer admin:', error);
  } finally {
    // Close connection
    await sequelize.close();
  }
}

// Execute the function
createDeveloperAdmin();
