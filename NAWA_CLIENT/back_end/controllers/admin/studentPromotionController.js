import Student from '../../models/Student.js';
import Admin from '../../models/Admin.js';
import bcrypt from 'bcryptjs';
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import sequelize from '../../config/database.js';

// Define the complete class progression
const CLASS_PROGRESSION = {
  'Nursery': 'L.K.G.',
  'L.K.G.': 'U.K.G.',
  'U.K.G.': '1',
  '1': '2',
  '2': '3',
  '3': '4',
  '4': '5',
  '5': '6',
  '6': 'GRADUATED'
};

const VALID_CLASSES = ['Nursery', 'L.K.G.', 'U.K.G.', '1', '2', '3', '4', '5', '6'];

// Get all classes and their student counts
export const getClassSummary = async (req, res) => {
  try {
    const classSummary = [];
    
    for (const className of VALID_CLASSES) {
      const studentCount = await Student.count({ where: { grade: className } });
      const nextClass = CLASS_PROGRESSION[className];
      
      classSummary.push({
        currentClass: className,
        nextClass: nextClass,
        studentCount: studentCount,
        canPromote: studentCount > 0
      });
    }
    
    res.status(200).json({
      success: true,
      data: classSummary
    });
  } catch (error) {
    console.error('Error getting class summary:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get class summary',
      error: error.message 
    });
  }
};

// Get students in a specific class for promotion preview
export const getClassStudentsForPromotion = async (req, res) => {
  try {
    const { className } = req.params;
    
    if (!VALID_CLASSES.includes(className)) {
      return res.status(400).json({
        success: false,
        message: `Invalid class name. Valid classes are: ${VALID_CLASSES.join(', ')}`
      });
    }
    
    const students = await Student.findAll({
      where: { grade: className },
      attributes: ['id', 'name', 'grade', 'fatherName', 'motherName', 'fatherPhone', 'motherPhone', 'email'],
      order: [['name', 'ASC']]
    });
    
    const nextClass = CLASS_PROGRESSION[className];
    
    const promotionData = students.map(student => ({
      id: student.id,
      name: student.name,
      currentClass: student.grade,
      nextClass: nextClass,
      fatherName: student.fatherName || '',
      motherName: student.motherName || '',
      contactNumber: student.fatherPhone || student.motherPhone || '',
      email: student.email || ''
    }));
    
    res.status(200).json({
      success: true,
      data: {
        currentClass: className,
        nextClass: nextClass,
        totalStudents: students.length,
        students: promotionData
      }
    });
  } catch (error) {
    console.error('Error getting class students for promotion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get class students',
      error: error.message
    });
  }
};

