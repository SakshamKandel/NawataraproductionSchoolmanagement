import StudentFee from './models/StudentFee.js';
import sequelize from './config/database.js';

const months = [
  'Baishakh', 'Jestha', 'Asadhh', 'Shrawan', 'Bhadra', 'Ashwin',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

const fixCorruptedFeeRecords = async () => {
  console.log('[FEE_FIX] Starting fee record corruption fix...');
  
  try {
    // Get all student fee records
    const allFeeRecords = await StudentFee.findAll();
    console.log(`[FEE_FIX] Found ${allFeeRecords.length} fee records to check`);
    
    let fixedCount = 0;
    
    for (const feeRecord of allFeeRecords) {
      let needsFix = false;
      let fixedRecords = {};
      
      console.log(`[FEE_FIX] Checking student ID: ${feeRecord.studentID}`);
      console.log(`[FEE_FIX] Records type: ${typeof feeRecord.records}`);
      
      // Check if records is corrupted (stored as string)
      if (typeof feeRecord.records === 'string') {
        console.log(`[FEE_FIX] Found corrupted string records for student ${feeRecord.studentID}`);
        console.log(`[FEE_FIX] Corrupted data preview: ${feeRecord.records.substring(0, 200)}...`);
        
        try {
          // Try to parse if it's valid JSON string
          fixedRecords = JSON.parse(feeRecord.records);
          needsFix = true;
        } catch (parseError) {
          console.error(`[FEE_FIX] Cannot parse corrupted records for student ${feeRecord.studentID}, creating fresh structure`);
          fixedRecords = {};
          needsFix = true;
        }
      } else if (feeRecord.records && typeof feeRecord.records === 'object') {
        // Records is object, just copy it
        fixedRecords = JSON.parse(JSON.stringify(feeRecord.records));
      } else {
        // Records is null/undefined
        console.log(`[FEE_FIX] Records is null/undefined for student ${feeRecord.studentID}`);
        fixedRecords = {};
        needsFix = true;
      }
      
      // Ensure all months exist with proper structure
      months.forEach(month => {
        if (!fixedRecords[month] || typeof fixedRecords[month] !== 'object') {
          fixedRecords[month] = {
            adm_fee: 0,
            month_fee: 0,
            comp_fee: 0
          };
          needsFix = true;
        } else {
          // Ensure all required fields exist
          if (fixedRecords[month].adm_fee === undefined) {
            fixedRecords[month].adm_fee = 0;
            needsFix = true;
          }
          if (fixedRecords[month].month_fee === undefined) {
            fixedRecords[month].month_fee = 0;
            needsFix = true;
          }
          if (fixedRecords[month].comp_fee === undefined) {
            fixedRecords[month].comp_fee = 0;
            needsFix = true;
          }
        }
      });
      
      if (needsFix) {
        console.log(`[FEE_FIX] Fixing records for student ${feeRecord.studentID}`);
        try {
          // Update with proper object structure
          await StudentFee.update(
            { records: fixedRecords },
            { where: { id: feeRecord.id } }
          );
          fixedCount++;
          console.log(`[FEE_FIX] ✓ Fixed records for student ${feeRecord.studentID}`);
        } catch (updateError) {
          console.error(`[FEE_FIX] ✗ Failed to fix records for student ${feeRecord.studentID}:`, updateError);
        }
      } else {
        console.log(`[FEE_FIX] ✓ Records already correct for student ${feeRecord.studentID}`);
      }
    }
    
    console.log(`[FEE_FIX] Completed! Fixed ${fixedCount} corrupted fee records`);
    
  } catch (error) {
    console.error('[FEE_FIX] Error during fee record fix:', error);
  } finally {
    await sequelize.close();
  }
};

// Run the fix
fixCorruptedFeeRecords();
