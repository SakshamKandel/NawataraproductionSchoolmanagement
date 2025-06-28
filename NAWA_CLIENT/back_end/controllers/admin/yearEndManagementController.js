import Student from '../../models/Student.js';
import Admin from '../../models/Admin.js';
import Teacher from '../../models/Teacher.js';
import Notice from '../../models/Notice.js';
import AcademicYear from '../../models/AcademicYear.js';
// import other Sequelize models as needed
import bcrypt from 'bcryptjs';
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

// Get current academic year status
export const getAcademicYearStatus = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    let academicYear = await AcademicYear.findOne({ where: { year: currentYear } });
    
    if (!academicYear) {
      // Create new academic year if it doesn't exist
      academicYear = await AcademicYear.create({
        year: currentYear,
        startDate: new Date(currentYear, 0, 1), // January 1st
        endDate: new Date(currentYear, 11, 31), // December 31st
        status: 'active'
      });
    }
    
    res.status(200).json(academicYear);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get promotion status for a specific class
export const getClassPromotionStatus = async (req, res) => {
  try {
    const { class_name } = req.params;
    if (!class_name) {
      return res.status(400).json({ message: 'Class name is required' });
    }
    
    // Valid classes include pre-primary and primary classes
    const validClasses = ['Nursery', 'L.K.G.', 'U.K.G.', '1', '2', '3', '4', '5', '6'];
    if (!validClasses.includes(class_name)) {
      return res.status(400).json({ 
        message: `Invalid class name. Valid classes are: ${validClasses.join(', ')}` 
      });
    }
    
    const currentYear = new Date().getFullYear();
    
    // Get students in this class with better sorting
    const students = await Student.findAll({ where: { grade: class_name }, order: [['name', 'ASC']] });
    console.log(`Found ${students.length} students in class ${class_name}`);
    
    if (students.length === 0) {
      return res.status(200).json([]);
    }
    
    // Define next class progression
    const classProgression = {
      'Nursery': 'L.K.G.',
      'L.K.G.': 'U.K.G.',
      'U.K.G.': '1',
      '1': '2',
      '2': '3',
      '3': '4',
      '4': '5',
      '5': '6',
      '6': 'Graduate'
    };
    
    // Create a detailed promotion status for each student
    const promotionStatus = students.map(student => ({
      studentId: student.id,
      name: student.name || 'Unnamed Student',
      class: student.grade,
      nextClass: classProgression[student.grade] || 'Unknown',
      fatherName: student.fatherName || '',
      motherName: student.motherName || '',
      contactNumber: student.fatherPhone || student.motherPhone || '',
      email: student.email || ''
    }));
    
    res.status(200).json(promotionStatus);
  } catch (error) {
    console.error('Error getting promotion status:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get student history with search and pagination
export const getStudentHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { search, page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    // Build search query
    let query = {};
    
    // If studentId is provided, get history for specific student
    if (studentId) {
      query.studentId = studentId;
    } else {
      // Otherwise, apply search and status filters
      if (search) {
        query.$or = [
          { 'archivedData.name': { [Op.iLike]: `%${search}%` } },
          { 'archivedData.roll_number': { [Op.iLike]: `%${search}%` } }
        ];
      }
      if (status) {
        query.status = status;
      }
    }

    // Get total count for pagination
    const total = await StudentHistory.count({ where: query });

    // Get history records with populated student data
    const history = await StudentHistory.findAll({
      where: query,
      order: [['academicYear', 'DESC'], ['archivedData.name', 'ASC']],
      limit: parseInt(limit),
      offset: skip,
      include: [
        {
          model: Student,
          attributes: ['name', 'class_name', 'roll_number']
        }
      ]
    });

    // If getting single student history, return just the records
    if (studentId) {
      return res.status(200).json(history);
    }

    // Otherwise return paginated list with pagination info
    res.status(200).json({
      history,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Student history error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Promote students to next class
export const promoteStudents = async (req, res) => {
  try {
    const { class_name, academicYear, password } = req.body;
    
    // Get admin from the request (set by verifyAdmin middleware)
    const admin = await Admin.findByPk(req.user.user.id);
    if (!admin) {
      return res.status(401).json({ message: 'Admin not found' });
    }

    // Verify admin password using bcrypt
    if (!password || !await bcrypt.compare(password, admin.password)) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const currentClass = parseInt(class_name);
    const nextClass = currentClass + 1;
    const isGraduatingClass6 = currentClass === 6;
    let graduatedCount = 0;
    
    // Special handling for class 6 students (they graduate)
    if (isGraduatingClass6) {
      const existingClass6Students = await Student.findAll({ where: { grade: 6 } });
      graduatedCount = existingClass6Students.length;
      
      // If there are class 6 students to graduate
      if (existingClass6Students.length > 0) {
        // Create Excel file with graduated students
        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Class6Students');
        worksheet.columns = [
          { header: 'Name', key: 'name', width: 20 },
          { header: 'Class', key: 'class_name', width: 10 },
          { header: 'Father Name', key: 'father_name', width: 20 },
          { header: 'Father Phone', key: 'father_phone', width: 15 },
          { header: 'Mother Name', key: 'mother_name', width: 20 },
          { header: 'Mother Phone', key: 'mother_phone', width: 15 },
          { header: 'Address', key: 'address', width: 25 },
          { header: 'Email', key: 'email', width: 25 },
          { header: 'Student ID', key: '_id', width: 25 }
        ];
        
        existingClass6Students.forEach(student => {
          worksheet.addRow({
            name: student.name,
            class_name: student.grade,
            father_name: student.fatherName || '',
            father_phone: student.fatherPhone || '',
            mother_name: student.motherName || '',
            mother_phone: student.motherPhone || '',
            address: student.address || '',
            email: student.email || '',
            _id: student.id
          });
        });
        
        // Archive and remove all class 6 students
        const graduationPromises = existingClass6Students.map(async (student) => {
          const studentData = student.toJSON();
          const exists = await StudentHistory.findOne({ where: { studentId: student.id, academicYear } });
          if (!exists) {
            await StudentHistory.create({
              studentId: student.id,
              academicYear,
              class: 6,
              status: 'graduated',
              feeStatus: 'cleared',
              archivedData: {
                ...studentData,
                graduationYear: academicYear,
                lastClass: 6
              }
            });
          }
          await Student.destroy({ where: { id: student.id } });
        });
        
        await Promise.all(graduationPromises);
        
        // Update academic year status
        await AcademicYear.update(
          { 
            lastPromotionDate: new Date() },
          {
            where: { year: academicYear },
            include: [
              {
                model: StudentHistory,
                as: 'promotionHistory',
                attributes: ['promotedCount', 'totalCount', 'graduatedCount'],
                through: { attributes: [] }
              }
            ]
          }
        );
        
        // Return success message with graduate count
        return res.status(200).json({
          message: `Successfully graduated ${graduatedCount} students from Class 6`,
          promoted: 0,
          total: graduatedCount,
          graduated: graduatedCount
        });
      }
    }
    
    // Regular promotion for other classes
    // Get all students in the current class
    const students = await Student.findAll({ where: { grade: currentClass } });
    
    // Only update student class, do not create StudentHistory for promotions
    const promotionPromises = students.map(async (student) => {
      await Student.update(
        { grade: nextClass },
        { where: { id: student.id } }
      );
    });

    // Wait for all updates to complete
    await Promise.all(promotionPromises);
    
    // Update academic year status
    await AcademicYear.update(
      { 
        lastPromotionDate: new Date() },
      {
        where: { year: academicYear },
        include: [
          {
            model: StudentHistory,
            as: 'promotionHistory',
            attributes: ['promotedCount', 'totalCount', 'graduatedCount'],
            through: { attributes: [] }
          }
        ]
      }
    );
    
    res.status(200).json({
      message: `Successfully promoted ${students.length} students to Class ${nextClass}`,
      promoted: students.length,
      total: students.length,
      graduated: 0
    });
  } catch (error) {
    console.error('Promotion error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Clear teacher payroll records for the year
export const clearTeacherPayroll = async (req, res) => {
  try {
    const { academicYear, teacherIds, password } = req.body;
    // Get admin from the request (set by verifyAdmin middleware)
    const admin = await Admin.findByPk(req.user.user.id);
    if (!admin) {
      return res.status(401).json({ message: 'Admin not found' });
    }
    // Verify admin password using bcrypt
    if (!password || !await bcrypt.compare(password, admin.password)) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    // Delete payroll records
    let result;
    if (teacherIds && teacherIds.length > 0) {
      // Delete specific teachers' payroll
      result = await Teacher.destroy({ where: { id: { [Op.in]: teacherIds }, year: academicYear } });
    } else {
      // Delete all teachers' payroll for the year
      result = await Teacher.destroy({ where: { year: academicYear } });
    }
    // Ensure AcademicYear exists
    let academicYearDoc = await AcademicYear.findOne({ where: { year: academicYear } });
    if (!academicYearDoc) {
      academicYearDoc = await AcademicYear.create({
        year: academicYear,
        startDate: new Date(academicYear, 0, 1),
        endDate: new Date(academicYear, 11, 31),
        status: 'active'
      });
    }
    // Update academic year status with payroll clear date
    await AcademicYear.update(
      {
        lastPayrollClearDate: new Date() },
      {
        where: { year: academicYear },
        include: [
          {
            model: Teacher,
            as: 'payrollHistory',
            attributes: ['clearedCount', 'deletedCount'],
            through: { attributes: [] }
          }
        ]
      }
    );
    res.status(200).json({ message: 'Payroll records cleared successfully', deletedCount: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Archive student record
export const archiveStudent = async (req, res) => {
  try {
    const { studentId, remarks } = req.body;
    const currentYear = new Date().getFullYear();
    
    const student = await Student.findByPk(studentId);
    if (!student) {
      throw new Error('Student not found');
    }
    
    // Create history record
    await StudentHistory.create({
      studentId,
      academicYear: currentYear,
      class: student.grade,
      status: 'left',
      feeStatus: 'pending',
      remarks,
      archivedData: student.toJSON()
    });
    
    // Remove student from active records
    await Promise.all([
      Student.destroy({ where: { id: studentId } }),
    ]);
    
    res.status(200).json({ message: 'Student archived successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export all class 6 students as CSV
export const exportClass6Students = async (req, res) => {
  try {
    const students = await Student.findAll({ where: { grade: 6 } });
    console.log(`Found ${students.length} class 6 students for export`);
    
    // Prepare CSV header
    const header = [
      'Name', 'Class', 'Father Name', 'Father Phone', 'Mother Name', 'Mother Phone', 'Address', 'Email', 'Student ID'
    ];
    
    // Prepare CSV rows
    let rows = [];
    if (students.length > 0) {
      rows = students.map(s => [
        s.name,
        s.grade,
        s.fatherName || '',
        s.fatherPhone || '',
        s.motherName || '',
        s.motherPhone || '',
        s.address || '',
        s.email || '',
        s.id
      ]);
    } else {
      // Add a note row for empty data
      rows = [['No class 6 students found', '', '', '', '', '', '', '', '6', '']];
    }
    
    // Convert to CSV string
    const csv = [header, ...rows].map(r => r.map(x => `"${x}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="class6_students.csv"');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export all students (class 1 to 6) as Excel
export const exportAllStudentsExcel = async (req, res) => {
  try {
    // Get all students and sort by class and name
    const allStudents = await Student.findAll({ where: { grade: { [Op.between]: [1, 6] } }, order: [['grade', 'ASC'], ['name', 'ASC']] });
    console.log(`Found ${allStudents.length} total students for export`);
    
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    
    // Create a single worksheet with all students
    const allStudentsSheet = workbook.addWorksheet('All Students');
    allStudentsSheet.columns = [
      { header: 'S.No', key: 'serialNumber', width: 6, style: { alignment: { horizontal: 'center' } } },
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Class', key: 'class_name', width: 8, style: { alignment: { horizontal: 'center' } } },
      { header: 'Father Name', key: 'father_name', width: 20 },
      { header: 'Father Phone', key: 'father_phone', width: 15 },
      { header: 'Mother Name', key: 'mother_name', width: 20 },
      { header: 'Mother Phone', key: 'mother_phone', width: 15 },
      { header: 'Address', key: 'address', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Student ID', key: '_id', width: 25 }
    ];
    
    // Add all students to the single sheet with serial numbers
    if (allStudents.length > 0) {
      allStudents.forEach((student, index) => {
        allStudentsSheet.addRow({
          serialNumber: index + 1,
          name: student.name || 'Unnamed',
          class_name: student.grade,
          father_name: student.fatherName || '-',
          father_phone: student.fatherPhone || '-',
          mother_name: student.motherName || '-',
          mother_phone: student.motherPhone || '-',
          address: student.address || '-',
          email: student.email || '-',
          _id: student.id
        });
      });
    } else {
      // Add a note row if no students found
      allStudentsSheet.addRow({
        serialNumber: '-',
        name: 'No students found',
        class_name: '-',
        father_name: '-',
        father_phone: '-',
        mother_name: '-',
        mother_phone: '-',
        address: '-',
        email: '-',
        _id: '-'
      });
    }
    
    // Apply formatting to the header row
    const headerRow = allStudentsSheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
    
    // Apply alternate row coloring and borders to data rows
    allStudentsSheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header row
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          
          // Add alternate row coloring
          if (rowNumber % 2 === 0) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFAFAFA' }
            };
          }
        });
      }
    });
    
    // Set headers and send response
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=all_students.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Export all students of a given class as Excel (for batch promotion)
export const exportClassStudents = async (req, res) => {
  try {
    // Get class number from path parameter or query parameter
    let classNum = req.params.classNum;
    
    // Debug information to help diagnose route issues
    console.log("exportClassStudents called");
    console.log("req.params:", req.params);
    console.log("req.query:", req.query);
    console.log("req.path:", req.path);
    
    // Try query parameter if path parameter is not available
    if (!classNum && req.query.classNum) {
      classNum = req.query.classNum;
      console.log("Using query parameter for classNum:", classNum);
    }
    
    if (!classNum) {
      return res.status(400).json({ 
        message: 'Class number is required', 
        debug: { params: req.params, query: req.query, path: req.path } 
      });
    }
    
    // Parse to number and validate
    classNum = parseInt(classNum);
    
    if (isNaN(classNum) || classNum < 1 || classNum > 6) {
      return res.status(400).json({ 
        message: `Invalid class number: ${classNum}. Must be a number between 1 and 6`,
        debug: { 
          params: req.params,
          query: req.query,
          path: req.path,
          originalClassNum: req.params.classNum || req.query.classNum
        }
      });
    }
    
    console.log(`Processing export for class ${classNum}`);
    
    // Find students in the specified class
    const students = await Student.findAll({ where: { grade: classNum }, order: [['name', 'ASC']] });
    
    console.log(`Found ${students.length} students in class ${classNum}`);

    // Create Excel workbook
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Class${classNum}Students`);
    
    // Define columns
    worksheet.columns = [
      { header: 'S.No', key: 'serialNumber', width: 6, style: { alignment: { horizontal: 'center' } } },
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Class', key: 'class_name', width: 8, style: { alignment: { horizontal: 'center' } } },
      { header: 'Father Name', key: 'father_name', width: 20 },
      { header: 'Father Phone', key: 'father_phone', width: 15 },
      { header: 'Mother Name', key: 'mother_name', width: 20 },
      { header: 'Mother Phone', key: 'mother_phone', width: 15 },
      { header: 'Address', key: 'address', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Student ID', key: '_id', width: 25 }
    ];
    
    // Add student data if there are any students
    if (students.length > 0) {
      students.forEach((student, index) => {
        worksheet.addRow({
          serialNumber: index + 1,
          name: student.name || 'Unnamed',
          class_name: student.grade,
          father_name: student.fatherName || '-',
          father_phone: student.fatherPhone || '-',
          mother_name: student.motherName || '-',
          mother_phone: student.motherPhone || '-',
          address: student.address || '-',
          email: student.email || '-',
          _id: student.id
        });
      });
    } else {
      // Add a note in the Excel file that no students were found
      worksheet.addRow({
        serialNumber: '-',
        name: `No students found in Class ${classNum}`,
        class_name: classNum,
        father_name: '-',
        father_phone: '-',
        mother_name: '-',
        mother_phone: '-',
        address: '-',
        email: '-',
        _id: '-'
      });
      console.log(`No students found in class ${classNum}, returning empty Excel file`);
    }
    
    // Apply formatting to the header row
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
    
    // Apply alternate row coloring and borders to data rows
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header row
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          
          // Add alternate row coloring
          if (rowNumber % 2 === 0) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFAFAFA' }
            };
          }
        });
      }
    });
    
    // Set headers and send response
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=class${classNum}_students.xlsx`);
    
    console.log(`Sending Excel file for class ${classNum}`);
    
    // Write workbook to response
    await workbook.xlsx.write(res);
    res.end();
    
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};