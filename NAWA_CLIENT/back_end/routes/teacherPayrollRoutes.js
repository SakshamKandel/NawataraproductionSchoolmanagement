import express from 'express';
import { getTeacherPayroll, updateSalary, getAllTeachersPayroll, getPayrollSummary, removeTeacher, clearTeacherPayroll, testDatabaseConnection } from '../controllers/teacherPayrollController.js';
import { verifyToken, verifyTeacher, verifyAdmin, verifyRoles } from '../middleware/auth.js';
import { getTeacherPayrollByYear, updateTeacherMonthSalary } from '../controllers/teacherPayrollController.js';

const router = express.Router();

// Test database connection (no auth required)
router.get('/test-db', testDatabaseConnection);

// Routes requiring authentication
router.use(verifyToken);

// Get salary records for the currently logged-in teacher
router.get('/mine', async (req, res) => {
  try {
    console.log('Accessing /mine route with user:', req.user);
    
    // Check if this is a teacher
    if (!req.teacher) {
      console.log('Not a teacher, access denied');
      return res.status(403).json({ message: 'Access denied. Only teachers can view their salary.' });
    }
    
    const teacherId = req.user.id || req.teacher.id;
    console.log('Teacher ID from auth:', teacherId);
    
    if (!teacherId) {
      return res.status(401).json({ message: 'Teacher ID not found in token.' });
    }
    
    req.params.teacherId = teacherId;
    await getTeacherPayroll(req, res);
  } catch (error) {
    console.error('Error accessing mine route:', error);
    res.status(500).json({ message: error.message });
  }
});

// Admin routes below require admin authorization
router.use(verifyRoles(['Admin']));

// Get salary records for a specific teacher (admin only)
router.get('/:teacherId', getTeacherPayroll);

// Update salary for a specific month (admin only)
router.put('/:teacherId', updateSalary);

// Get all teachers with their payroll status (admin only)
router.get('/', getAllTeachersPayroll);

// Get payroll summary for a specific year (admin only)
router.get('/summary/:year', getPayrollSummary);

// Remove a teacher from the system (admin only)
router.delete('/:teacherId', removeTeacher);

// Clear all payroll records for a specific teacher (admin only)
router.post('/clear', verifyToken, clearTeacherPayroll);

// GET a specific teacher's payroll for a given year
router.get('/:teacherId/:year', getTeacherPayrollByYear);

export default router; 