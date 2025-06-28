import express from 'express';
import TeacherNotice from '../models/TeacherNotice.js';
import Teacher from '../models/Teacher.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all teacher notices (Admin view)
router.get('/teacher-notices', verifyAdmin, async (req, res) => {
  try {
    const notices = await TeacherNotice.findAll({
      order: [['createdAt', 'DESC']],
      include: [{
        model: Teacher,
        as: 'teacher',
        attributes: ['name', 'email']
      }]
    });
    
    const formattedNotices = notices.map(notice => {
      const noticeData = notice.toJSON();
      return {
        id: noticeData.id,
        subject: noticeData.subject,
        message: noticeData.message,
        status: noticeData.status,
        createdAt: noticeData.createdAt,
        teacherName: noticeData.teacher ? noticeData.teacher.name : 'Unknown Teacher'
      };
    });

    res.json(formattedNotices);
  } catch (error) {
    console.error('Error fetching teacher notices:', error);
    res.status(500).json({ message: 'Error fetching teacher notices' });
  }
});

// Create a new teacher notice
router.post('/create-notice', async (req, res) => {
  try {
    const { teacherId, subject, message } = req.body;
    
    const newNotice = await TeacherNotice.create({
      teacherId,
      subject,
      message,
      status: 'pending'
    });

    res.status(201).json({ message: 'Notice created successfully' });
  } catch (error) {
    console.error('Error creating notice:', error);
    res.status(500).json({ message: 'Error creating notice' });
  }
});

// Get teacher notices for a specific teacher
router.get('/teacher-alerts', async (req, res) => {
  try {
    const teacherId = req.query.teacherId;
    if (!teacherId) {
      return res.status(400).json({ message: 'Teacher ID is required' });
    }

    const notices = await TeacherNotice.findAll({
      where: { teacherId },
      order: [['createdAt', 'DESC']],
      include: [{
        model: Teacher,
        as: 'teacher',
        attributes: ['name', 'email']
      }]
    });
    
    const formattedNotices = notices.map(notice => {
      const noticeData = notice.toJSON();
      return {
        id: noticeData.id,
        subject: noticeData.subject,
        message: noticeData.message,
        status: noticeData.status,
        createdAt: noticeData.createdAt
      };
    });

    res.json(formattedNotices);
  } catch (error) {
    console.error('Error fetching teacher notices:', error);
    res.status(500).json({ message: 'Error fetching teacher notices' });
  }
});

// Approve a notice
router.patch('/teacher-notices/:id/approve', verifyAdmin, async (req, res) => {
  try {
    const noticeId = req.params.id;
    const notice = await TeacherNotice.findByPk(noticeId);
    
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    await notice.update({ status: 'approved' });
    
    res.json({ 
      message: 'Notice approved successfully',
      notice: {
        id: notice.id,
        subject: notice.subject,
        message: notice.message,
        status: notice.status,
        createdAt: notice.createdAt
      }
    });
  } catch (error) {
    console.error('Error approving notice:', error);
    res.status(500).json({ message: 'Error approving notice' });
  }
});

// Deny a notice
router.patch('/teacher-notices/:id/deny', verifyAdmin, async (req, res) => {
  try {
    const noticeId = req.params.id;
    const notice = await TeacherNotice.findByPk(noticeId);
    
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    await notice.update({ status: 'rejected' });
    
    res.json({ 
      message: 'Notice rejected successfully',
      notice: {
        id: notice.id,
        subject: notice.subject,
        message: notice.message,
        status: notice.status,
        createdAt: notice.createdAt
      }
    });
  } catch (error) {
    console.error('Error rejecting notice:', error);
    res.status(500).json({ message: 'Error rejecting notice' });
  }
});

export default router; 