import Student from './models/Student.js';
import StudentFee from './models/StudentFee.js';

/**
 * Function to fix and ensure all students have proper fee records
 * This is a utility function for the admin to ensure data consistency
 */
async function fixStudentFees() {
  try {
    console.log("Starting student fee records check and fix process");
    
    // Get all students
    const students = await Student.findAll();
    console.log(`Found ${students.length} students to check for fee records`);
    
    const months = [
      'Baishakh', 'Jestha', 'Asadhh', 'Shrawan', 'Bhadra', 'Ashwin',
      'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
    ];
    
    let created = 0;
    let updated = 0;
    let alreadyOk = 0;
    
    // Process each student
    for (const student of students) {
      // Check if student has a fee record
      let feeRecord = await StudentFee.findOne({ 
        where: { studentID: student.id } 
      });
      
      if (!feeRecord) {
        // Create a new fee record
        const newFeeRecord = {
          studentID: student.id,
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
        
        // Create and save the record
        await StudentFee.create(newFeeRecord);
        created++;
        console.log(`Created new fee record for student ${student.id}`);
      } else {
        // Verify the record has all months
        let recordsUpdated = false;
        const records = feeRecord.records;
        
        // Check if all months exist and have the right structure
        for (const month of months) {
          if (!records[month]) {
            records[month] = {
              adm_fee: 0,
              month_fee: 0,
              comp_fee: 0
            };
            recordsUpdated = true;
          } else if (
            typeof records[month].adm_fee === 'undefined' || 
            typeof records[month].month_fee === 'undefined' || 
            typeof records[month].comp_fee === 'undefined'
          ) {
            // Fix structure issues
            records[month] = {
              adm_fee: records[month].adm_fee || 0,
              month_fee: records[month].month_fee || 0,
              comp_fee: records[month].comp_fee || 0
            };
            recordsUpdated = true;
          }
        }
        
        if (recordsUpdated) {
          // Update the record if changes were made
          feeRecord.records = records;
          await feeRecord.save();
          updated++;
          console.log(`Updated fee record for student ${student.id}`);
        } else {
          alreadyOk++;
        }
      }
    }
    
    return {
      success: true,
      totalStudents: students.length,
      newRecordsCreated: created,
      existingRecordsUpdated: updated,
      alreadyCorrectRecords: alreadyOk
    };
  } catch (error) {
    console.error("Error fixing student fees:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

export default fixStudentFees; 