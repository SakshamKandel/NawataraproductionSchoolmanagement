import express from 'express';
const router = express.Router();
import { verifyToken, verifyAdmin, verifySpecificAdmin } from '../../middleware/auth.js';
import { getAllAdmins, deleteAdmin, changeOwnPassword, resetOtherAdminPassword } from '../../controllers/admin/admin_management_controller.js';

// Route to get all admin accounts
// Protected by verifyToken, general verifyAdmin, and specific admin check
router.get('/admins', verifyToken, verifyAdmin, verifySpecificAdmin, getAllAdmins);

// Route to delete an admin account
// Protected by verifyToken, general verifyAdmin, and specific admin check
router.delete('/admins/:id', verifyToken, verifyAdmin, verifySpecificAdmin, deleteAdmin);

// Route for an admin to change their own password
// Protected by verifyToken and general verifyAdmin (to ensure they are an admin)
router.post('/admins/me/change-password', verifyToken, verifyAdmin, changeOwnPassword);

// Route for an authorized admin to reset another admin's password
router.put('/admins/:id/reset-password', verifyToken, verifyAdmin, verifySpecificAdmin, resetOtherAdminPassword);

export default router; 