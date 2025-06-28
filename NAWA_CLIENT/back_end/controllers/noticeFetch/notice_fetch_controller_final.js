import Admin from "../../models/Admin.js";
import Notice from "../../models/Notice.js";
import { Op } from 'sequelize';

const noticeFetchController = async (req, res) => {
  try {
    console.log("[Notice Fetch] Request path:", req.path);
    
    const currentDate = new Date();
    
    // Simple base conditions that match your actual DB structure
    let whereClause = {
      // Only show published notices
      [Op.or]: [
        { publishDate: null },
        { publishDate: { [Op.lte]: currentDate } }
      ]
    };
    
    // Add expiry check using endDate (not expiryDate)
    whereClause[Op.and] = [
      whereClause[Op.or],
      {
        [Op.or]: [
          { endDate: null },
          { endDate: { [Op.gte]: currentDate } }
        ]
      }
    ];
    
    // Determine user type from path
    const isAdminEndpoint = req.path.includes('/admin');
    const isTeacherEndpoint = req.path.includes('/teacher');
    const isStudentEndpoint = req.path.includes('/student');
    
    // Add audience filters for non-admin endpoints
    if (!isAdminEndpoint) {
      if (isTeacherEndpoint) {
        whereClause.forTeachers = true;
      } else if (isStudentEndpoint) {
        whereClause.forStudents = true;
      } else {
        // Public notices
        whereClause.forTeachers = false;
        whereClause.forStudents = false;
      }
    }
    
    console.log("[Notice Fetch] Using where clause:", JSON.stringify(whereClause, null, 2));
    
    // Fetch notices with Admin association
    const notices = await Notice.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      include: [{
        model: Admin,
        attributes: ['name'],
        required: false // LEFT JOIN to avoid missing admin issues
      }]
    });
    
    console.log(`[Notice Fetch] Found ${notices.length} notices`);
    
    // Format response with correct field mapping
    const result = notices.map(notice => {
      const noticeData = notice.toJSON();
      return {
        id: noticeData.id,
        adminId: noticeData.adminId,
        title: noticeData.title || 'Untitled Notice',
        content: noticeData.content || '',
        forTeachers: Boolean(noticeData.forTeachers),
        forStudents: Boolean(noticeData.forStudents),
        publishDate: noticeData.publishDate,
        expiryDate: noticeData.endDate, // Map endDate to expiryDate for frontend
        eventType: noticeData.eventType,
        createdAt: noticeData.createdAt,
        updatedAt: noticeData.updatedAt,
        adminName: (noticeData.Admin && noticeData.Admin.name) ? noticeData.Admin.name : "School Admin",
        isActive: !noticeData.endDate || new Date(noticeData.endDate) > currentDate,
        isPublished: !noticeData.publishDate || new Date(noticeData.publishDate) <= currentDate
      };
    });
    
    console.log("[Notice Fetch] Returning notices:", result.length);
    res.json(result);
    
  } catch (error) {
    console.error("[Notice Fetch] Error:", error.message);
    console.error("[Notice Fetch] Stack:", error.stack);
    
    res.status(500).json({
      message: "Failed to fetch notices",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error",
      timestamp: new Date().toISOString()
    });
  }
};

export default noticeFetchController;