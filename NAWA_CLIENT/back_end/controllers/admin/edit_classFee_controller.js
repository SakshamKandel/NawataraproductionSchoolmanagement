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
        req.body.admissionFee == classFee.admissionFee && 
        req.body.monthlyFee == classFee.monthlyFee && 
        req.body.computerFee == classFee.computerFee
      ) {
        return res.status(400).send("There were no updates in the fee structure");
      }
      
      // Update the fee structure
      classFee.admissionFee = req.body.admissionFee;
      classFee.monthlyFee = req.body.monthlyFee;
      classFee.computerFee = req.body.computerFee;
      await classFee.save();
      
      res.send("Updated fee structure successfully");
    }
  } catch (error) {
    console.error("Error updating class fee structure:", error);
    res.status(500).send(error.message);
  }
};

export default edit_class_fee_struct_Controller;
