import express from 'express';
import Teacher from '../../models/Teacher.js';
import TeacherPayroll from '../../models/TeacherPayroll.js';
import { verifyAdmin } from '../../middleware/auth.js';
import sequelize from '../../config/database.js';

const router = express.Router();

// DELETE /admin/remove-teacher/:id
router.delete('/remove-teacher/:id', verifyAdmin, async (req, res) => {
  try {
    const teacherId = req.params.id;
    
    // Use transaction for data integrity
    const result = await sequelize.transaction(async (t) => {
      // Check if teacher exists
      const teacher = await Teacher.findByPk(teacherId, { transaction: t });
      if (!teacher) {
        return null;
      }
      
      // Delete payroll records first
      await TeacherPayroll.destroy({ 
        where: { teacherId },
        transaction: t
      });
      
      // Delete the teacher
      await teacher.destroy({ transaction: t });
      
      return teacher;
    });
    
    if (!result) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    res.json({ message: 'Teacher removed successfully' });
  } catch (error) {
    console.error('Error removing teacher:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router; 