import express from 'express';
import LeaveRequest from '../models/LeaveRequest.js';
import Teacher from '../models/Teacher.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Submit leave request (Teacher)
router.post('/submit-leave', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;
    const teacherId = req.user.user.id; // Assuming id is used in Sequelize

    const leaveRequest = await LeaveRequest.create({
      teacherId,
      startDate,
      endDate,
      reason
    });

    res.status(201).json({ message: 'Leave request submitted successfully', leaveRequest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all leave requests (Admin)
router.get('/leave-requests', verifyAdmin, async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.findAll({
      order: [['createdAt', 'DESC']],
      include: [{
        model: Teacher,
        attributes: ['id', 'name']
      }]
    });
    res.json(leaveRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get teacher's leave requests (Teacher)
router.get('/my-leave-requests', verifyToken, async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.findAll({
      where: { teacherId: req.user.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(leaveRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update leave request status (Admin)
router.put('/leave-request/:id', verifyAdmin, async (req, res) => {
  try {
    const { status, adminComment } = req.body;
    
    const leaveRequest = await LeaveRequest.findByPk(req.params.id);
    
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    
    leaveRequest.status = status;
    leaveRequest.adminComment = adminComment;
    await leaveRequest.save();
    
    res.json(leaveRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 