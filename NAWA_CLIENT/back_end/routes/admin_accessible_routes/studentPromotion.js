import express from 'express';
import {
  getClassSummary,
  getClassStudentsForPromotion,
  promoteSingleClass,
  promoteAllClasses,
  getGraduatedStudentsFiles,
  downloadGraduatedStudentsFile
} from '../../controllers/admin/studentPromotionController.js';
import { verifyToken, verifyAdmin } from '../../middleware/auth.js';

const router = express.Router();

// All routes require admin authentication
router.use(verifyToken);
router.use(verifyAdmin);

// Get summary of all classes and their student counts
router.get('/class-summary', getClassSummary);

// Get students in a specific class for promotion preview
router.get('/class/:className/students', getClassStudentsForPromotion);

// Promote a single class
router.post('/promote-class', promoteSingleClass);

// Promote all classes at once
router.post('/promote-all', promoteAllClasses);

// Get list of graduated students files
router.get('/graduated-files', getGraduatedStudentsFiles);

// Download a graduated students file
router.get('/graduated-files/:fileName', downloadGraduatedStudentsFile);

export default router;
