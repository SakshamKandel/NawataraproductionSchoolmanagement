import ClassFee from "../../models/ClassFee.js";

const edit_class_fee_struct_Controller = async (req, res) => {
  try {
    if (req.admin) {
      const classFee = await ClassFee.findOne({
        where: { className: req.params.class_name }
      });
      
      if (!classFee) {
        return res.status(404).send("Fee structure not found for this class");
      }
      
      // Check if there are actual changes to make
      if (
        req.body.monthlyFee == classFee.monthlyFee && 
        req.body.transportationFee == classFee.transportationFee && 
        req.body.examFee == classFee.examFee
      ) {
        return res.status(400).send("There were no updates in the fee structure");
      }
      
      // Update the fee structure
      classFee.monthlyFee = req.body.monthlyFee;
      classFee.transportationFee = req.body.transportationFee;
      classFee.examFee = req.body.examFee;
      await classFee.save();
      
      res.send("Updated fee structure successfully");
    }
  } catch (error) {
    console.error("Error updating class fee structure:", error);
    res.status(500).send(error.message);
  }
};

export default edit_class_fee_struct_Controller;
