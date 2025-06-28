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

    const { className, admissionFee, monthlyFee, computerFee } = req.body;
    
    // Validate input data
    if (!className || className.trim() === '') {
      return res.status(400).send("Class name is required");
    }
    
    if (isNaN(admissionFee) || isNaN(monthlyFee) || isNaN(computerFee)) {
      return res.status(400).send("All fee amounts must be valid numbers");
    }
    
    // Find or create the fee structure
    const [feeStructure, created] = await ClassFee.findOrCreate({
      where: { className: className.trim() },
      defaults: {
        admissionFee: parseFloat(admissionFee),
        monthlyFee: parseFloat(monthlyFee),
        computerFee: parseFloat(computerFee)
      }
    });
    
    // If structure exists but we're updating it
    if (!created) {
      feeStructure.admissionFee = parseFloat(admissionFee);
      feeStructure.monthlyFee = parseFloat(monthlyFee);
      feeStructure.computerFee = parseFloat(computerFee);
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