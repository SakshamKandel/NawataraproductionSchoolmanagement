import ClassFee from "../../models/ClassFee.js";

/**
 * Create or update class fee structure
 * This controller handles both creation of new fee structures and updating existing ones
 */
const createUpdateClassFeeController = async (req, res) => {
  try {
    if (!req.admin) {
      return res.status(403).send("Only administrators can manage fee structures");
    }

    const { className, monthlyFee, transportationFee, examFee } = req.body;
    
    // Validate input data
    if (!className || className.trim() === '') {
      return res.status(400).send("Class name is required");
    }
    
    if (isNaN(monthlyFee) || isNaN(transportationFee) || isNaN(examFee)) {
      return res.status(400).send("All fee amounts must be valid numbers");
    }
    
    // Find or create the fee structure
    const [feeStructure, created] = await ClassFee.findOrCreate({
      where: { className: className.trim() },
      defaults: {
        monthlyFee: parseFloat(monthlyFee),
        transportationFee: parseFloat(transportationFee),
        examFee: parseFloat(examFee)
      }
    });
    
    // If structure exists but we're updating it
    if (!created) {
      feeStructure.monthlyFee = parseFloat(monthlyFee);
      feeStructure.transportationFee = parseFloat(transportationFee);
      feeStructure.examFee = parseFloat(examFee);
      await feeStructure.save();
      
      return res.status(200).json({
        message: "Fee structure updated successfully",
        data: feeStructure
      });
    }
    
    return res.status(201).json({
      message: "Fee structure created successfully",
      data: feeStructure
    });
  } catch (error) {
    console.error("Error creating/updating class fee structure:", error);
    return res.status(500).send(error.message);
  }
};

export default createUpdateClassFeeController; 