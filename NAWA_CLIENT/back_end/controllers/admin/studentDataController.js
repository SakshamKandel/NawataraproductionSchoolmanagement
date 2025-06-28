import Student from '../../models/Student.js';
import XLSX from 'xlsx';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `import_${Date.now()}_${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
      file.mimetype === 'application/vnd.ms-excel') {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files are allowed'), false);
  }
};

export const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Export students data to Excel
export const exportStudents = async (req, res) => {
  try {
    console.log('Export students requested');
    console.log('Query params:', req.query);
    
    const { grade, section } = req.query;
    
    let whereClause = {};
    if (grade && grade !== 'all') {
      whereClause.grade = grade;
    }
    if (section && section !== 'all') {
      whereClause.section = section;
    }

    const students = await Student.findAll({
      where: whereClause,
      attributes: ['name', 'address', 'fatherName', 'motherName', 'fatherPhone', 'motherPhone', 'grade', 'section'],
      order: [['grade', 'ASC'], ['section', 'ASC'], ['name', 'ASC']]
    });

    if (students.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No students found for export' 
      });
    }    // Prepare data for Excel export
    const exportData = students.map(student => ({
      'Student Name': student.name,
      'Address': student.address,
      "Father's Name": student.fatherName,
      "Mother's Name": student.motherName,
      "Father's Phone": student.fatherPhone,
      "Mother's Phone": student.motherPhone,
      'Grade': student.grade,
      'Section': student.section || 'A'
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);    // Set column widths
    const columnWidths = [
      { wch: 20 }, // Student Name
      { wch: 30 }, // Address
      { wch: 20 }, // Father's Name
      { wch: 20 }, // Mother's Name
      { wch: 15 }, // Father's Phone
      { wch: 15 }, // Mother's Phone
      { wch: 10 }, // Grade
      { wch: 10 }  // Section
    ];
    worksheet['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');    // Generate filename
    const gradeText = grade && grade !== 'all' ? `_${grade}` : '_All';
    const sectionText = section && section !== 'all' ? `_${section}` : '';
    const filename = `Students_Export${gradeText}${sectionText}_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Write to buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length
    });

    res.send(buffer);

  } catch (error) {
    console.error('Export students error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to export students data',
      error: error.message 
    });
  }
};