// Promote a single class
export const promoteSingleClass = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { className, password, academicYear } = req.body;
    
    // Verify admin
    const admin = await Admin.findByPk(req.admin.id);
    if (!admin) {
      await transaction.rollback();
      return res.status(401).json({
        success: false,
        message: 'Admin not found'
      });
    }
    
    // Verify password
    if (!password || !await bcrypt.compare(password, admin.password)) {
      await transaction.rollback();
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }
    
    // Validate class name
    if (!VALID_CLASSES.includes(className)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Invalid class name. Valid classes are: ${VALID_CLASSES.join(', ')}`
      });
    }
    
    // Get students in the class
    const students = await Student.findAll({
      where: { grade: className },
      transaction
    });
    
    if (students.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `No students found in class ${className}`
      });
    }
    
    const nextClass = CLASS_PROGRESSION[className];
    
    // Special handling for Class 6 (graduation)
    if (className === '6') {
      // Create graduated students folder if it doesn't exist
      const graduatedDir = path.join(process.cwd(), 'graduated_students');
      if (!fs.existsSync(graduatedDir)) {
        fs.mkdirSync(graduatedDir, { recursive: true });
      }
      
      // Create Excel file for graduated students
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(`Graduated_Class_6_${academicYear || new Date().getFullYear()}`);
      
      worksheet.columns = [
        { header: 'Student ID', key: 'id', width: 15 },
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Father Name', key: 'fatherName', width: 25 },
        { header: 'Father Phone', key: 'fatherPhone', width: 15 },
        { header: 'Mother Name', key: 'motherName', width: 25 },
        { header: 'Mother Phone', key: 'motherPhone', width: 15 },
        { header: 'Address', key: 'address', width: 30 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Graduation Year', key: 'graduationYear', width: 15 },
        { header: 'Graduation Date', key: 'graduationDate', width: 20 }
      ];
      
      const graduationDate = new Date().toISOString().split('T')[0];
      const currentYear = academicYear || new Date().getFullYear();
      
      students.forEach(student => {
        worksheet.addRow({
          id: student.id,
          name: student.name,
          fatherName: student.fatherName || '',
          fatherPhone: student.fatherPhone || '',
          motherName: student.motherName || '',
          motherPhone: student.motherPhone || '',
          address: student.address || '',
          email: student.email || '',
          graduationYear: currentYear,
          graduationDate: graduationDate
        });
      });
      
      // Save the Excel file
      const fileName = `Graduated_Class_6_${currentYear}_${Date.now()}.xlsx`;
      const filePath = path.join(graduatedDir, fileName);
      await workbook.xlsx.writeFile(filePath);
      
      // Delete the graduated students from the database
      await Student.destroy({
        where: { grade: className },
        transaction
      });
      
      await transaction.commit();
      
      return res.status(200).json({
        success: true,
        message: `Successfully graduated ${students.length} students from Class 6`,
        data: {
          graduatedCount: students.length,
          graduationFile: fileName,
          graduationPath: filePath
        }
      });
    } else {
      // Regular promotion to next class
      await Student.update(
        { grade: nextClass },
        { 
          where: { grade: className },
          transaction
        }
      );
      
      await transaction.commit();
      
      return res.status(200).json({
        success: true,
        message: `Successfully promoted ${students.length} students from ${className} to ${nextClass}`,
        data: {
          promotedCount: students.length,
          fromClass: className,
          toClass: nextClass
        }
      });
    }
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error promoting class:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to promote class',
      error: error.message
    });
  }
};

// Promote all classes at once
export const promoteAllClasses = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { password, academicYear } = req.body;
    
    // Verify admin
    const admin = await Admin.findByPk(req.admin.id);
    if (!admin) {
      await transaction.rollback();
      return res.status(401).json({
        success: false,
        message: 'Admin not found'
      });
    }
    
    // Verify password
    if (!password || !await bcrypt.compare(password, admin.password)) {
      await transaction.rollback();
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }
    
    const promotionResults = [];
    let totalPromoted = 0;
    let totalGraduated = 0;
    
    // Process Class 6 first (graduation)
    const class6Students = await Student.findAll({
      where: { grade: '6' },
      transaction
    });
    
    if (class6Students.length > 0) {
      // Create graduated students folder if it doesn't exist
      const graduatedDir = path.join(process.cwd(), 'graduated_students');
      if (!fs.existsSync(graduatedDir)) {
        fs.mkdirSync(graduatedDir, { recursive: true });
      }
      
      // Create Excel file for graduated students
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(`Graduated_Class_6_${academicYear || new Date().getFullYear()}`);
      
      worksheet.columns = [
        { header: 'Student ID', key: 'id', width: 15 },
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Father Name', key: 'fatherName', width: 25 },
        { header: 'Father Phone', key: 'fatherPhone', width: 15 },
        { header: 'Mother Name', key: 'motherName', width: 25 },
        { header: 'Mother Phone', key: 'motherPhone', width: 15 },
        { header: 'Address', key: 'address', width: 30 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Graduation Year', key: 'graduationYear', width: 15 },
        { header: 'Graduation Date', key: 'graduationDate', width: 20 }
      ];
      
      const graduationDate = new Date().toISOString().split('T')[0];
      const currentYear = academicYear || new Date().getFullYear();
      
      class6Students.forEach(student => {
        worksheet.addRow({
          id: student.id,
          name: student.name,
          fatherName: student.fatherName || '',
          fatherPhone: student.fatherPhone || '',
          motherName: student.motherName || '',
          motherPhone: student.motherPhone || '',
          address: student.address || '',
          email: student.email || '',
          graduationYear: currentYear,
          graduationDate: graduationDate
        });
      });
      
      // Save the Excel file
      const fileName = `Graduated_Class_6_All_Promotion_${currentYear}_${Date.now()}.xlsx`;
      const filePath = path.join(graduatedDir, fileName);
      await workbook.xlsx.writeFile(filePath);
      
      // Delete the graduated students
      await Student.destroy({
        where: { grade: '6' },
        transaction
      });
      
      totalGraduated = class6Students.length;
      promotionResults.push({
        fromClass: '6',
        toClass: 'GRADUATED',
        count: class6Students.length,
        graduationFile: fileName
      });
    }
    
    // Process other classes in reverse order (5 to Nursery) to avoid conflicts
    const classesToPromote = ['5', '4', '3', '2', '1', 'U.K.G.', 'L.K.G.', 'Nursery'];
    
    for (const className of classesToPromote) {
      const students = await Student.findAll({
        where: { grade: className },
        transaction
      });
      
      if (students.length > 0) {
        const nextClass = CLASS_PROGRESSION[className];
        
        await Student.update(
          { grade: nextClass },
          { 
            where: { grade: className },
            transaction
          }
        );
        
        totalPromoted += students.length;
        promotionResults.push({
          fromClass: className,
          toClass: nextClass,
          count: students.length
        });
      }
    }
    
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: `Successfully completed mass promotion. ${totalPromoted} students promoted, ${totalGraduated} students graduated.`,
      data: {
        totalPromoted,
        totalGraduated,
        promotionResults
      }
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error promoting all classes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to promote all classes',
      error: error.message
    });
  }
};

// Get list of graduated students files
export const getGraduatedStudentsFiles = async (req, res) => {
  try {
    const graduatedDir = path.join(process.cwd(), 'graduated_students');
    
    if (!fs.existsSync(graduatedDir)) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }
    
    const files = fs.readdirSync(graduatedDir)
      .filter(file => file.endsWith('.xlsx'))
      .map(file => {
        const filePath = path.join(graduatedDir, file);
        const stats = fs.statSync(filePath);
        return {
          fileName: file,
          filePath: filePath,
          size: stats.size,
          createdDate: stats.birthtime,
          modifiedDate: stats.mtime
        };
      })
      .sort((a, b) => b.createdDate - a.createdDate);
    
    res.status(200).json({
      success: true,
      data: files
    });
  } catch (error) {
    console.error('Error getting graduated students files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get graduated students files',
      error: error.message
    });
  }
};

// Download a graduated students file
export const downloadGraduatedStudentsFile = async (req, res) => {
  try {
    const { fileName } = req.params;
    const graduatedDir = path.join(process.cwd(), 'graduated_students');
    const filePath = path.join(graduatedDir, fileName);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    res.download(filePath, fileName);
  } catch (error) {
    console.error('Error downloading graduated students file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download file',
      error: error.message
    });
  }
};
