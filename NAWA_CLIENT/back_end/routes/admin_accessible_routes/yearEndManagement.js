import express from 'express';
import {
  getAcademicYearStatus,
  getClassPromotionStatus,
  promoteStudents,
  clearTeacherPayroll,
  getStudentHistory,
  archiveStudent,
  exportClass6Students,
  exportAllStudentsExcel,
  exportClassStudents
} from '../../controllers/admin/yearEndManagementController.js';
import { verifyToken, verifyAdmin, verifySpecificAdmin } from '../../middleware/auth.js';
import Student from "../../models/Student.js";
import TeacherPayroll from "../../models/TeacherPayroll.js";
import sequelize from "../../config/database.js";
import bcrypt from "bcrypt";

const router = express.Router();

// Middleware to verify if the logged-in admin is the specific admin allowed to access these routes
// const verifySpecificAdmin = (req, res, next) => { // This is now moved to middleware/auth.js
//   // Ensure req.admin and req.admin.email exist
//   if (req.admin && req.admin.email && (req.admin.email === 'admin@gmail.com' || req.admin.email === 'developer@gmail.com')) {
//     next(); // Allowed
//   } else {
//     // Log the admin email if it exists, for debugging
//     if (req.admin && req.admin.email) {
//       console.log(`Access denied for ${req.admin.email} to Year End Management.`);
//     } else {
//       console.log('Access denied to Year End Management: req.admin or req.admin.email is missing.');
//     }
//     return res.status(403).json({ message: "You are not authorized to perform this action." });
//   }
// };

// TEMPORARY: Testing route without authentication for debugging
// Remove in production!
router.get('/test/export-class-for-promotion', (req, res, next) => {
  console.log("TEST ROUTE HIT - NO AUTH");
  console.log("Query params:", req.query);
  if (req.query.classNum) {
    req.params.classNum = req.query.classNum;
    next();
  } else {
    res.status(400).json({ message: 'Class number is required as query parameter' });
  }
}, exportClassStudents);

// All routes below require admin authentication
router.use(verifyToken);
router.use(verifyAdmin);
router.use(verifySpecificAdmin);

// Get current academic year status
router.get('/academic-year', getAcademicYearStatus);

// Get promotion status for a specific class
router.get('/promotion-status/:class_name', getClassPromotionStatus);

// Promote students to next class
router.post('/promote-students', promoteStudents);

// Clear teacher payroll records
router.post('/clear-payroll', clearTeacherPayroll);

// Get student history (list or single student)
router.get('/student-history', getStudentHistory); // List all history with filters
router.get('/student-history/:studentId', getStudentHistory); // Get single student history

// Archive student record
router.post('/archive-student', archiveStudent);

// Export all class 6 students as CSV
router.get('/export-class6', exportClass6Students);

// Export all students (class 1 to 6) as an Excel file
router.get('/export-all-students', exportAllStudentsExcel);

// NEW ROUTE: Export class students with query parameter (more reliable)
router.get('/export-class-for-promotion', (req, res, next) => {
  const classNum = parseInt(req.query.classNum);
  if (isNaN(classNum) || classNum < 1 || classNum > 6) {
    return res.status(400).json({ message: 'Invalid class number. Must be between 1 and 6.' });
  }
  
  console.log(`Export class ${classNum} students route hit (query parameter method)`);
  req.params.classNum = classNum;
  next();
}, exportClassStudents);

// Original routes kept for backward compatibility
// Export any class students as Excel for batch promotion (robust regex, no leading slash)
router.get(/export-class(\d+)-for-promotion/, (req, res, next) => {
  const match = req.path.match(/export-class(\d+)-for-promotion/);
  if (match) {
    req.params.classNum = match[1];
    console.log('Export class students route hit:', req.params.classNum);
  }
  next();
}, exportClassStudents);

// Individual class routes as fallback
router.get('/export-class1-for-promotion', (req, res, next) => {
  req.params.classNum = 1;
  console.log('Export class 1 students route hit (explicit)');
  next();
}, exportClassStudents);

router.get('/export-class2-for-promotion', (req, res, next) => {
  req.params.classNum = 2;
  console.log('Export class 2 students route hit (explicit)');
  next();
}, exportClassStudents);

router.get('/export-class3-for-promotion', (req, res, next) => {
  req.params.classNum = 3;
  console.log('Export class 3 students route hit (explicit)');
  next();
}, exportClassStudents);

router.get('/export-class4-for-promotion', (req, res, next) => {
  req.params.classNum = 4;
  console.log('Export class 4 students route hit (explicit)');
  next();
}, exportClassStudents);

router.get('/export-class5-for-promotion', (req, res, next) => {
  req.params.classNum = 5;
  console.log('Export class 5 students route hit (explicit)');
  next();
}, exportClassStudents);

router.get('/export-class6-for-promotion', (req, res, next) => {
  req.params.classNum = 6;
  console.log('Export class 6 students route hit (explicit)');
  next();
}, exportClassStudents);

// Verify admin with password confirmation
const confirmAdminPassword = async (req, res, next) => {
  try {
    const { adminPassword } = req.body;
    
    if (!adminPassword) {
      return res.status(400).json({ message: "Admin password confirmation required" });
    }
    
    // Verify the admin's password
    const admin = await req.admin;
    
    if (!admin) {
      return res.status(403).json({ message: "Not authorized as admin" });
    }
    
    const isMatch = await bcrypt.compare(adminPassword, admin.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: "Admin password confirmation failed" });
    }
    
    next();
  } catch (error) {
    console.error("Error confirming admin password:", error);
    res.status(500).json({ message: error.message });
  }
};

