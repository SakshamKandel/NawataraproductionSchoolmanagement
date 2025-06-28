import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
// import TeacherNotice from './TeacherNotice.js'; // REMOVE this line to avoid circular dependency

const Teacher = sequelize.define('Teacher', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    // unique: true, // Temporarily commented out
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Add payment-related fields
  payments: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {} // Will store payment history with key format: "YEAR_MONTH"
  },
  lastPayment: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null // Stores the most recent payment for quick access
  },
  position: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Teacher'
  },
  contact: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true
});

// Teacher.hasMany(TeacherNotice, { foreignKey: 'teacherId', as: 'notices' }); // REMOVE this line from here

export default Teacher; 