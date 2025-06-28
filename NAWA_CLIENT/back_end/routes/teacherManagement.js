import express from "express";
import Teacher from "../models/Teacher.js";
import TeacherPayroll from "../models/TeacherPayroll.js";
import TeacherNotice from "../models/TeacherNotice.js";
import Admin from "../models/Admin.js";
import Routine from "../models/Routine.js";
import bcrypt from 'bcryptjs';
import { verifyAdmin, verifyToken, verifyTeacher } from "../middleware/auth.js";
import sequelize from "../config/database.js";
import { Op } from "sequelize";

const router = express.Router();

// Get all teachers (Admin access)
router.get("/teachers", verifyToken, async (req, res) => {
  try {
    if (!req.admin && !req.teacher) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    
    const teachers = await Teacher.findAll({
      attributes: { exclude: ['password'] },
      order: [['name', 'ASC']]
    });
    
    res.json(teachers);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get single teacher (Admin access or self)
router.get("/teachers/:id", verifyToken, async (req, res) => {
  try {
    // Check if admin or the teacher accessing their own record
    if (!req.admin && !(req.teacher && req.teacher.id === parseInt(req.params.id))) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    
    const teacher = await Teacher.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    
    res.json(teacher);
  } catch (error) {
    console.error("Error fetching teacher:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get teacher payroll (Admin or self)
router.get("/teachers/:id/payroll", verifyToken, async (req, res) => {
  try {
    // Check if admin or the teacher accessing their own record
    if (!req.admin && !(req.teacher && req.teacher.id === parseInt(req.params.id))) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    
    const teacherId = req.params.id;
    const year = req.query.year || new Date().getFullYear();
    
    // Find or create payroll record
    let [payroll, created] = await TeacherPayroll.findOrCreate({
      where: { teacherId, year },
      defaults: { teacherId, year }
    });
    
    res.json(payroll);
  } catch (error) {
    console.error("Error fetching payroll:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update teacher payroll (Admin only)
router.put("/teachers/:id/payroll", verifyAdmin, async (req, res) => {
  try {
    const { month, salary, allowance, remarks } = req.body;
    const teacherId = req.params.id;
    const year = req.body.year || new Date().getFullYear();
    
    // Validate inputs
    if (!month || !salary) {
      return res.status(400).json({ message: "Month and salary are required" });
    }
    
    // Find or create the payroll record
    let [payroll, created] = await TeacherPayroll.findOrCreate({
      where: { teacherId, year },
      defaults: { teacherId, year, records: {} }
    });
    
    // Update the specific month
    const records = payroll.records || {};
    
    records[month] = {
      salary: parseFloat(salary),
      allowance: parseFloat(allowance || 0),
      remarks: remarks || '',
      paymentDate: new Date(),
      status: 'paid'
    };
    
    // Save the updated record
    payroll.records = records;
    await payroll.save();
    
    // Notify the teacher
    await TeacherNotice.create({
      teacherId,
      title: "Salary Updated",
      message: `Your salary for ${month} has been updated.`,
      isRead: false
    });
    
    res.json({
      message: "Payroll updated successfully",
      payroll
    });
  } catch (error) {
    console.error("Error updating payroll:", error);
    res.status(500).json({ message: error.message });
  }
});

// Change teacher's password (Admin only)
router.put("/teachers/:id/change-password", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.trim() === "") {
      return res.status(400).json({ message: "New password cannot be empty" });
    }

    const teacher = await Teacher.findByPk(id);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    teacher.password = hashedPassword;
    await teacher.save();

    res.json({ message: "Teacher password updated successfully" });
  } catch (error) {
    console.error("Error changing teacher password:", error);
    res.status(500).json({ message: error.message });
  }
});

// Send alert/notice to admin (Teacher only)
router.post("/teacher-notice", verifyTeacher, async (req, res) => {
  try {
    const { title, message } = req.body;
    const teacherId = req.teacher.id;
    
    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required" });
    }
    
    // Get all admins
    const admins = await Admin.findAll();
    
    if (admins.length === 0) {
      return res.status(404).json({ message: "No admin found to send notice to" });
    }
    
    // Create teacher notice with adminId
    await Promise.all(admins.map(admin => {
      return TeacherNotice.create({
        teacherId,
        adminId: admin.id,
        title,
        message,
        isRead: false,
        forAdmin: true
      });
    }));
    
    res.json({ message: "Notice sent to administrators successfully" });
  } catch (error) {
    console.error("Error sending notice:", error);
    res.status(500).json({ message: error.message });
  }
});

// Delete teacher (Admin only)
router.delete("/teachers/:id", verifyAdmin, async (req, res) => {
  try {
    const teacherId = req.params.id;
    
    // Use transaction to ensure data integrity
    await sequelize.transaction(async (t) => {
      // First check if teacher exists
      const teacher = await Teacher.findByPk(teacherId, { transaction: t });
      
      if (!teacher) {
        throw new Error("Teacher not found");
      }
      
      // Delete payroll records
      await TeacherPayroll.destroy({
        where: { teacherId },
        transaction: t
      });
      
      // Delete notices
      await TeacherNotice.destroy({
        where: { teacherId },
        transaction: t
      });

      // Delete associated routines
      await Routine.destroy({
        where: { teacherId: teacherId }, // Ensure this matches the foreign key in Routine model
        transaction: t
      });
      console.log('Deleted associated routines for teacher ID:', teacherId); // Optional: for logging
      
      // Delete teacher
      await teacher.destroy({ transaction: t });
    });
    
    res.json({ message: "Teacher removed successfully" });
  } catch (error) {
    console.error("Error removing teacher:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router; 