// Class promotions (mass update)
router.post("/promote-class", verifyAdmin, confirmAdminPassword, async (req, res) => {
  try {
    const { fromClass, toClass } = req.body;
    
    if (!fromClass || !toClass) {
      return res.status(400).json({ message: "Source and destination classes are required" });
    }
    
    // Begin transaction
    const result = await sequelize.transaction(async (t) => {
      // Find students in the source class
      const students = await Student.findAll({
        where: { className: fromClass },
        transaction: t
      });
      
      if (students.length === 0) {
        throw new Error(`No students found in class ${fromClass}`);
      }
      
      // Update all students
      const [updated] = await Student.update(
        { className: toClass },
        { 
          where: { className: fromClass },
          transaction: t
        }
      );
      
      return updated;
    });
    
    res.json({
      message: `Successfully promoted ${result} students from ${fromClass} to ${toClass}`,
      studentsPromoted: result
    });
  } catch (error) {
    console.error("Error promoting class:", error);
    res.status(500).json({ message: error.message });
  }
});

// Individual student promotion
router.post("/promote-student/:id", verifyAdmin, async (req, res) => {
  try {
    const { toClass } = req.body;
    const studentId = req.params.id;
    
    if (!toClass) {
      return res.status(400).json({ message: "Destination class is required" });
    }
    
    // Find the student
    const student = await Student.findByPk(studentId);
    
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    // Update the student
    student.className = toClass;
    await student.save();
    
    res.json({
      message: `Successfully promoted student ${student.name} to ${toClass}`,
      student: {
        id: student.id,
        name: student.name,
        previousClass: student.previousClass || student.className,
        currentClass: toClass
      }
    });
  } catch (error) {
    console.error("Error promoting student:", error);
    res.status(500).json({ message: error.message });
  }
});

// Clear teacher payrolls for a new year
router.post("/clear-payrolls", verifyAdmin, confirmAdminPassword, async (req, res) => {
  try {
    const { year } = req.body;
    
    if (!year) {
      return res.status(400).json({ message: "Year is required" });
    }
    
    // Archive the current year payrolls (optional)
    // For actual implementation, you might want to archive these records
    
    // Create fresh payroll records for the new year
    const result = await sequelize.transaction(async (t) => {
      // Get all teachers
      const teachers = await sequelize.query(
        "SELECT id FROM Teachers",
        { 
          type: sequelize.QueryTypes.SELECT,
          transaction: t
        }
      );
      
      // Clear existing payroll records for the specified year
      await TeacherPayroll.destroy({
        where: { year },
        transaction: t
      });
      
      // Create new empty payroll records
      for (const teacher of teachers) {
        await TeacherPayroll.create({
          teacherId: teacher.id,
          year,
          records: {
            january: { salary: 0, allowance: 0, remarks: '', status: 'pending' },
            february: { salary: 0, allowance: 0, remarks: '', status: 'pending' },
            march: { salary: 0, allowance: 0, remarks: '', status: 'pending' },
            april: { salary: 0, allowance: 0, remarks: '', status: 'pending' },
            may: { salary: 0, allowance: 0, remarks: '', status: 'pending' },
            june: { salary: 0, allowance: 0, remarks: '', status: 'pending' },
            july: { salary: 0, allowance: 0, remarks: '', status: 'pending' },
            august: { salary: 0, allowance: 0, remarks: '', status: 'pending' },
            september: { salary: 0, allowance: 0, remarks: '', status: 'pending' },
            october: { salary: 0, allowance: 0, remarks: '', status: 'pending' },
            november: { salary: 0, allowance: 0, remarks: '', status: 'pending' },
            december: { salary: 0, allowance: 0, remarks: '', status: 'pending' }
          }
        }, { transaction: t });
      }
      
      return teachers.length;
    });
    
    res.json({
      message: `Successfully cleared and initialized payroll records for ${result} teachers for year ${year}`,
      teachersProcessed: result
    });
  } catch (error) {
    console.error("Error clearing payrolls:", error);
    res.status(500).json({ message: error.message });
  }
});

// Generate Excel report with database information
router.get("/generate-report", verifyAdmin, async (req, res) => {
  try {
    // This would typically involve server-side Excel generation,
    // which is better done with libraries like exceljs or xlsx
    
    // For now, we'll return the JSON data that could be used for Excel generation on the client-side
    
    // Get counts and summary data
    const [results] = await sequelize.query(`
      SELECT 
        (SELECT COUNT(*) FROM Students) AS totalStudents,
        (SELECT COUNT(*) FROM Teachers) AS totalTeachers,
        (SELECT COUNT(*) FROM Admins) AS totalAdmins,
        (SELECT COUNT(*) FROM Notices) AS totalNotices
    `);
    
    // Get class-wise student counts
    const classStats = await sequelize.query(`
      SELECT className, COUNT(*) as studentCount 
      FROM Students 
      GROUP BY className 
      ORDER BY className
    `, { type: sequelize.QueryTypes.SELECT });
    
    res.json({
      summary: results[0],
      classCounts: classStats,
      reportGeneratedAt: new Date().toISOString(),
      reportType: "year-end-summary"
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router; 