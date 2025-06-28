import StudentFee from "../../models/StudentFee.js";

const edit_record_fee_controller = async (req, res) => {
  try {
    if (req.admin) {
      const feeRecord = await StudentFee.findOne({
        where: { studentID: req.params.id }
      });
      
      if (!feeRecord) {
        return res.status(404).send("Fee record not found");
      }
      
      // Update the records
      const [numUpdated] = await StudentFee.update(req.body, {
        where: { studentID: req.params.id }
      });
      
      if (numUpdated === 0) {
        res.status(500).send("No updates were made");
      } else {
        res.send("Updated Successfully");
      }
    }
  } catch (error) {
    console.error("Error updating fee record:", error);
    res.status(500).send(error.message);
  }
};

export default edit_record_fee_controller;