import Notice from "../../models/Notice.js";
import { Op } from 'sequelize';

// Emergency simplified controller without Admin associations
const noticeFetchController = async (req, res) => {
  try {
    console.log("[Emergency Notice Fetch] Starting with path:", req.path);
    
    const currentDate = new Date();
    
    // Simple where clause without complex operations
    let whereClause = {
      // Only show published notices
      [Op.or]: [
        { publishDate: null },
        { publishDate: { [Op.lte]: currentDate } }
      ]
    };
    
    // Determine user type from path
    const isAdminEndpoint = req.path.includes('/admin');
    const isTeacherEndpoint = req.path.includes('/teacher');
    const isStudentEndpoint = req.path.includes('/student');
    
    if (!isAdminEndpoint) {
      // For non-admin endpoints, add audience filters
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
    
    console.log("[Emergency Notice Fetch] Where clause:", whereClause);
    
    // Fetch notices WITHOUT associations to avoid JOIN errors
    const notices = await Notice.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      attributes: [
        'id', 'adminId', 'title', 'content', 
        'forTeachers', 'forStudents', 
        'publishDate', 'expiryDate', 
        'createdAt', 'updatedAt'
      ]
    });
    
    console.log(`[Emergency Notice Fetch] Found ${notices.length} notices`);
    
    // Format response without admin name lookup
    const result = notices.map(notice => ({
      id: notice.id,
      adminId: notice.adminId,
      title: notice.title || 'Untitled Notice',
      content: notice.content || '',
      forTeachers: Boolean(notice.forTeachers),
      forStudents: Boolean(notice.forStudents),
      publishDate: notice.publishDate,
      expiryDate: notice.expiryDate,
      createdAt: notice.createdAt,
      updatedAt: notice.updatedAt,
      adminName: "School Admin", // Static name to avoid DB lookup issues
      isActive: !notice.expiryDate || new Date(notice.expiryDate) > currentDate,
      isPublished: !notice.publishDate || new Date(notice.publishDate) <= currentDate
    }));
    
    console.log("[Emergency Notice Fetch] Returning", result.length, "notices");
    res.json(result);
    
  } catch (error) {
    console.error("[Emergency Notice Fetch] Error:", error.message);
    console.error("[Emergency Notice Fetch] Stack:", error.stack);
    
    // Return minimal error info
    res.status(500).json({
      message: "Unable to fetch notices",
      error: "Database connection issue",
      timestamp: new Date().toISOString()
    });
  }
};

export default noticeFetchController;