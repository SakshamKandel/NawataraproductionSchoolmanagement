import Student from '../../models/Student.js';
import StudentFee from '../../models/StudentFee.js';

const getFeeController = async (req, res) => {
  try {
    if (!req.admin) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const studentId = req.params.id;
    console.log(`[FEE_DEBUG] Getting fee for student ID: ${studentId}`);
    
    if (!studentId || isNaN(studentId)) {
      return res.status(400).json({ 
        message: "Invalid student ID",
        error: "Student ID must be a valid number"
      });
    }
    
    // Verify the student exists
    const studentExists = await Student.findByPk(studentId);
    if (!studentExists) {
      console.log(`[FEE_DEBUG] Student not found: ${studentId}`);
      return res.status(404).json({ 
        message: "Student not found",
        error: "The specified student ID does not exist in the database"
      });
    }
    console.log(`[FEE_DEBUG] Student found: ${studentExists.name}`);

    // Find fee record for the student
    console.log(`[FEE_DEBUG] Searching for fee records with studentID: ${studentId}`);
    let result;
    try {
      result = await StudentFee.findAll({ where: { studentID: studentId } });
      console.log(`[FEE_DEBUG] Found ${result.length} fee records`);
    } catch (dbError) {
      console.error(`[FEE_DEBUG] Database error when searching for fee records:`, dbError);
      // Try alternative column names
      try {
        console.log(`[FEE_DEBUG] Trying alternative column name 'student_id'`);
        result = await StudentFee.findAll({ where: { student_id: studentId } });
      } catch (altError) {
        console.error(`[FEE_DEBUG] Alternative search also failed:`, altError);
        result = [];
      }
    }
    
    if (!result || result.length === 0) {
      console.log(`No fee record found for student: ${studentId}. Creating a new one.`);
      
      // Create default fee record if missing
      const months = [
        'Baishakh', 'Jestha', 'Asadhh', 'Shrawan', 'Bhadra', 'Ashwin',
        'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
      ];
      
      const newFeeRecord = {
        studentID: studentId,
        records: {}
      };
      
      // Initialize all months with zero fees
      months.forEach(month => {
        newFeeRecord.records[month] = {
          adm_fee: 0,
          month_fee: 0,
          comp_fee: 0
        };
      });
      
      // Create and save the new fee record
      const createdRecord = await StudentFee.create(newFeeRecord);
      console.log(`Created new fee record for student: ${studentId}`);
      
      return res.json([createdRecord]);
    }
    
    // Ensure the existing fee record has the correct structure
    const months = [
      'Baishakh', 'Jestha', 'Asadhh', 'Shrawan', 'Bhadra', 'Ashwin',
      'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
    ];
    
    // Fix records using for...of loop to handle async/await properly
    for (const feeRecord of result) {
      let recordsFixed = false;
      
      // First, ensure records is a proper object
      if (typeof feeRecord.records === 'string') {
        try {
          feeRecord.records = JSON.parse(feeRecord.records);
          recordsFixed = true;
          console.log(`[FEE_DEBUG] Converted string records to object for student ${studentId}`);
        } catch (parseError) {
          console.error(`[FEE_DEBUG] Failed to parse string records for student ${studentId}:`, parseError);
          feeRecord.records = {};
          recordsFixed = true;
        }
      } else if (!feeRecord.records || typeof feeRecord.records !== 'object') {
        feeRecord.records = {};
        recordsFixed = true;
      }
      
      // Fix missing months or invalid structure
      months.forEach(month => {
        if (!feeRecord.records[month] || typeof feeRecord.records[month] !== 'object') {
          feeRecord.records[month] = {
            adm_fee: 0,
            month_fee: 0,
            comp_fee: 0
          };
          recordsFixed = true;
        } else {
          // Ensure all required fields exist
          if (feeRecord.records[month].adm_fee === undefined) {
            feeRecord.records[month].adm_fee = 0;
            recordsFixed = true;
          }
          if (feeRecord.records[month].month_fee === undefined) {
            feeRecord.records[month].month_fee = 0;
            recordsFixed = true;
          }
          if (feeRecord.records[month].comp_fee === undefined) {
            feeRecord.records[month].comp_fee = 0;
            recordsFixed = true;
          }
        }
      });
      
      // Save the corrected record if changes were made
      if (recordsFixed) {
        try {
          // Ensure we're saving an object, not a string
          feeRecord.changed('records', true);
          await feeRecord.save();
          console.log(`[FEE_DEBUG] Corrected and saved fee record for student ${studentId}`);
        } catch (err) {
          console.error(`[FEE_DEBUG] Error saving corrected fee record for student ${studentId}:`, err);
        }
      }
    }
    
    // Return the existing fee record
    return res.json(result);
  } catch (error) {
    console.error("Error retrieving student fee:", error);
    return res.status(500).json({
      message: "Failed to retrieve student fee information",
      error: error.message
    });
  }
};

export default getFeeController;
