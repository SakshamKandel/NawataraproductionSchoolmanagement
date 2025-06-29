import express from "express";
import Student from "../../../models/Student.js";
import StudentFee from "../../../models/StudentFee.js";
import { verifyAdmin, verifyToken, verifyStudent, verifyRoles } from "../../../middleware/auth.js";
import { Op } from "sequelize";
import sequelize from "../../../config/database.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import PDFDocument from "pdfkit";

const router = express.Router();

// Configure multer for student document uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), "public/student_documents");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'student-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Only images, PDFs, and Word documents are allowed'));
  }
});

// Get all students (Admin and Teacher access with restrictions)
router.get("/students", verifyToken, async (req, res) => {
  try {
    if (!req.admin && !req.teacher) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    
    // Add filtering options
    const filters = {};
    
    if (req.query.className) {
      filters.className = req.query.className;
    }
    
    if (req.query.search) {
      filters[Op.or] = [
        { name: { [Op.like]: `%${req.query.search}%` } },
        { email: { [Op.like]: `%${req.query.search}%` } }
      ];
    }
    
    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    // Restrict attributes based on user role
    const attributes = req.admin 
      ? { exclude: ['password'] } 
      : ['id', 'name', 'grade', 'className']; // Teachers only see basic info
    
    const { count, rows: students } = await Student.findAndCountAll({
      where: filters,
      attributes,
      order: [['name', 'ASC']],
      limit,
      offset
    });
    
    res.json({
      students,
      pagination: {
        total: count,
        pages: Math.ceil(count / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get a single student with fee details (Admin access only for detailed view)
router.get("/students/:id", verifyToken, async (req, res) => {
  try {
    // Check permissions: Admin gets full access, teacher gets limited access, student gets own data
    if (!req.admin && !req.teacher && !(req.student && req.student.id === parseInt(req.params.id))) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    
    // Determine attributes based on user role
    let attributes;
    if (req.admin) {
      attributes = { exclude: ['password'] }; // Admin sees everything except password
    } else if (req.teacher) {
      attributes = ['id', 'name', 'grade', 'className']; // Teacher sees only basic info
    } else {
      attributes = { exclude: ['password'] }; // Student sees own full data
    }
    
    const student = await Student.findByPk(req.params.id, { attributes });
    
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    // Only admin and student themselves can see fee details
    let fees = null;
    if (req.admin || (req.student && req.student.id === parseInt(req.params.id))) {
      fees = await StudentFee.findOne({
        where: { studentID: req.params.id }
      });
    }
    
    // Get attendance data if requested (admin only)
    let attendance = null;
    if (req.query.attendance === 'true' && req.admin) {
      // Assuming you have an Attendance model
      // attendance = await Attendance.findAll({ where: { studentID: req.params.id }});
    }
    
    const responseData = { student };
    
    // Only include fees and attendance for authorized users
    if (fees !== null) {
      responseData.fees = fees || { records: {} };
    }
    if (attendance !== null) {
      responseData.attendance = attendance;
    }
    
    res.json(responseData);
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update student details (Admin access)
router.put("/students/:id", verifyAdmin, async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    const [updated] = await Student.update(req.body, {
      where: { id: req.params.id }
    });
    
    if (updated) {
      const updatedStudent = await Student.findByPk(req.params.id, {
        attributes: { exclude: ['password'] }
      });
      res.json(updatedStudent);
    } else {
      res.status(400).json({ message: "No changes were made" });
    }
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ message: error.message });
  }
});

// Upload student documents (Admin or the student)
router.post("/students/:id/documents", verifyToken, upload.single('document'), async (req, res) => {
  try {
    // Check if admin or the student themself
    if (!req.admin && !(req.student && req.student.id === parseInt(req.params.id))) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    const student = await Student.findByPk(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    // Here you would save the document info to the database
    // Assuming you have a StudentDocument model
    /*
    const document = await StudentDocument.create({
      studentID: req.params.id,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      filePath: req.file.path,
      documentType: req.body.documentType || 'other'
    });
    */
    
    res.status(201).json({
      message: "Document uploaded successfully",
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: `/student_documents/${req.file.filename}`
      }
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    res.status(500).json({ message: error.message });
  }
});

// Generate fee receipt as JSON (for PDF generation on frontend) - Admin only
router.get("/students/:id/fee-receipt", verifyAdmin, async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    // Get fee details
    const fee = await StudentFee.findOne({
      where: { studentID: req.params.id }
    });
    
    if (!fee) {
      return res.status(404).json({ message: "Fee record not found" });
    }
    
    // Get month from query params or use current month
    const month = req.query.month || Object.keys(fee.records)[0];
    
    // Format the receipt data
    const receiptData = {
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        class: student.className,
        address: student.address || ""
      },
      fee: {
        month: month,
        details: fee.records[month] || {},
        totalPaid: Object.values(fee.records[month] || {}).reduce((a, b) => a + b, 0)
      },
      school: {
        name: "Nawa tara Secondary School",
        address: "Bhaktapur, Nepal",
        contact: "+977-1-1234567"
      },
      receiptDate: new Date().toISOString(),
      receiptNumber: `FEE-${student.id}-${Date.now().toString().slice(-6)}`
    };
    
    // Option to generate PDF directly on server instead of JSON
    if (req.query.format === 'pdf') {
      // Create PDF document
      const doc = new PDFDocument();
      
      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=fee-receipt-${student.id}.pdf`);
      
      // Pipe the PDF to the response
      doc.pipe(res);
      
      // Add content to the PDF
      doc.fontSize(25).text('Nawa Tara Secondary School', {align: 'center'});
      doc.fontSize(15).text('Bhaktapur, Nepal', {align: 'center'});
      doc.moveDown();
      doc.fontSize(20).text('FEE RECEIPT', {align: 'center'});
      doc.moveDown();
      
      doc.fontSize(12).text(`Receipt #: ${receiptData.receiptNumber}`);
      doc.text(`Date: ${new Date().toLocaleDateString()}`);
      doc.moveDown();
      
      doc.text(`Student Name: ${student.name}`);
      doc.text(`Class: ${student.className}`);
      doc.text(`Student ID: ${student.id}`);
      doc.moveDown();
      
      doc.text(`Month: ${month.charAt(0).toUpperCase() + month.slice(1)}`);
      doc.moveDown();
      
      // Create a fee table
      const feeTable = Object.entries(fee.records[month] || {});
      if (feeTable.length > 0) {
        doc.text('Fee Details:', {underline: true});
        for (const [type, amount] of feeTable) {
          doc.text(`${type.charAt(0).toUpperCase() + type.slice(1)}: Rs. ${amount}`);
        }
      } else {
        doc.text('No fee details available for this month');
      }
      
      doc.moveDown();
      doc.text(`Total: Rs. ${receiptData.fee.totalPaid}`, {bold: true});
      
      doc.moveDown(2);
      doc.text('_______________________', {align: 'right'});
      doc.text('Authorized Signature', {align: 'right'});
      
      // Finalize the PDF
      doc.end();
    } else {
      // Return JSON data for frontend rendering
      res.json(receiptData);
    }
  } catch (error) {
    console.error("Error generating fee receipt:", error);
    res.status(500).json({ message: error.message });
  }
});

// Delete student (Admin access)
router.delete("/students/:id", verifyAdmin, async (req, res) => {
  try {
    // Use transaction to delete student and related records
    await sequelize.transaction(async (t) => {
      // Delete fee records first
      await StudentFee.destroy({
        where: { studentID: req.params.id },
        transaction: t
      });
      
      // Then delete the student
      const deleted = await Student.destroy({
        where: { id: req.params.id },
        transaction: t
      });
      
      if (!deleted) {
        throw new Error("Student not found");
      }
    });
    
    res.json({ message: "Student removed successfully" });
  } catch (error) {
    console.error("Error removing student:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router; 