// Import students data from Excel
export const importStudents = async (req, res) => {
  try {
    console.log('Import students requested');
    console.log('File:', req.file);
    console.log('Body:', req.body);
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }    const { grade, section } = req.body;
    if (!grade) {
      return res.status(400).json({ 
        success: false, 
        message: 'Grade is required for import' 
      });
    }

    // Read Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log('Excel data loaded:', jsonData.length, 'rows');
    console.log('First row headers:', jsonData.length > 0 ? Object.keys(jsonData[0]) : 'No data');
    console.log('Sample data:', jsonData.slice(0, 2));

    if (jsonData.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Excel file is empty or has no valid data' 
      });
    }    // Validate and process data
    const requiredColumns = ['Student Name'];
    const optionalColumns = ['Address', "Father's Name", "Mother's Name", "Father's Phone", "Mother's Phone", 'Grade', 'Section'];
    const errors = [];
    const validStudents = [];

    // Hash password once for all students
    const defaultPassword = await bcrypt.hash('student123', 10);

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNumber = i + 2; // Excel row number (accounting for header)
      const student = {};
      
      // Check required columns
      let hasError = false;
      for (const column of requiredColumns) {
        if (!row[column] || String(row[column]).trim() === '') {
          errors.push(`Row ${rowNumber}: Missing or empty ${column}`);
          hasError = true;
        }
      }

      if (hasError) continue;

      // Validate phone numbers (only if provided)
      const fatherPhone = row["Father's Phone"] ? String(row["Father's Phone"]).trim() : '';
      const motherPhone = row["Mother's Phone"] ? String(row["Mother's Phone"]).trim() : '';
      
      if (fatherPhone && !/^\d{10}$/.test(fatherPhone)) {
        errors.push(`Row ${rowNumber}: Father's phone must be exactly 10 digits (or leave empty)`);
        continue;
      }
      
      if (motherPhone && !/^\d{10}$/.test(motherPhone)) {
        errors.push(`Row ${rowNumber}: Mother's phone must be exactly 10 digits (or leave empty)`);
        continue;
      }      // Generate email and use pre-hashed password
      const studentName = String(row['Student Name']).trim();
      const studentSection = row['Section'] ? String(row['Section']).trim() : (section || 'A');
      const studentGrade = row['Grade'] ? String(row['Grade']).trim() : grade;
      const email = `${studentName.toLowerCase().replace(/\s+/g, '.')}@school.edu`;

      student.name = studentName;
      student.address = row['Address'] ? String(row['Address']).trim() : '';
      student.fatherName = row["Father's Name"] ? String(row["Father's Name"]).trim() : '';
      student.motherName = row["Mother's Name"] ? String(row["Mother's Name"]).trim() : '';
      student.fatherPhone = fatherPhone || '';
      student.motherPhone = motherPhone || '';
      student.grade = studentGrade;
      student.section = studentSection;
      student.email = email;
      student.password = defaultPassword;

      validStudents.push(student);
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    if (validStudents.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No valid student data found',
        errors: errors 
      });
    }

    // Import valid students
    try {
      console.log(`Attempting to import ${validStudents.length} students`);
      
      const createdStudents = await Student.bulkCreate(validStudents, {
        validate: true,
        ignoreDuplicates: false
      });

      console.log(`Successfully created ${createdStudents.length} students`);

      res.json({
        success: true,
        message: `Successfully imported ${createdStudents.length} students`,
        imported: createdStudents.length,
        errors: errors.length > 0 ? errors : null
      });

    } catch (bulkError) {
      console.error('Bulk create error:', bulkError);
      
      if (bulkError.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'Some students already exist (duplicate email addresses)',
          errors: ['Duplicate email addresses found. Please check the data and try again.']
        });
      }
      
      if (bulkError.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error in student data',
          errors: bulkError.errors.map(err => err.message)
        });
      }
      
      throw bulkError;
    }

  } catch (error) {
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error('Import students error:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to import students data',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get available sections for a grade
export const getAvailableSections = async (req, res) => {
  try {
    const { grade } = req.query;
    
    let whereClause = {};
    if (grade && grade !== 'all') {
      whereClause.grade = grade;
    }

    const sections = await Student.findAll({
      where: whereClause,
      attributes: ['section'],
      group: ['section'],
      order: [['section', 'ASC']]
    });

    const sectionList = sections.map(s => s.section).filter(Boolean);
    
    res.json({
      success: true,
      sections: sectionList
    });

  } catch (error) {    console.error('Get sections error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get sections',
      error: error.message 
    });
  }
};

// Get import template
export const getImportTemplate = async (req, res) => {
  try {
    console.log('Template download requested');
    
    // Create empty template with just headers (matching export format)
    const templateData = [
      {
        'Student Name': '',
        'Address': '',
        "Father's Name": '',
        "Mother's Name": '',
        "Father's Phone": '',
        "Mother's Phone": '',
        'Grade': '',
        'Section': ''
      }
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Set column widths
    const columnWidths = [
      { wch: 20 }, // Student Name
      { wch: 30 }, // Address
      { wch: 20 }, // Father's Name
      { wch: 20 }, // Mother's Name
      { wch: 15 }, // Father's Phone
      { wch: 15 }, // Mother's Phone
      { wch: 10 }, // Grade
      { wch: 10 }  // Section
    ];
    worksheet['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

    const filename = 'Student_Import_Template.xlsx';
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length
    });

    res.send(buffer);

  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate template',
      error: error.message 
    });
  }
};
