import express from "express"
import noticeController from "../../../controllers/admin/notice_controller.js"
import tokenVerify from "../../../tokens/token_verify.js"
import Notice from "../../../models/Notice.js"
import Admin from "../../../models/Admin.js"

const admin_notice_route = express.Router()

admin_notice_route.post("/create-notice", tokenVerify, noticeController)

admin_notice_route.delete("/delete/notice/:id", tokenVerify, async (req, res) => {
  try {
    const noticeId = req.params.id;
    console.log("Attempting to delete notice with ID:", noticeId);
    
    // Check if notice exists first
    const notice = await Notice.findByPk(noticeId);
    if (!notice) {
      console.log("Notice not found with ID:", noticeId);
      return res.status(404).json({ message: "Notice not found" });
    }
    
    // Delete the notice
    await notice.destroy();
    console.log("Successfully deleted notice with ID:", noticeId);
    
    res.json({ 
      message: "Notice deleted successfully",
      deletedId: noticeId
    });
  } catch (error) {
    console.error("Error deleting notice:", error);
    res.status(500).json({ 
      message: "Failed to delete notice", 
      error: error.message 
    });
  }
});

// Add this route to get a specific notice by ID
admin_notice_route.get("/notice/:id", tokenVerify, async (req, res) => {
  try {
    const noticeId = req.params.id;
    const notice = await Notice.findByPk(noticeId, {
      include: [{
        model: Admin,
        attributes: ['name']
      }]
    });
    
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }
    
    res.json(notice);
  } catch (error) {
    console.error("Error fetching notice:", error);
    res.status(500).json({ message: error.message });
  }
});

export default admin_notice_route