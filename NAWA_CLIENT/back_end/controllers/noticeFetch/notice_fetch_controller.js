import Admin from "../../models/Admin.js";
import Notice from "../../models/Notice.js";
import { Op } from 'sequelize';

const noticeFetchController = async (req, res) => {
  try {
    console.log("[Notice Fetch] Starting request processing...");
    console.log("[Notice Fetch] Request details:", {
      path: req.path,
      method: req.method,
      user: req.user ? { role: req.user.role, id: req.user.id } : 'No user',
      admin: req.admin ? { id: req.admin.id, name: req.admin.name } : 'No admin',
      cookies: Object.keys(req.cookies || {})
    });
    
    let whereClause = {};
    const currentDate = new Date();
    
    // Base visibility conditions - simplified
    const visibilityConditions = {
      [Op.and]: [
        // Only show notices that are published
        {
          [Op.or]: [
            { publishDate: null },
            { publishDate: { [Op.lte]: currentDate } }
          ]
        },
        // Only show notices that haven't expired (using endDate instead)
        {
          [Op.or]: [
            { endDate: null },
            { endDate: { [Op.gte]: currentDate } }
          ]
        }
      ]
    };
    
    // Determine access level from request path and user role
    const isPublicEndpoint = req.path.includes('/public');
    const isTeacherEndpoint = req.path.includes('/teacher');
    const isStudentEndpoint = req.path.includes('/student');
    const isAdminEndpoint = req.path.includes('/admin');
    
    // Set appropriate filters based on endpoint and user role
    if (isPublicEndpoint || (!req.user && !isTeacherEndpoint && !isStudentEndpoint && !isAdminEndpoint)) {
      // Public access - show notices marked as public (both flags false)
      whereClause = {
        ...visibilityConditions,
        [Op.or]: [
          { [Op.and]: [{ forTeachers: false }, { forStudents: false }] }  // Public notices
        ]
      };
      console.log("[Notice Fetch] Using public notice filter (public only)");
    } else if (isTeacherEndpoint || req.teacher) {
      // Teacher access - show ONLY teacher notices and public notices
      whereClause = {
        ...visibilityConditions,
        [Op.or]: [
          { forTeachers: true },  // Teacher-specific notices
          { [Op.and]: [{ forTeachers: false }, { forStudents: false }] }  // Public notices
        ]
      };
      console.log("[Notice Fetch] Using teacher notice filter");
    } else if (isStudentEndpoint || req.student) {
      // Student access - show ONLY student notices and public notices
      whereClause = {
        ...visibilityConditions,
        [Op.or]: [
          { forStudents: true },  // Student-specific notices
          { [Op.and]: [{ forTeachers: false }, { forStudents: false }] }  // Public notices
        ]
      };
      console.log("[Notice Fetch] Using student notice filter");
    } else if (isAdminEndpoint || req.admin) {
      // Admin access - show all notices
      whereClause = visibilityConditions;
      console.log("[Notice Fetch] Using admin notice filter");
    } else {
      // Default fallback - show only public notices
      whereClause = {
        ...visibilityConditions,
        forTeachers: false,
        forStudents: false
      };
      console.log("[Notice Fetch] Using default fallback filter (public only)");
    }

    console.log("[Notice Fetch] Final where clause:", JSON.stringify(whereClause, null, 2));

    // Fetch notices with enhanced error handling
    let result;
    try {
      console.log("[Notice Fetch] Attempting to fetch notices from database...");
      result = await Notice.findAll({
        where: whereClause,
        order: [
          ['publishDate', 'DESC'],
          ['createdAt', 'DESC']
        ],
        include: [{
          model: Admin,
          attributes: ['name'],
          required: false // LEFT JOIN instead of INNER JOIN
        }]
      });
      console.log("[Notice Fetch] Database query successful, found", result.length, "notices");
    } catch (includeError) {
      console.warn("[Notice Fetch] Association error, trying without Admin:", includeError.message);
      console.warn("[Notice Fetch] Full include error:", includeError);
      // Fallback: fetch without Admin association
      try {
        result = await Notice.findAll({
          where: whereClause,
          order: [
            ['publishDate', 'DESC'],
            ['createdAt', 'DESC']
          ]
        });
        console.log("[Notice Fetch] Fallback query successful, found", result.length, "notices");
      } catch (fallbackError) {
        console.error("[Notice Fetch] Fallback query also failed:", fallbackError);
        throw fallbackError;
      }
    }

    console.log(`[Notice Fetch] Found ${result.length} notices`);

    // Format the response
    const finalResult = result.map(notice => {
      const noticeObj = notice.toJSON();
      return {
        id: noticeObj.id,
        adminId: noticeObj.adminId,
        title: noticeObj.title,
        content: noticeObj.content,
        forTeachers: noticeObj.forTeachers,
        forStudents: noticeObj.forStudents,
        publishDate: noticeObj.publishDate,
        endDate: noticeObj.endDate,
        createdAt: noticeObj.createdAt,
        updatedAt: noticeObj.updatedAt,
        adminName: (noticeObj.Admin && noticeObj.Admin.name) ? noticeObj.Admin.name : "System Admin",
        isActive: !noticeObj.endDate || new Date(noticeObj.endDate) > currentDate,
        isPublished: !noticeObj.publishDate || new Date(noticeObj.publishDate) <= currentDate
      };
    });

    // Log success with sample data
    if (finalResult.length > 0) {
      console.log("[Notice Fetch] Sample notice:", {
        id: finalResult[0].id,
        title: finalResult[0].title,
        content: finalResult[0].content ? `${finalResult[0].content.substring(0, 50)}...` : 'MISSING CONTENT',
        adminName: finalResult[0].adminName,
        isActive: finalResult[0].isActive,
        isPublished: finalResult[0].isPublished
      });
    }

    res.json(finalResult);
  } catch (error) {
    console.error("[Notice Fetch] Error fetching notices:", {
      message: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method
    });
    
    // Return a safe error response
    res.status(500).json({ 
      message: "Failed to fetch notices", 
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export default noticeFetchController;
