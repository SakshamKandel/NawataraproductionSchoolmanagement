import Admin from './Admin.js';
import Notice from './Notice.js';
import Teacher from './Teacher.js';
import TeacherPayroll from './TeacherPayroll.js';

// Set up association between Admin and Notice
Admin.hasMany(Notice, { foreignKey: 'adminId' });
Notice.belongsTo(Admin, { foreignKey: 'adminId' });

// Set up association between Teacher and TeacherPayroll
Teacher.hasMany(TeacherPayroll, { foreignKey: 'teacherId' });
TeacherPayroll.belongsTo(Teacher, { foreignKey: 'teacherId' });

export default {
  Admin,
  Notice,
  Teacher,
  TeacherPayroll
}; 