import ClassFee from "../../models/ClassFee.js";

const class_fee_structController = async (req, res) => {
  try {
    if (req.admin) {
      let result = await ClassFee.findOne({
        where: { className: req.params.class_name }
      });
      
      if (!result) {
        // Create default fee structure if none exists
        console.log(`Creating default fee structure for class: ${req.params.class_name}`);
        result = await ClassFee.create({
          className: req.params.class_name,
          admissionFee: 0,
          monthlyFee: 0,
          computerFee: 0
        });
        console.log(`Created default fee structure for class: ${req.params.class_name}`);
      }
      
      res.json(result);
    } else {
      res.status(403).json({ message: "Unauthorized access" });
    }
  } catch (error) {
    console.error("Error fetching class fee structure:", error);
    res.status(500).json({ 
      message: "Failed to fetch class fee structure", 
      error: error.message 
    });
  }
};

export default class_fee_structController;
