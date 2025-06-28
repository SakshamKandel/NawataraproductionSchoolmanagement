import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  grade: {
    type: DataTypes.STRING,
    allowNull: false
  },
  section: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'A'
  },
  fatherName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fatherPhone: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isPhoneOrEmpty(value) {
        if (value && value.trim() !== '' && !/^[0-9]{10}$/.test(value)) {
          throw new Error('Father\'s phone must be exactly 10 digits or empty');
        }
      }
    }
  },
  motherName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  motherPhone: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isPhoneOrEmpty(value) {
        if (value && value.trim() !== '' && !/^[0-9]{10}$/.test(value)) {
          throw new Error('Mother\'s phone must be exactly 10 digits or empty');
        }
      }
    }
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // These fields are required for system functionality
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'Students'
});

export default Student; 