import express from 'express';
import { 
  getRoutine, 
  addRoutine, 
  updateRoutine, 
  deleteRoutine,
  bulkUpdateRoutine,
  assignClassToTeacher,
  getClassRoutine
} from '../controllers/routineController.js';
import { verifyToken, verifyAdmin, verifyTeacher } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Get routes
router.get('/teacher/routine', verifyTeacher, getRoutine); // Teacher gets own routine
router.get('/teacher/:teacherId/routine', verifyAdmin, getRoutine); // Admin gets teacher's routine
router.get('/class/:className/routine', getClassRoutine); // Get routine for a specific class

// Add and update routes
router.post('/routine', verifyAdmin, addRoutine); // Add single routine entry
router.put('/routine', verifyAdmin, updateRoutine); // Update single routine entry
router.delete('/routine', verifyAdmin, deleteRoutine); // Delete single routine entry

// Bulk update route (replace entire schedule)
router.patch('/teacher/:teacherId/routine', verifyAdmin, bulkUpdateRoutine);

// Class assignment routes
router.post('/assign-class', verifyAdmin, assignClassToTeacher); // Assign class to a teacher

export default router; 