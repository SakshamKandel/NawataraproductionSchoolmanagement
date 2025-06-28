import Admin from '../models/Admin.js';
import Teacher from '../models/Teacher.js';
import Routine from '../models/Routine.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

// Get all teachers
export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.findAll({
      order: [['createdAt', 'DESC']] // Sort by creation date, newest first
    });

    console.log(`Found ${teachers.length} teachers`);
    res.status(200).json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ 
      message: 'Error fetching teachers',
      error: error.message 
    });
  }
};

// Create new teacher
export const createTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.create(req.body);

    // Notify all admins - this would need a Notification model
    const admins = await Admin.findAll();
    // We'll need to implement notifications separately
    
    res.status(201).json(teacher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Remove a teacher from the system
export const removeTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    console.log('Attempting to remove teacher with ID:', teacherId);

    if (!teacherId) {
      console.log('Invalid teacher ID format');
      return res.status(400).json({ message: 'Invalid teacher ID format' });
    }

    // Using a transaction to ensure data integrity
    const result = await sequelize.transaction(async (t) => {
      // First delete all payroll records (assuming there's a relation or a model)
      // This would need to be updated based on your actual model structure
      // For now, we're commenting this out as we need to define the TeacherPayroll model
      // const payrollDeleteResult = await TeacherPayroll.destroy({ 
      //   where: { teacherId },
      //   transaction: t
      // });
      // console.log('Deleted payroll records:', payrollDeleteResult);

      // Delete associated routines first
      await Routine.destroy({
        where: { teacherId: teacherId }, // Ensure this matches the foreign key in Routine model
        transaction: t
      });
      console.log('Deleted associated routines for teacher ID:', teacherId);

      // Then delete the teacher
      const teacherDeleteResult = await Teacher.destroy({ 
        where: { id: teacherId },
        transaction: t
      });
      console.log('Teacher delete result:', teacherDeleteResult);

      if (teacherDeleteResult === 0) {
        console.log('No teacher was deleted');
        throw new Error('Teacher not found or already deleted');
      }

      return { teacherDeleteResult };
    });

    res.status(200).json({ 
      message: 'Teacher removed successfully',
      details: {
        teacherId: teacherId,
        // Update this once the TeacherPayroll model is implemented
        // deletedPayrollRecords: result.payrollDeleteResult
      }
    });
  } catch (error) {
    console.error('Error removing teacher:', error);
    res.status(500).json({ 
      message: 'Error removing teacher',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}; 