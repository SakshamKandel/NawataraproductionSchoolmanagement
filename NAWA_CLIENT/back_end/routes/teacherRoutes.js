import express from 'express';
import { removeTeacher, getAllTeachers } from '../controllers/teacherController.js';
import { changeTeacherPassword } from '../controllers/admin/teacher_account_create_controller.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Get all teachers
router.get('/', getAllTeachers);

// Remove a teacher from the system
router.delete('/:teacherId', verifyToken, verifyAdmin, removeTeacher);

// Change a teacher's password
router.put('/:teacherId/change-password', verifyToken, verifyAdmin, changeTeacherPassword);

export default router; 