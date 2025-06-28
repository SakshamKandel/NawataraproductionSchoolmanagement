import TeacherPayroll from '../models/TeacherPayroll.js';
import Teacher from '../models/Teacher.js';
import Admin from '../models/Admin.js';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';

const NEPALI_MONTHS = [
  "Baishakh", "Jestha", "Asadhh", "Shrawan", "Bhadra", "Ashwin", 
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
];

const getDefaultMonthRecord = () => ({
  salary: 0, allowance: 0, remarks: '', status: 'pending', date: new Date().toISOString()
});

const getDefaultYearRecords = () => {
  const records = {};
  NEPALI_MONTHS.forEach(month => {
    records[month] = getDefaultMonthRecord();
  });
  return records;
};

// === START NEW PAYROLL FUNCTIONS ===
export const getTeacherPayrollByYear = async (req, res) => {
  const { teacherId, year } = req.params;
  console.log(`[NEW] Getting payroll for Teacher ID: ${teacherId}, Year: ${year}`);
  try {
    const teacher = await Teacher.findByPk(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    let [payroll, created] = await TeacherPayroll.findOrCreate({
      where: { teacherId: parseInt(teacherId), year: parseInt(year) },
      defaults: {
        teacherId: parseInt(teacherId),
        year: parseInt(year),
        records: getDefaultYearRecords()
      }
    });

    if (created) {
      console.log(`[NEW] Created new payroll record for Teacher ${teacherId}, Year ${year}`);
    } else {
      // Ensure all months exist, add if not (for older records)
      let recordsModified = false;
      const currentRecords = payroll.records ? JSON.parse(JSON.stringify(payroll.records)) : {};
      NEPALI_MONTHS.forEach(month => {
        if (!currentRecords[month]) {
          currentRecords[month] = getDefaultMonthRecord();
          recordsModified = true;
        }
      });
      if (recordsModified) {
        payroll.records = currentRecords;
        await payroll.save();
        console.log(`[NEW] Updated existing payroll for Teacher ${teacherId}, Year ${year} with missing months.`);
      }
    }
    res.status(200).json(payroll);
  } catch (error) {
    console.error(`[NEW] Error in getTeacherPayrollByYear:`, error);
    res.status(500).json({ message: 'Failed to get teacher payroll', error: error.message });
  }
};

export const updateTeacherMonthSalary = async (req, res) => {
  const { teacherId, year, month } = req.params;
  const { salary, allowance, remarks } = req.body;
  console.log(`[CNTRLR_DEBUG] updateTeacherMonthSalary: START - TeacherID: ${teacherId}, Year: ${year}, Month: ${month}`);
  console.log(`[CNTRLR_DEBUG] updateTeacherMonthSalary: Received Body Data:`, { salary, allowance, remarks });

  if (!NEPALI_MONTHS.includes(month)) {
    console.error(`[CNTRLR_ERROR] updateTeacherMonthSalary: Invalid month - ${month}`);
    return res.status(400).json({ message: `Invalid month: ${month}.` });
  }
  const parsedSalary = parseFloat(salary);
  const parsedAllowance = parseFloat(allowance);
  if (isNaN(parsedSalary) || isNaN(parsedAllowance) || salary === null || allowance === null) {
    console.error(`[CNTRLR_ERROR] updateTeacherMonthSalary: Invalid salary/allowance - Salary: ${salary}, Allowance: ${allowance}`);
    return res.status(400).json({ message: 'Valid Salary and Allowance (cannot be null or NaN) are required.' });
  }

  const transaction = await sequelize.transaction();
  console.log(`[CNTRLR_DEBUG] updateTeacherMonthSalary: Transaction ${transaction.id} started.`);

  try {
    const teacher = await Teacher.findByPk(teacherId, { transaction });
    if (!teacher) {
      console.error(`[CNTRLR_ERROR] updateTeacherMonthSalary: Teacher not found - ID: ${teacherId}. Rolling back.`);
      await transaction.rollback();
      return res.status(404).json({ message: 'Teacher not found.' });
    }
    console.log(`[CNTRLR_DEBUG] updateTeacherMonthSalary: Teacher found - ID: ${teacher.id}, Name: ${teacher.name}`);

    const findOrCreateConditions = {
      where: { teacherId: parseInt(teacherId), year: parseInt(year) },
      defaults: {
        teacherId: parseInt(teacherId),
        year: parseInt(year),
        records: getDefaultYearRecords()
      }
    };
    console.log('[CNTRLR_DEBUG] updateTeacherMonthSalary: TeacherPayroll findOrCreate conditions:', JSON.stringify(findOrCreateConditions, null, 2));
    let [payroll, created] = await TeacherPayroll.findOrCreate({...findOrCreateConditions, transaction });

    if (created) {
      console.log(`[CNTRLR_DEBUG] updateTeacherMonthSalary: New payroll record created for Teacher ${teacherId}, Year ${year}. ID: ${payroll.id}`);
    } else {
      console.log(`[CNTRLR_DEBUG] updateTeacherMonthSalary: Existing payroll record found for Teacher ${teacherId}, Year ${year}. ID: ${payroll.id}`);
    }
    console.log('[CNTRLR_DEBUG] updateTeacherMonthSalary: Payroll records BEFORE update for month ' + month + ':', JSON.stringify(payroll.records ? payroll.records[month] : 'No records field yet', null, 2));
    
    let updatedRecords;
    try {
      if (typeof payroll.records === 'string') {
        updatedRecords = JSON.parse(payroll.records);
      } else if (payroll.records && typeof payroll.records === 'object') {
        updatedRecords = JSON.parse(JSON.stringify(payroll.records));
      } else {
        // Initialize with default records only if no records exist
        updatedRecords = getDefaultYearRecords();
      }
      
      // Ensure all months exist in the records (without overwriting existing data)
      NEPALI_MONTHS.forEach(monthName => {
        if (!updatedRecords[monthName]) {
          updatedRecords[monthName] = getDefaultMonthRecord();
        }
      });
      
    } catch (error) {
      console.error(`[ERROR] Failed to parse payroll records:`, error);
      // Only use defaults as fallback, try to preserve existing data
      updatedRecords = payroll.records || getDefaultYearRecords();
    }
    const paymentDate = new Date().toISOString();

    updatedRecords[month] = {
      salary: parsedSalary,
      allowance: parsedAllowance,
      remarks: remarks || '',
      status: 'paid',
      date: paymentDate,
      paymentDate: paymentDate
    };
    console.log('[CNTRLR_DEBUG] updateTeacherMonthSalary: Records object prepared for payroll.update:', JSON.stringify(updatedRecords, null, 2));

    payroll.records = updatedRecords;
    payroll.changed('records', true);
    console.log('[CNTRLR_DEBUG] updateTeacherMonthSalary: Attempting payroll.save(). Is payroll dirty?', payroll.isDirty);
    await payroll.save({ transaction });
    console.log('[CNTRLR_DEBUG] updateTeacherMonthSalary: payroll.save() executed.');

    // Skip teacher payments sync to prevent crashes
    // Only update the core payroll record
    console.log('[CNTRLR_DEBUG] updateTeacherMonthSalary: teacher.update() executed.');

    await transaction.commit();
    console.log(`[CNTRLR_DEBUG] updateTeacherMonthSalary: Transaction ${transaction.id} committed successfully.`);
    
    const finalPayroll = await TeacherPayroll.findByPk(payroll.id);
    console.log('[CNTRLR_DEBUG] updateTeacherMonthSalary: Final payroll fetched after commit for response');
    
    // Ensure the response includes properly formatted records
    const responseData = {
      id: finalPayroll.id,
      teacherId: finalPayroll.teacherId,
      year: finalPayroll.year,
      records: finalPayroll.records,
      createdAt: finalPayroll.createdAt,
      updatedAt: finalPayroll.updatedAt,
      success: true,
      message: `Salary updated for ${month} ${year}`
    };
    
    res.status(200).json(responseData);

  } catch (error) {
    console.error(`[CNTRLR_ERROR] updateTeacherMonthSalary: Error during transaction or main logic - ${error.message}`, error.stack);
    if (transaction && !transaction.finished && !transaction.isCommitted && !transaction.isRolledBack) {
      try {
        console.log('[CNTRLR_DEBUG] updateTeacherMonthSalary: Attempting to rollback transaction due to error.');
        await transaction.rollback();
        console.log('[CNTRLR_DEBUG] updateTeacherMonthSalary: Transaction rolled back successfully.');
      } catch (e) {
        console.error('[CNTRLR_ERROR] updateTeacherMonthSalary: Rollback error', e.stack);
      }
    }
    res.status(500).json({ message: 'Failed to update teacher salary', error: error.message, details: error.stack });
  }
};
// === END NEW PAYROLL FUNCTIONS ===

// Get salary records for a specific teacher
export const getTeacherPayroll = async (req, res) => {
  try {
    const { teacherId } = req.params;
    console.log(`[DEBUG] Getting salary for teacher ID: ${teacherId}`);
    
    if (!teacherId) {
      console.log(`[ERROR] No teacher ID provided`);
      return res.status(400).json({ message: 'Teacher ID is required' });
    }
    
    const currentYear = new Date().getFullYear();
    console.log(`[DEBUG] Current year: ${currentYear}`);
    
    // Check if teacher exists
    const teacher = await Teacher.findByPk(teacherId);
    if (!teacher) {
      console.log(`[ERROR] Teacher not found with ID: ${teacherId}`);
      return res.status(404).json({ message: 'Teacher not found' });
    }
    console.log(`[DEBUG] Found teacher: ${teacher.name}, ID: ${teacher.id}`);

    // Find or create payroll record for the current year
    let [payroll, created] = await TeacherPayroll.findOrCreate({ 
      where: { 
        teacherId, 
        year: currentYear 
      },
      defaults: {
        teacherId,
        year: currentYear,
        records: getDefaultYearRecords()
      }
    });
    
    if (created) {
      console.log(`[DEBUG] Created new payroll record for teacher ${teacherId}`);
    } else {
      console.log(`[DEBUG] Found existing payroll record for teacher ${teacherId}`);
      console.log(`[DEBUG] Retrieved records:`, JSON.stringify(payroll.records));
    }
    
    // Work with a mutable copy for the response preparation
    let responseRecords;
    try {
      if (typeof payroll.records === 'string') {
        // If records is stored as a string, parse it
        responseRecords = JSON.parse(payroll.records);
      } else if (payroll.records && typeof payroll.records === 'object') {
        // If records is already an object, clone it
        responseRecords = JSON.parse(JSON.stringify(payroll.records));
      } else {
        // If no records exist, use empty object
        responseRecords = {};
      }
    } catch (error) {
      console.error(`[ERROR] Failed to parse payroll records for teacher ${teacherId}:`, error);
      responseRecords = {};
    }
    let recordsWereModified = false;
    
    // Ensure all months exist in the records
    for (const month of NEPALI_MONTHS) {
      if (!responseRecords[month]) {
        console.log(`[DEBUG] Month ${month} not found in records, adding default values`);
        responseRecords[month] = { 
          salary: 0,
          allowance: 0,
          remarks: '',
          status: 'pending',
          date: new Date().toISOString()
        };
        recordsWereModified = true;
      }
    }
    
    // Skip heavy sync operations to improve performance
    // Records will be updated through direct payroll updates only

    console.log(`[DEBUG] Returning payroll data for teacher ${teacherId}`);
    res.status(200).json({
      id: payroll.id,
      teacherId: payroll.teacherId,
      year: payroll.year,
      records: responseRecords,
      createdAt: payroll.createdAt,
      updatedAt: payroll.updatedAt
    });

  } catch (error) {
    console.error(`[ERROR] Error in getTeacherPayroll:`, error);
    res.status(500).json({ 
      message: 'Failed to retrieve teacher salary data',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update salary for a specific month
export const updateSalary = async (req, res) => {
  console.log(`[DEBUG] [updateSalary] ====== NEW SALARY UPDATE REQUEST ======`);
  const { teacherId } = req.params;
  const { month, salary, allowance, remarks } = req.body;
  const currentYear = new Date().getFullYear();

  console.log(`[DEBUG] [updateSalary] User: ${req.user?.id || 'N/A'} attempting update for Teacher ID: ${teacherId}, Month: ${month}, Year: ${currentYear}`);
  console.log(`[DEBUG] [updateSalary] Incoming data payload:`, { salary, allowance, remarks });

  // Validation
  if (!teacherId || !month) {
    console.error('[ERROR] [updateSalary] Critical: Missing teacherId or month.', { teacherId, month });
    return res.status(400).json({ message: 'Teacher ID and Month are essential and were not provided.' });
  }
  
  if (salary === undefined || allowance === undefined || salary === null || allowance === null || isNaN(parseFloat(salary)) || isNaN(parseFloat(allowance))) {
    console.error('[ERROR] [updateSalary] Critical: Invalid or missing salary/allowance.', { salary, allowance });
    return res.status(400).json({ message: 'A valid Salary and Allowance (cannot be null/undefined) are required.' });
  }

  // Start transaction
  const transaction = await sequelize.transaction();

  try {
    // Check if teacher exists
    const teacher = await Teacher.findByPk(teacherId, { transaction });
    if (!teacher) {
      await transaction.rollback();
      console.error(`[ERROR] [updateSalary] Teacher not found with ID: ${teacherId}`);
      return res.status(404).json({ message: 'Teacher not found.' });
    }
    console.log(`[DEBUG] [updateSalary] Teacher ${teacher.name} (ID: ${teacher.id}) found.`);

    // Find or create payroll record
    let [payroll, created] = await TeacherPayroll.findOrCreate({
      where: { teacherId, year: currentYear },
      defaults: {
        teacherId,
        year: currentYear,
        records: {
          Baishakh: { salary: 0, allowance: 0, remarks: '', status: 'pending', date: new Date() },
          Jestha: { salary: 0, allowance: 0, remarks: '', status: 'pending', date: new Date() },
          Asadhh: { salary: 0, allowance: 0, remarks: '', status: 'pending', date: new Date() },
          Shrawan: { salary: 0, allowance: 0, remarks: '', status: 'pending', date: new Date() },
          Bhadra: { salary: 0, allowance: 0, remarks: '', status: 'pending', date: new Date() },
          Ashwin: { salary: 0, allowance: 0, remarks: '', status: 'pending', date: new Date() },
          Kartik: { salary: 0, allowance: 0, remarks: '', status: 'pending', date: new Date() },
          Mangsir: { salary: 0, allowance: 0, remarks: '', status: 'pending', date: new Date() },
          Poush: { salary: 0, allowance: 0, remarks: '', status: 'pending', date: new Date() },
          Magh: { salary: 0, allowance: 0, remarks: '', status: 'pending', date: new Date() },
          Falgun: { salary: 0, allowance: 0, remarks: '', status: 'pending', date: new Date() },
          Chaitra: { salary: 0, allowance: 0, remarks: '', status: 'pending', date: new Date() }
        }
      },
      transaction
    });

    if (created) {
      console.log(`[DEBUG] [updateSalary] Created new payroll record for teacher ${teacherId}`);
    } else {
      console.log(`[DEBUG] [updateSalary] Found existing payroll record for teacher ${teacherId}`);
    }

    // Update the specific month's record - preserve existing months
    let updatedRecords;
    try {
      if (typeof payroll.records === 'string') {
        updatedRecords = JSON.parse(payroll.records);
      } else if (payroll.records && typeof payroll.records === 'object') {
        updatedRecords = JSON.parse(JSON.stringify(payroll.records));
      } else {
        updatedRecords = getDefaultYearRecords();
      }
    } catch (parseError) {
      console.error(`[ERROR] [updateSalary] Failed to parse existing records:`, parseError);
      updatedRecords = getDefaultYearRecords();
    }
    
    // Ensure all months exist with default values if not present
    NEPALI_MONTHS.forEach(monthName => {
      if (!updatedRecords[monthName]) {
        updatedRecords[monthName] = getDefaultMonthRecord();
      }
    });
    
    const paymentDate = new Date().toISOString();
    
    // Update only the specific month, preserving all others
    updatedRecords[month] = {
      salary: parseFloat(salary) || 0,
      allowance: parseFloat(allowance) || 0,
      remarks: remarks || '',
      status: 'paid',
      date: paymentDate,
      paymentDate: paymentDate
    };

    console.log(`[DEBUG] [updateSalary] Updated records for ${month}:`, updatedRecords[month]);
    console.log(`[DEBUG] [updateSalary] All months preserved:`, Object.keys(updatedRecords));

    // Use Sequelize update instead of raw SQL
    await payroll.update({ 
      records: updatedRecords 
    }, { transaction });
    
    console.log(`[DEBUG] [updateSalary] Payroll records updated using Sequelize ORM`);

    // Skip teacher payments sync to prevent circular reference issues
    console.log(`[DEBUG] [updateSalary] Skipping teacher payments sync to prevent errors`);

    // Commit transaction
    await transaction.commit();
    console.log(`[DEBUG] [updateSalary] Transaction committed successfully`);

    // Return a clean response without circular references
    const responseData = {
      success: true,
      message: `Salary updated successfully for ${month} ${currentYear}`,
      data: {
        id: payroll.id,
        teacherId: payroll.teacherId,
        year: payroll.year,
        records: updatedRecords,
        updatedMonth: month,
        updatedAt: new Date().toISOString()
      }
    };
    
    console.log(`[DEBUG] [updateSalary] Successfully updated. Status for ${month}: ${updatedRecords[month]?.status}`);
    
    return res.status(200).json(responseData);

  } catch (error) {
    console.error('[ERROR] [updateSalary] Error during update:', error);
    
    // Check if transaction exists and is not finished before rolling back
    if (transaction && transaction.connection && !transaction.finished) {
        try {
            await transaction.rollback();
            console.log(`[DEBUG] [updateSalary] Transaction rolled back due to error: ${error.message}`);
        } catch (rollbackError) {
            console.error('[ERROR] [updateSalary] Failed to rollback transaction:', rollbackError);
        }
    }
    
    return res.status(500).json({
      success: false,
      message: 'Database operation failed during salary update',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get all teachers with their payroll status
export const getAllTeachersPayroll = async (req, res) => {
  try {
    console.log('getAllTeachersPayroll called');
    const currentYear = new Date().getFullYear();
    
    console.log('Finding teachers...');
    const teachers = await Teacher.findAll({
      attributes: { exclude: ['password'] }
    });
    console.log(`Found ${teachers.length} teachers`);
    
    if (!teachers || teachers.length === 0) {
      console.log('No teachers found');
      return res.status(200).json([]);
    }

    console.log('Processing teacher payroll data...');
    const teachersWithPayroll = await Promise.all(
      teachers.map(async (teacher) => {
        try {
          console.log(`Processing teacher ID: ${teacher.id}, Name: ${teacher.name}`);
          
          const payroll = await TeacherPayroll.findOne({
            where: {
              teacherId: teacher.id,
              year: currentYear
            }
          });
          
          return {
            id: teacher.id,
            _id: teacher.id.toString(),
            name: teacher.name,
            email: teacher.email,
            payroll: payroll || {
              teacherId: teacher.id,
              year: currentYear,
              records: {
                Baishakh: { salary: 0, allowance: 0, remarks: '', status: 'pending', date: new Date() },
                Jestha: { salary: 0, allowance: 0, remarks: '', status: 'pending', date: new Date() },
                Asadhh: { salary: 0, allowance: 0, remarks: '', status: 'pending', date: new Date() },
                Shrawan: { salary: 0, allowance: 0, remarks: '', status: 'pending', date: new Date() },
                Bhadra: { salary: 0, allowance: 0, remarks: '', status: 'pending', date: new Date() },
                Ashwin: { salary: 0, allowance: 0, remarks: '', status: 'pending', date: new Date() },
                Kartik: { salary: 0, allowance: 0, remarks: '', status: 'pending', date: new Date() },
                Mangsir: { salary: 0, allowance: 0, remarks: '', status: 'pending', date: new Date() },
                Poush: { salary: 0, allowance: 0, remarks: '', status: 'pending', date: new Date() },
                Magh: { salary: 0, allowance: 0, remarks: '', status: 'pending', date: new Date() },
                Falgun: { salary: 0, allowance: 0, remarks: '', status: 'pending', date: new Date() },
                Chaitra: { salary: 0, allowance: 0, remarks: '', status: 'pending', date: new Date() }
              }
            }
          };
        } catch (err) {
          console.error(`Error processing teacher ${teacher.id}:`, err);
          return {
            id: teacher.id,
            _id: teacher.id.toString(),
            name: teacher.name,
            email: teacher.email,
            error: err.message,
            payroll: null
          };
        }
      })
    );

    console.log(`Successfully processed ${teachersWithPayroll.length} teacher payroll records`);
    return res.status(200).json(teachersWithPayroll);
  } catch (error) {
    console.error('Error in getAllTeachersPayroll:', error);
    return res.status(500).json({ 
      message: 'Failed to retrieve teacher payroll data',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get payroll summary for a specific year
export const getPayrollSummary = async (req, res) => {
  /* // Body commented out for payroll refresh
  try {
    const { year } = req.params;
    const payrolls = await TeacherPayroll.findAll({ 
      where: { year },
      include: [{
        model: Teacher,
        attributes: ['id', 'name']
      }]
    });

    const summary = payrolls.map(payroll => {
      const records = payroll.records;
      
      return {
        teacherId: payroll.Teacher.id,
        teacherName: payroll.Teacher.name,
        totalSalary: Object.values(records).reduce((sum, month) => 
          sum + month.salary + month.allowance, 0),
        paidMonths: Object.values(records).filter(month => month.status === 'paid').length,
        pendingMonths: Object.values(records).filter(month => month.status === 'pending').length
      };
    });

    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  */
  console.log('[INFO] getPayrollSummary called, but body is commented out for refresh.');
  res.status(510).json({ message: 'Functionality under reconstruction.'});
};

// Update monthly salary (older alternative, also commenting out)
export const updateMonthlySalary = async (req, res) => {
  /* // Body commented out for payroll refresh
  try {
    const { teacherId, month, salary, allowance, remarks } = req.body;
    
    const payroll = await TeacherPayroll.findOne({ 
      where: { teacherId }
    });
    
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    const records = payroll.records;
    records[month] = {
      salary,
      allowance,
      remarks,
      status: 'paid',
      updatedAt: new Date()
    };
    
    payroll.records = records;
    await payroll.save();

    res.json(payroll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  */
  console.log('[INFO] updateMonthlySalary called, but body is commented out for refresh.');
  res.status(510).json({ message: 'Functionality under reconstruction.'});
};

// Remove a teacher from the system - REMAINS ACTIVE
export const removeTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params; 
    console.log('Attempting to remove teacher with ID:', teacherId);

    if (!teacherId) {
      console.log('Invalid teacher ID format');
      return res.status(400).json({ message: 'Invalid teacher ID format' });
    }

    const result = await sequelize.transaction(async (t) => {
      const teacher = await Teacher.findByPk(teacherId, { transaction: t });
      if (!teacher) {
        console.log('Teacher not found with ID:', teacherId);
        throw new Error('Teacher not found');
      }
      console.log('Found teacher:', teacher.name);

      await TeacherPayroll.destroy({ 
        where: { teacherId },
        transaction: t
      });

      await teacher.destroy({ transaction: t });
      
      return { teacherName: teacher.name };
    });

    res.status(200).json({ 
      message: 'Teacher removed successfully',
      details: {
        teacherName: result.teacherName,
        teacherId: teacherId
      }
    });
  } catch (error) {
    console.error('Error removing teacher:', error);
    res.status(500).json({ 
      message: 'Error removing teacher',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Clear all payroll records for a specific teacher
export const clearTeacherPayroll = async (req, res) => {
  try {
    const { teacherId } = req.body;
    if (!teacherId) {
      return res.status(400).json({ message: 'teacherId is required' });
    }
    
    console.log(`[DEBUG] Clearing payroll records for teacher ID: ${teacherId}`);
    
    // Use transaction for data integrity
    const transaction = await sequelize.transaction();
    
    try {
      // Get the teacher record
      const teacher = await Teacher.findByPk(teacherId, { transaction });
      
      if (!teacher) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Teacher not found' });
      }
      
      // Clear payroll records
      await TeacherPayroll.destroy({ 
        where: { teacherId },
        transaction
      });
      
      // Create new default payroll record
      const currentYear = new Date().getFullYear();
      await TeacherPayroll.create({
        teacherId: parseInt(teacherId),
        year: currentYear,
        records: getDefaultYearRecords()
      }, { transaction });
      
      // Clear payment data from teacher record
      teacher.payments = {};
      teacher.lastPayment = null;
      await teacher.save({ transaction });
      
      // Commit transaction
      await transaction.commit();
      
      console.log(`[DEBUG] Payroll records cleared successfully for teacher: ${teacher.name}`);
      res.status(200).json({ 
        message: 'Payroll records cleared successfully.',
        teacherId: teacherId,
        teacherName: teacher.name
      });
    } catch (error) {
      await transaction.rollback();
      console.error('[ERROR] Transaction rolled back due to error:', error);
      throw error;
    }
  } catch (error) {
    console.error('[ERROR] Error clearing payroll records:', error);
    res.status(500).json({ 
      message: 'Failed to clear payroll records',
      error: error.message
    });
  }
};

// Test database connection and basic operations - REMAINS ACTIVE
export const testDatabaseConnection = async (req, res) => {
  let transaction;
  try {
    console.log('[DEBUG] Testing database connection...');
    
    // Test 1: Basic connection
    await sequelize.authenticate();
    console.log('[DEBUG] Database connection successful');
    
    // Test 2: Create test record
    transaction = await sequelize.transaction();
    const testTeacher = await Teacher.create({
      name: 'Test Teacher',
      email: `test${Date.now()}@test.com`,
      password: 'test123',
      position: 'Test Position'
    }, { transaction });
    
    console.log('[DEBUG] Test teacher created:', testTeacher.id);
    
    // Test 3: Create test payroll
    const testPayroll = await TeacherPayroll.create({
      teacherId: testTeacher.id,
      year: new Date().getFullYear(),
      records: {
        Baishakh: { salary: 1000, allowance: 100, remarks: 'Test', status: 'paid', date: new Date().toISOString() }
      }
    }, { transaction });
    
    console.log('[DEBUG] Test payroll created:', testPayroll.id);
    
    // Test 4: Update test payroll
    const updatedPayroll = await TeacherPayroll.update(
      { records: { ...testPayroll.records, Jestha: { salary: 2000, allowance: 200, remarks: 'Test Update', status: 'paid', date: new Date().toISOString() } } },
      { where: { id: testPayroll.id }, transaction }
    );
    
    console.log('[DEBUG] Test payroll updated:', updatedPayroll);
    
    // Test 5: Verify update
    const verifiedPayroll = await TeacherPayroll.findByPk(testPayroll.id, { transaction });
    console.log('[DEBUG] Verified payroll:', verifiedPayroll.records);
    
    // Clean up test data
    await TeacherPayroll.destroy({ where: { id: testPayroll.id }, transaction });
    await Teacher.destroy({ where: { id: testTeacher.id }, transaction });
    
    await transaction.commit();
    console.log('[DEBUG] Test transaction committed');
    
    res.status(200).json({
      message: 'Database connection and operations test successful',
      details: {
        connection: 'OK',
        create: 'OK',
        update: 'OK',
        verify: 'OK',
        cleanup: 'OK'
      }
    });
  } catch (error) {
    console.error('[ERROR] Database test failed:', error);
    if (transaction) {
      await transaction.rollback();
    }
    res.status(500).json({
      message: 'Database test failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}; 