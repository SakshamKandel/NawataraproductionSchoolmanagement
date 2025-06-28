import express from "express";
import { verifyTeacher } from "../../middleware/auth.js";
import Student from "../../models/Student.js";
import { Op } from "sequelize";

const teacherStudentRouter = express.Router();

// Get basic student list for teachers (name and grade/class only)
teacherStudentRouter.get("/students", verifyTeacher, async (req, res) => {
  try {
    // Add filtering options
    const filters = {};
    
    if (req.query.grade) {
      filters.grade = req.query.grade;
    }
    
    // Add section filtering
    if (req.query.section) {
      filters.section = req.query.section;
    }
    
    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    // Teachers only see basic student information (name, grade/class, and section)
    const { count, rows: students } = await Student.findAndCountAll({
      where: filters,
      attributes: ['id', 'name', 'grade', 'section'], // Added section for teachers
      order: [['name', 'ASC']],
      limit,
      offset
    });
    
    res.json({
      students,
      totalCount: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      limit
    });
  } catch (error) {
    console.error("Error fetching students for teacher:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get basic student information by ID for teachers (no fee information)
teacherStudentRouter.get("/students/:id", verifyTeacher, async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      attributes: ['id', 'name', 'grade'] // Restricted attributes - only fields that exist
    });
    
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    res.json({ student });
  } catch (error) {
    console.error("Error fetching student for teacher:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get grade list for teachers (using grade instead of className since that's what exists)
teacherStudentRouter.get("/classes", verifyTeacher, async (req, res) => {
  try {
    const grades = await Student.findAll({
      attributes: ['grade'],
      group: ['grade'],
      order: [['grade', 'ASC']]
    });
    
    const gradeList = grades.map(g => g.grade).filter(Boolean);
    
    res.json({ classes: gradeList });
  } catch (error) {
    console.error("Error fetching grades for teacher:", error);
    res.status(500).json({ message: error.message });
  }
});

export default teacherStudentRouter;
