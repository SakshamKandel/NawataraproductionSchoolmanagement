import express from 'express';
import { verifyToken, verifyAdmin } from '../../middleware/auth.js';
import { exportStudents, importStudents, getImportTemplate, getAvailableSections, upload } from '../../controllers/admin/studentDataController.js';

const router = express.Router();

// Export students data
router.get('/export', verifyToken, verifyAdmin, exportStudents);

// Import students data
router.post('/import', verifyToken, verifyAdmin, upload.single('file'), importStudents);

// Download import template
router.get('/template', verifyToken, verifyAdmin, getImportTemplate);

// Get available sections for a grade
router.get('/sections', verifyToken, verifyAdmin, getAvailableSections);

export default router;
