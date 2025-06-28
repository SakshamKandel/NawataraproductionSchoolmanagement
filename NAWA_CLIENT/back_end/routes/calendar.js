import express from "express";
import Notice from "../models/Notice.js";
import { verifyToken, verifyAdmin, verifyTeacher, verifyStudent } from "../middleware/auth.js";
import { Op } from "sequelize";

const router = express.Router();

// Get calendar events (based on notices) with role-based permissions
router.get("/calendar", async (req, res) => {
  try {
    console.log("Fetching calendar events");
    console.log("Available cookies:", Object.keys(req.cookies || {}));
    
    // Get current date for comparing with publishDate and expiryDate
    const currentDate = new Date();
    
    // Determine user role based on cookies (with safety checks)
    const isAdmin = req.cookies?.adminToken;
    const isTeacher = req.cookies?.teacherToken;
    const isStudent = req.cookies?.studentToken;
    
    console.log("User roles detected:", { isAdmin: !!isAdmin, isTeacher: !!isTeacher, isStudent: !!isStudent });
    
    let whereClause = {
      // Only include notices that are not expired
      [Op.and]: [
        {
          [Op.or]: [
            { endDate: null },
            { endDate: { [Op.gt]: currentDate } }
          ]
        }
      ]
    };
    
    // Apply role-based permissions to the where clause
    if (isAdmin) {
      // Admins see all notices - no additional filters
      console.log("Admin user - showing all calendar notices");
    } else if (isTeacher) {
      // Teachers see notices marked for teachers OR public notices (not specific to students only)
      whereClause[Op.and].push({
        [Op.or]: [
          { forTeachers: true },
          { 
            [Op.and]: [
              { forTeachers: false },
              { forStudents: false }
            ]
          }
        ]
      });
      console.log("Teacher user - showing teacher and public calendar notices");
    } else if (isStudent) {
      // Students see notices marked for students OR public notices (not specific to teachers only)
      whereClause[Op.and].push({
        [Op.or]: [
          { forStudents: true },
          { 
            [Op.and]: [
              { forTeachers: false },
              { forStudents: false }
            ]
          }
        ]
      });
      console.log("Student user - showing student and public calendar notices");
    } else {
      // Public/Guest users only see notices where BOTH forTeachers and forStudents are false
      whereClause[Op.and].push({ 
        [Op.and]: [
          { forTeachers: false },
          { forStudents: false }
        ]
      });
      console.log("Guest user - showing only public calendar notices");
    }
    
    console.log("Calendar notice where clause:", JSON.stringify(whereClause));
    
    const response = await Notice.findAll({
      where: whereClause,
      // Ensure newest notices are returned first based on multiple date fields
      order: [
        ['publishDate', 'DESC'],
        ['createdAt', 'DESC'],
        ['updatedAt', 'DESC']
      ]
    });
    
    console.log(`Found ${response.length} notices matching role criteria`);
    
    // Map to a consistent format regardless of field names
    const events = response.map(notice => {
      const noticeObj = notice.get({ plain: true });
      
      // Use publishDate if available, otherwise fallback to createdAt
      const noticeDate = noticeObj.publishDate 
        ? new Date(noticeObj.publishDate) 
        : new Date(noticeObj.createdAt);
      
      return {
        id: noticeObj.id,
        title: noticeObj.title || noticeObj.noticetitle || "School Notice",
        content: noticeObj.content || noticeObj.noticedes || "",
        date: noticeDate.toISOString(),
        endDate: noticeObj.endDate ? new Date(noticeObj.endDate).toISOString() : null,
        eventType: noticeObj.eventType || 'notice',
        type: noticeObj.eventType || 'notice',
        audience: {
          teachers: !!noticeObj.forTeachers,
          students: !!noticeObj.forStudents
        },
        forTeachers: !!noticeObj.forTeachers,
        forStudents: !!noticeObj.forStudents,
        publishDate: noticeObj.publishDate ? new Date(noticeObj.publishDate).toISOString() : null,
        endDate: noticeObj.endDate ? new Date(noticeObj.endDate).toISOString() : null,
        createdAt: noticeObj.createdAt
      };
    });
    
    if (events.length > 0) {
      console.log("Sample event:", JSON.stringify(events[0], null, 2));
    } 
    // Removing the sample event for public users to avoid confusion during debugging
    // else if (!isAdmin && !isTeacher && !isStudent) {
    //   // If no events for public users, create a sample event for today
    //   const today = new Date();
    //   events.push({
    //     id: 'sample-1',
    //     title: 'School Day',
    //     content: 'Regular school activities',
    //     date: today.toISOString(),
    //     type: 'notice',
    //     audience: {
    //       teachers: true,
    //       students: true
    //     },
    //     forTeachers: true,
    //     forStudents: true,
    //     publishDate: today.toISOString(),
    //     createdAt: today.toISOString()
    //   });
    //   console.log("No notices found, returning sample event for public user");
    // }
    
    res.json(events);
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    res.status(500).json({
      message: "Failed to fetch calendar events",
      error: error.message
    });
  }
});

