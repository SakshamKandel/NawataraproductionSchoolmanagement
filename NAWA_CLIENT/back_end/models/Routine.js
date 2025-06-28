import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Teacher from './Teacher.js';

const Routine = sequelize.define('Routine', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  teacherId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Teacher,
      key: 'id'
    }
  },
  day: {
    type: DataTypes.STRING,
    allowNull: false
  },
  period: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  class: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true
});

// Define association
Routine.belongsTo(Teacher, { foreignKey: 'teacherId' });
Teacher.hasMany(Routine, { foreignKey: 'teacherId' });

export default Routine; 