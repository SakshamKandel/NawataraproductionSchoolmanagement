import StudentFee from "../../models/StudentFee.js";

const edit_record_fee_controller = async (req, res) => {
  try {
    if (!req.admin) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    
    const studentId = req.params.id;
    console.log(`[EDIT_FEE_DEBUG] Updating fee for student ID: ${studentId}`);
    console.log(`[EDIT_FEE_DEBUG] Update data:`, JSON.stringify(req.body, null, 2));
    
    const feeRecord = await StudentFee.findOne({
      where: { studentID: studentId }
    });
    
    if (!feeRecord) {
      console.log(`[EDIT_FEE_DEBUG] Fee record not found for student: ${studentId}`);
      return res.status(404).json({ message: "Fee record not found" });
    }
    
    console.log(`[EDIT_FEE_DEBUG] Current records type:`, typeof feeRecord.records);
    console.log(`[EDIT_FEE_DEBUG] Current records:`, feeRecord.records);
    
    // Fix corrupted records - ensure it's a proper object, not string
    let currentRecords;
    try {
      if (typeof feeRecord.records === 'string') {
        console.log(`[EDIT_FEE_DEBUG] Records is string, attempting to parse...`);
        // First try normal JSON parsing
        try {
          currentRecords = JSON.parse(feeRecord.records);
          
          // Check if the parsed result is an array of characters (corrupted data)
          if (Array.isArray(currentRecords) || (typeof currentRecords === 'object' && Object.keys(currentRecords).every(key => !isNaN(key) && key.length <= 3))) {
            console.log(`[EDIT_FEE_DEBUG] Detected character array corruption, creating fresh structure`);
            currentRecords = {};
          }
        } catch (parseError1) {
          // If direct parsing fails, try to extract any valid JSON from the corruption
          console.log(`[EDIT_FEE_DEBUG] Direct parsing failed, looking for valid JSON patterns...`);
          
          // Look for month patterns in the corrupted string
          const months = ['Baishakh', 'Jestha', 'Asadhh', 'Shrawan', 'Bhadra', 'Ashwin', 'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'];
          currentRecords = {};
          
          // Try to extract any month data that might be embedded in the corruption
          months.forEach(month => {
            const monthPattern = new RegExp(`"${month}":\\s*{[^}]*}`, 'g');
            const match = feeRecord.records.match(monthPattern);
            if (match) {
              try {
                const monthData = JSON.parse(`{${match[0]}}`);
                if (monthData[month]) {
                  currentRecords[month] = monthData[month];
                  console.log(`[EDIT_FEE_DEBUG] Recovered ${month} data from corruption`);
                }
              } catch (monthError) {
                console.log(`[EDIT_FEE_DEBUG] Could not recover ${month} data`);
              }
            }
          });
        }
      } else if (typeof feeRecord.records === 'object' && feeRecord.records !== null) {
        currentRecords = JSON.parse(JSON.stringify(feeRecord.records));
      } else {
        console.log(`[EDIT_FEE_DEBUG] Records is null/undefined, creating default structure`);
        currentRecords = {};
      }
    } catch (parseError) {
      console.error(`[EDIT_FEE_DEBUG] Failed to parse records, creating fresh structure:`, parseError);
      currentRecords = {};
    }
    
    // Ensure the currentRecords is a proper object with month structure
    const months = ['Baishakh', 'Jestha', 'Asadhh', 'Shrawan', 'Bhadra', 'Ashwin', 'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'];
    
    // Initialize missing months with default structure
    months.forEach(month => {
      if (!currentRecords[month] || typeof currentRecords[month] !== 'object') {
        currentRecords[month] = {
          adm_fee: 0,
          month_fee: 0,
          comp_fee: 0
        };
      }
    });
    
    // Merge the new data with existing records (preserving existing month data)
    const updatedRecords = { ...currentRecords };
    if (req.body.records) {
      Object.keys(req.body.records).forEach(month => {
        if (months.includes(month)) {
          updatedRecords[month] = {
            ...updatedRecords[month],
            ...req.body.records[month]
          };
        }
      });
    }
    
    console.log(`[EDIT_FEE_DEBUG] Merged records:`, JSON.stringify(updatedRecords, null, 2));
    
    // Update using Sequelize update method with proper typing
    const [numUpdated] = await StudentFee.update(
      { records: updatedRecords },
      { where: { studentID: studentId } }
    );
    
    console.log(`[EDIT_FEE_DEBUG] Updated ${numUpdated} record(s)`);
    
    if (numUpdated === 0) {
      return res.status(500).json({ message: "No updates were made" });
    } else {
      // Return the updated record
      const updatedRecord = await StudentFee.findOne({
        where: { studentID: studentId }
      });
      return res.json({ 
        message: "Updated Successfully", 
        record: updatedRecord 
      });
    }
  } catch (error) {
    console.error("Error updating fee record:", error);
    res.status(500).json({ 
      message: "Failed to update fee record", 
      error: error.message 
    });
  }
};

export default edit_record_fee_controller;