// Create calendar event (Admin only)
router.post("/calendar-events", verifyAdmin, async (req, res) => {
  try {
    console.log("POST /calendar-events received");
    console.log("Request body:", req.body);
    console.log("Admin user:", req.admin);
    
    const { title, content, eventDate, endDate, audienceType, eventType } = req.body;
    
    if (!title || !content || !eventDate) {
      return res.status(400).json({ 
        message: "Title, content, and event date are required" 
      });
    }
    
    // Convert audienceType to boolean flags
    let forTeachers = false;
    let forStudents = false;
    
    switch (audienceType) {
      case 'Teachers':
        forTeachers = true;
        break;
      case 'Students':
        forStudents = true;
        break;
      case 'All':
        forTeachers = true;
        forStudents = true;
        break;
      case 'Public':
      default:
        // Both remain false for public events
        break;
    }
    
    const notice = await Notice.create({
      adminId: req.admin.id,
      title,
      content,
      forTeachers,
      forStudents,
      publishDate: new Date(eventDate),
      endDate: endDate ? new Date(endDate) : null,
      eventType: eventType || 'event'
    });
    
    res.status(201).json({
      message: "Calendar event created successfully",
      event: {
        id: notice.id,
        title: notice.title,
        content: notice.content,
        date: notice.publishDate,
        endDate: notice.endDate,
        eventType: notice.eventType,
        forTeachers: notice.forTeachers,
        forStudents: notice.forStudents
      }
    });
  } catch (error) {
    console.error("Error creating calendar event:", error);
    res.status(500).json({
      message: "Failed to create calendar event",
      error: error.message
    });
  }
});

// Delete calendar event (Admin and Teacher only)
router.delete("/calendar-events/:id", async (req, res) => {
  try {
    console.log("DELETE /calendar-events/:id received");
    console.log("Event ID:", req.params.id);
    console.log("Cookies:", Object.keys(req.cookies));
    
    // Check if user is admin or teacher
    const isAdmin = req.cookies?.adminToken;
    const isTeacher = req.cookies?.teacherToken;
    
    if (!isAdmin && !isTeacher) {
      return res.status(403).json({ 
        message: "Access denied. Only admins and teachers can delete events." 
      });
    }
    
    const eventId = req.params.id;
    
    if (!eventId) {
      return res.status(400).json({ 
        message: "Event ID is required" 
      });
    }
    
    // Find the event first
    const event = await Notice.findByPk(eventId);
    
    if (!event) {
      return res.status(404).json({ 
        message: "Event not found" 
      });
    }
    
    // Delete the event
    await event.destroy();
    
    console.log(`Event ${eventId} deleted successfully`);
    
    res.status(200).json({
      message: "Event deleted successfully",
      deletedEventId: eventId
    });
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    res.status(500).json({
      message: "Failed to delete calendar event",
      error: error.message
    });
  }
});

export default router;