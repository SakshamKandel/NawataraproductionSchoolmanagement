import ClassFee from "../../models/ClassFee.js";

const class_fee_structController = async (req, res) => {
  try {
    if (req.admin) {
      const result = await ClassFee.findOne({
        where: { className: req.params.class_name }
      });
      
      if (!result) {
        return res.status(404).send("Fee structure not found for this class");
      }
      
      res.send(result);
    }
  } catch (error) {
    console.error("Error fetching class fee structure:", error);
    res.status(500).send(error.message);
  }
};

export default class_fee_structController;
