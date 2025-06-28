import express from "express";
import Notice from "../../models/Notice.js";
import { verifyAdmin, verifyToken } from "../../middleware/auth.js";
import { Op } from "sequelize";
import Admin from "../../models/Admin.js";

const router = express.Router();

// Create new notice (Admin only)
router.post("/create-notice", verifyAdmin, async (req, res) => {
  try {
    let { 
      title, 
      content, 
      audienceType, // Expected values: 'All', 'Teachers & Staff', 'Students'
      publishDate, 
      expiryDate 
    } = req.body;
    
    console.log('[AdminNoticeRoute /create-notice] Raw req.body:', JSON.stringify(req.body));

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }
    if (!audienceType) {
      return res.status(400).json({ message: "Audience type is required" });
    }

    const currentDate = new Date();
    if (publishDate && new Date(publishDate) < currentDate) {
      return res.status(400).json({ message: "Publish date cannot be in the past" });
    }
    if (expiryDate && new Date(expiryDate) <= currentDate) {
      return res.status(400).json({ message: "Expiry date must be in the future" });
    }
    if (publishDate && expiryDate && new Date(publishDate) >= new Date(expiryDate)) {
      return res.status(400).json({ message: "Expiry date must be after publish date" });
    }

    // Set audience flags based on selection
    let forTeachers = false;
    let forStudents = false;

    switch (audienceType) {
      case 'All':
        // For "All", both flags are false to indicate public access
        forTeachers = false;
        forStudents = false;
        break;
      case 'Teachers & Staff':
      case 'Teachers & Staffs':
        forTeachers = true;
        forStudents = false;
        break;
      case 'Students':
        forTeachers = false;
        forStudents = true;
        break;
      case 'Teachers and Students':
        forTeachers = true;
        forStudents = true;
        break;
      default:
        return res.status(400).json({ message: `Invalid audienceType: ${audienceType}` });
    }

    console.log(`[AdminNoticeRoute /create-notice] Audience flags - forTeachers: ${forTeachers}, forStudents: ${forStudents}`);
    
    const notice = await Notice.create({
      title, 
      content,
      forTeachers,
      forStudents,
      publishDate: publishDate || new Date(),
      expiryDate: expiryDate || null,
      adminId: req.admin.id
    });
    
    // Send back the actual saved values
    const responseNotice = {
        id: notice.id,
        title: notice.title,
        content: notice.content, // Send content back for immediate display/confirmation
        forTeachers: notice.forTeachers,
        forStudents: notice.forStudents,
        publishDate: notice.publishDate,
        expiryDate: notice.expiryDate,
        adminId: notice.adminId
    };

    console.log('[AdminNoticeRoute /create-notice] Created notice object from DB:', JSON.stringify(responseNotice));
    
    res.status(201).json({
      message: "Notice created successfully",
      notice: responseNotice
    });

  } catch (error) {
    console.error("Error creating notice:", error);
    res.status(500).json({ message: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined });
  }
});

// Update notice (Admin only)
router.put("/update-notice/:id", verifyAdmin, async (req, res) => {
  try {
    const noticeId = req.params.id;
    const { 
      title, 
      content, 
      forTeachers, 
      forStudents, 
      publishDate, 
      expiryDate 
    } = req.body;
    
    const notice = await Notice.findByPk(noticeId);
    
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    // Validate dates if provided
    const currentDate = new Date();
    if (publishDate && new Date(publishDate) < currentDate) {
      return res.status(400).json({ 
        message: "Publish date cannot be in the past" 
      });
    }
    if (expiryDate && new Date(expiryDate) <= currentDate) {
      return res.status(400).json({ 
        message: "Expiry date must be in the future" 
      });
    }
    if (publishDate && expiryDate && new Date(publishDate) >= new Date(expiryDate)) {
      return res.status(400).json({ 
        message: "Expiry date must be after publish date" 
      });
    }

    // Validate visibility settings
    if (forTeachers === false && forStudents === false) {
      return res.status(400).json({ 
        message: "Notice must be visible to at least one group (teachers or students)" 
      });
    }
    
    await notice.update({
      title: title || notice.title,
      content: content || notice.content,
      forTeachers: forTeachers !== undefined ? forTeachers : notice.forTeachers,
      forStudents: forStudents !== undefined ? forStudents : notice.forStudents, 
      publishDate: publishDate || notice.publishDate,
      expiryDate: expiryDate || notice.expiryDate
    });
    
    res.json({
      message: "Notice updated successfully",
      notice: {
        id: notice.id,
        title: notice.title,
        forTeachers: notice.forTeachers,
        forStudents: notice.forStudents,
        publishDate: notice.publishDate,
        expiryDate: notice.expiryDate
      }
    });
  } catch (error) {
    console.error("Error updating notice:", error);
    res.status(500).json({ message: error.message });
  }
});

// Delete notice (Admin only)
router.delete("/delete-notice/:id", verifyAdmin, async (req, res) => {
  try {
    const noticeId = req.params.id;
    const notice = await Notice.findByPk(noticeId);
    
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }
    
    await notice.destroy();
    
    res.json({ message: "Notice deleted successfully" });
  } catch (error) {
    console.error("Error deleting notice:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get all notices (Admin only)
router.get("/notices", verifyAdmin, async (req, res) => {
  try {
    const notices = await Notice.findAll({
      order: [
        ['publishDate', 'DESC'],
        ['createdAt', 'DESC']
      ],
      include: [{
        model: Admin,
        attributes: ['name']
      }]
    });
    
    const formattedNotices = notices.map(notice => {
      const noticeObj = notice.toJSON();
      const currentDate = new Date();
      return {
        ...noticeObj,
        isActive: !noticeObj.expiryDate || new Date(noticeObj.expiryDate) > currentDate,
        isPublished: !noticeObj.publishDate || new Date(noticeObj.publishDate) <= currentDate
      };
    });
    
    res.json(formattedNotices);
  } catch (error) {
    console.error("Error fetching notices:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get active notices (Admin only)
router.get("/active-notices", verifyAdmin, async (req, res) => {
  try {
    const currentDate = new Date();
    
    const notices = await Notice.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { expiryDate: null },
              { expiryDate: { [Op.gte]: currentDate } }
            ]
          },
          {
            [Op.or]: [
              { publishDate: null },
              { publishDate: { [Op.lte]: currentDate } }
            ]
          }
        ]
      },
      order: [
        ['publishDate', 'DESC'],
        ['createdAt', 'DESC']
      ],
      include: [{
        model: Admin,
        attributes: ['name']
      }]
    });
    
    const formattedNotices = notices.map(notice => {
      const noticeObj = notice.toJSON();
      return {
        ...noticeObj,
        isActive: true,
        isPublished: true
      };
    });
    
    res.json(formattedNotices);
  } catch (error) {
    console.error("Error fetching active notices:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router; 