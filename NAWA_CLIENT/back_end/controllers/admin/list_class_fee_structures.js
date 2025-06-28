import ClassFee from "../../models/ClassFee.js";

/**
 * List all class fee structures
 * Returns a list of all available class fee structures
 */
const listClassFeeStructuresController = async (req, res) => {
  try {
    if (!req.admin) {
      return res.status(403).send("Only administrators can view all fee structures");
    }

    // Get all fee structures, sorted by class name
    const feeStructures = await ClassFee.findAll({
      order: [['className', 'ASC']]
    });
    
    return res.status(200).json({
      message: "Fee structures retrieved successfully",
      data: feeStructures
    });
  } catch (error) {
    console.error("Error listing class fee structures:", error);
    return res.status(500).send(error.message);
  }
};

export default listClassFeeStructuresController; 