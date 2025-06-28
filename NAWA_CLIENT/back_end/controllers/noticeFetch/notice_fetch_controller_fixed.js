import Admin from "../../models/Admin.js";
import Notice from "../../models/Notice.js";
import { Op } from 'sequelize';

const noticeFetchController = async (req, res) => {
  try {
    console.log("[Notice Fetch] Request details:", {
      path: req.path,
      method: req.method,
      user: req.user ? { role: req.user.role, id: req.user.id } : 'No user'
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
        // Only show notices that haven't expired
        {
          [Op.or]: [
            { expiryDate: null },
            { expiryDate: { [Op.gte]: currentDate } }
          ]
        }
      ]
    };
    
    // Determine access level from request path and user role
    const isPublicEndpoint = req.path.includes('/public');
    const isTeacherEndpoint = req.path.includes('/teacher');
    const isStudentEndpoint = req.path.includes('/student');
    const isAdminEndpoint = req.path.includes('/admin');
    
    // Simplified filtering logic
    if (isAdminEndpoint || req.admin) {
      // Admin access - show all notices
      whereClause = visibilityConditions;
      console.log("[Notice Fetch] Using admin notice filter");
    } else if (isTeacherEndpoint || req.teacher) {
      // Teacher access
      whereClause = {
        ...visibilityConditions,
        [Op.or]: [
          { forTeachers: true },
          { [Op.and]: [{ forTeachers: false }, { forStudents: false }] }
        ]
      };
      console.log("[Notice Fetch] Using teacher notice filter");
    } else if (isStudentEndpoint || req.student) {
      // Student access
      whereClause = {
        ...visibilityConditions,
        [Op.or]: [
          { forStudents: true },
          { [Op.and]: [{ forTeachers: false }, { forStudents: false }] }
        ]
      };
      console.log("[Notice Fetch] Using student notice filter");
    } else {
      // Public/default access
      whereClause = {
        ...visibilityConditions,
        forTeachers: false,
        forStudents: false
      };
      console.log("[Notice Fetch] Using public notice filter");
    }

    console.log("[Notice Fetch] Final where clause:", JSON.stringify(whereClause, null, 2));

    // Fetch notices with error handling for associations
    let result;
    try {
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
    } catch (includeError) {
      console.warn("[Notice Fetch] Association error, fetching without Admin:", includeError.message);
      // Fallback: fetch without Admin association
      result = await Notice.findAll({
        where: whereClause,
        order: [
          ['publishDate', 'DESC'],
          ['createdAt', 'DESC']
        ]
      });
    }

    console.log(`[Notice Fetch] Found ${result.length} notices`);

    // Format the response with safe property access
    const finalResult = result.map(notice => {
      const noticeObj = notice.toJSON();
      return {
        id: noticeObj.id,
        adminId: noticeObj.adminId,
        title: noticeObj.title || 'Untitled',
        content: noticeObj.content || '',
        forTeachers: Boolean(noticeObj.forTeachers),
        forStudents: Boolean(noticeObj.forStudents),
        publishDate: noticeObj.publishDate,
        expiryDate: noticeObj.expiryDate,
        createdAt: noticeObj.createdAt,
        updatedAt: noticeObj.updatedAt,
        adminName: (noticeObj.Admin && noticeObj.Admin.name) ? noticeObj.Admin.name : "System Admin",
        isActive: !noticeObj.expiryDate || new Date(noticeObj.expiryDate) > currentDate,
        isPublished: !noticeObj.publishDate || new Date(noticeObj.publishDate) <= currentDate
      };
    });

    // Log success
    if (finalResult.length > 0) {
      console.log("[Notice Fetch] Sample notice:", {
        id: finalResult[0].id,
        title: finalResult[0].title,
        adminName: finalResult[0].adminName,
        isActive: finalResult[0].isActive,
        isPublished: finalResult[0].isPublished
      });
    }

    res.json(finalResult);
  } catch (error) {
    console.error("[Notice Fetch] Error details:", {
      message: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
      sqlMessage: error.parent ? error.parent.sqlMessage : 'No SQL error'
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