import express from "express"
import noticeFetchController from "../../controllers/noticeFetch/notice_fetch_controller.js"
import noticeController from "../../controllers/admin/notice_controller.js"
import { verifyToken, verifyAdmin, verifyTeacher, verifyStudent } from "../../middleware/auth.js"
import Notice from "../../models/Notice.js"
import { Op } from "sequelize"

const router = express.Router()

// Create notice (Admin only)
router.post("/create", verifyAdmin, async (req, res) => {
  try {
    await noticeController(req, res);
  } catch (error) {
    console.error("Error in create notice route:", error);
    res.status(500).json({ message: "Failed to create notice", error: error.message });
  }
});

// Delete notice (Admin only)
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const noticeId = req.params.id;
    console.log("Attempting to delete notice with ID:", noticeId);
    
    const notice = await Notice.findByPk(noticeId);
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }
    
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

// Static routes should come BEFORE dynamic/parameterized routes like /:id

// Public route - anyone can access without login
router.get("/public", async (req, res) => {
  try {
    await noticeFetchController(req, res);
  } catch (error) {
    console.error("Error in public notice route:", error);
    res.status(500).json({ message: "Failed to fetch public notices", error: error.message });
  }
});

// Routes for specific user types
router.get("/admin", verifyAdmin, async (req, res) => {
  try {
    await noticeFetchController(req, res);
  } catch (error) {
    console.error("Error in admin notice route:", error);
    res.status(500).json({ message: "Failed to fetch admin notices", error: error.message });
  }
});

router.get("/teacher", verifyTeacher, async (req, res) => {
  try {
    await noticeFetchController(req, res);
  } catch (error) {
    console.error("Error in teacher notice route:", error);
    res.status(500).json({ message: "Failed to fetch teacher notices", error: error.message });
  }
});

router.get("/student", verifyStudent, async (req, res) => {
  try {
    await noticeFetchController(req, res);
  } catch (error) {
    console.error("Error in student notice route:", error);
    res.status(500).json({ message: "Failed to fetch student notices", error: error.message });
  }
});

// Combined route for admins and teachers only
router.get("/staff", verifyToken, (req, res, next) => {
  if (req.admin || req.teacher) {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admin or teacher access only." });
  }
}, async (req, res) => {
  try {
    await noticeFetchController(req, res);
  } catch (error) {
    console.error("Error in staff notice route:", error);
    res.status(500).json({ message: "Failed to fetch staff notices", error: error.message });
  }
});

// General route that will filter based on who's logged in (should also be before /:id if it's a GET)
router.get("/", async (req, res) => {
  try {
    await noticeFetchController(req, res);
  } catch (error) {
    console.error("Error in general notice route:", error);
    res.status(500).json({ message: "Failed to fetch notices", error: error.message });
  }
});

// Get specific notice by ID - THIS MUST COME AFTER ALL OTHER GET ROUTES
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const noticeId = req.params.id;
    // Add a check to ensure 'id' is a number to avoid conflicts with 'public', 'admin', etc.
    if (isNaN(noticeId)) {
        // If it's not a number, it might be a missed static route or an invalid request.
        // This shouldn't happen if static routes are correctly placed above.
        console.warn(`[GetNotice.js /:id] Received non-numeric ID: ${noticeId}. This might indicate a route ordering issue or an attempt to access a specific route by name.`);
        // Let other more specific routes handle it, or fall through to 404 if this is the last matching route.
        // For safety, if we reach here with a non-numeric ID, assume it's not a valid notice ID.
        return res.status(404).json({ message: "Invalid notice identifier." });
    }
    const notice = await Notice.findByPk(noticeId);
    
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }
    
    // Check if user has permission to view this notice
    if (notice.forTeachers && !req.teacher && !req.admin) {
      return res.status(403).json({ message: "Access denied. Teacher access required." });
    }
    if (notice.forStudents && !req.student && !req.admin) {
      return res.status(403).json({ message: "Access denied. Student access required." });
    }
    
    res.json(notice);
  } catch (error) {
    console.error("Error fetching notice:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router
