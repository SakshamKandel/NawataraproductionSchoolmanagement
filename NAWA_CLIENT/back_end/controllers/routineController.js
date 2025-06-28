import Routine from '../models/Routine.js';
import Teacher from '../models/Teacher.js';
import TeacherNotice from '../models/TeacherNotice.js';
import sequelize from '../config/database.js';

// Get routine for a teacher
export const getRoutine = async (req, res) => {
  try {
    let teacherId;
    
    if (req.params.teacherId) {
      // Admin or specific access
      teacherId = req.params.teacherId;
    } else {
      // Teacher accessing their own routine
      teacherId = req.user.id;
    }
    
    // Verify teacher exists
    const teacher = await Teacher.findByPk(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    
    const routines = await Routine.findAll({
      where: { teacherId },
      order: [
        ['day', 'ASC'],
        ['period', 'ASC']
      ]
    });
    
    res.json(routines);
  } catch (error) {
    console.error("Error fetching routines:", error);
    res.status(500).json({ message: error.message });
  }
};

// Add a new routine entry
export const addRoutine = async (req, res) => {
  try {
    const { teacherId, day, period, subject, class: className } = req.body;
    
    // Verify teacher exists
    const teacher = await Teacher.findByPk(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    
    // Check if routine already exists for this time slot
    const existingRoutine = await Routine.findOne({
      where: { 
        teacherId,
        day,
        period
      }
    });

    if (existingRoutine) {
      return res.status(400).json({ 
        message: "A routine already exists for this time slot. Use update instead." 
      });
    }

    // Create new routine
    const newRoutine = await Routine.create({
      teacherId,
      day,
      period,
      subject,
      class: className
    });

    // Create a notification for the teacher
    await TeacherNotice.create({
      teacherId,
      title: "New Class Added to Your Routine",
      message: `A new ${subject} class has been added to your routine on ${day}, period ${period}.`,
      isRead: false,
      subject: subject,
      status: "approved"  // System notices are automatically approved
    });

    res.status(201).json({
      message: "Routine added successfully",
      routine: newRoutine
    });
  } catch (error) {
    console.error("Error adding routine:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update existing routine
export const updateRoutine = async (req, res) => {
  try {
    const { teacherId, day, period, subject, class: className } = req.body;
    
    console.log("Updating routine with data:", req.body);
    
    // Validate required fields
    if (!teacherId || !day || period === undefined || !subject || !className) {
      return res.status(400).json({ 
        message: "Missing required fields. Please provide teacherId, day, period, subject, and class." 
      });
    }
    
    // Verify teacher exists
    const teacher = await Teacher.findByPk(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    
    // Find the routine
    let routine = await Routine.findOne({
      where: { 
        teacherId,
        day,
        period
      }
    });

    // If routine doesn't exist, create it
    if (!routine) {
      routine = await Routine.create({
        teacherId,
        day,
        period,
        subject,
        class: className
      });
      
      // Create a notification for the teacher
      await TeacherNotice.create({
        teacherId,
        title: "New Class Added to Your Routine",
        message: `A new ${subject} class has been added to your routine on ${day}, period ${period}.`,
        isRead: false,
        subject: subject,
        status: "approved"  // System notices are automatically approved
      });
      
      return res.status(201).json({
        message: "Routine entry created successfully",
        routine
      });
    }

    // Update routine
    const previousSubject = routine.subject;
    
    routine.subject = subject;
    routine.class = className;
    await routine.save();

    console.log("Updated routine:", routine);

    // Create a notification for the teacher only if subject changed
    if (previousSubject !== subject) {
      await TeacherNotice.create({
        teacherId,
        title: "Your Routine Has Been Updated",
        message: `Your ${day} period ${period} class has been updated to ${subject}.`,
        isRead: false,
        subject: subject
      });
    }

    res.json({
      message: "Routine updated successfully",
      routine
    });
  } catch (error) {
    console.error("Error updating routine:", error);
    res.status(500).json({ 
      message: "Failed to update routine", 
      error: error.message 
    });
  }
};

// Delete routine
export const deleteRoutine = async (req, res) => {
  try {
    const { teacherId, day, period } = req.body;
    
    // Verify teacher exists
    const teacher = await Teacher.findByPk(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    
    // Find the routine
    const routine = await Routine.findOne({
      where: { 
        teacherId,
        day,
        period
      }
    });

    if (!routine) {
      return res.status(404).json({ message: "Routine not found for this time slot" });
    }

    // Store subject for notification before deleting
    const { subject } = routine;

    // Delete routine
    await routine.destroy();

    // Create a notification for the teacher
    await TeacherNotice.create({
      teacherId,
      title: "Class Removed From Your Routine",
      message: `Your ${subject} class on ${day}, period ${period} has been removed from your routine.`,
      isRead: false,
      subject: subject
    });

    res.json({
      message: "Routine deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting routine:", error);
    res.status(500).json({ message: error.message });
  }
};

// Bulk update routine (replace entire schedule)
export const bulkUpdateRoutine = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    const scheduleData = req.body.data;
    
    console.log("Bulk updating routine with data:", {
      teacherId,
      scheduleDataCount: scheduleData?.length || 0
    });
    
    // Debug the first entry to verify format
    if (scheduleData?.length > 0) {
      console.log("Sample entry received:", scheduleData[0]);
    }
    
    // Verify input data
    if (!teacherId) {
      return res.status(400).json({ 
        message: "Teacher ID is required" 
      });
    }
    
    if (!Array.isArray(scheduleData) || scheduleData.length === 0) {
      return res.status(400).json({ 
        message: "Schedule data must be a non-empty array" 
      });
    }
    
    // Verify teacher exists
    const teacher = await Teacher.findByPk(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    
    // Helper function to ensure period is an integer
    const normalizePeriod = (period) => {
      if (typeof period === 'number') {
        return period;
      }
      
      // Try to extract number from string like "period1"
      if (typeof period === 'string') {
        const match = period.match(/\d+/);
        if (match) {
          return parseInt(match[0], 10);
        }
      }
      
      // Default to null if conversion fails
      return null;
    };
    
    // Begin a transaction for data integrity
    const result = await sequelize.transaction(async (t) => {
      // Delete existing routines for this teacher
      await Routine.destroy({
        where: { teacherId },
        transaction: t
      });
      
      // Create new routine entries
      const createdEntries = await Promise.all(scheduleData.map(entry => {
        // Validate entry
        if (!entry.day || entry.period === undefined || !entry.subject) {
          console.warn("Skipping invalid entry:", entry);
          return null;
        }
        
        // Normalize period to ensure it's an integer
        const periodValue = normalizePeriod(entry.period);
        if (periodValue === null) {
          console.warn(`Invalid period value: ${entry.period}. Skipping entry.`);
          return null;
        }
        
        return Routine.create({
          teacherId,
          day: entry.day,
          period: periodValue,
          subject: entry.subject || '',
          class: entry.class || ''
        }, { transaction: t });
      }));
      
      // Filter out null entries (invalid ones)
      const validEntries = createdEntries.filter(entry => entry !== null);
      
      console.log(`Created ${validEntries.length} routine entries out of ${scheduleData.length} provided`);
      
      // Create a notification for the teacher
      await TeacherNotice.create({
        teacherId,
        title: "Your Routine Has Been Updated",
        message: "Your entire teaching schedule has been updated. Please check your routine.",
        isRead: false,
        subject: "Schedule Update",
        status: "approved"  // System notices are automatically approved
      }, { transaction: t });
      
      return { 
        success: true,
        entriesCreated: validEntries.length,
        totalEntries: scheduleData.length
      };
    });
    
    res.json({ 
      message: "Full routine updated successfully",
      teacherName: teacher.name,
      routineUpdated: true,
      entriesCreated: result.entriesCreated,
      totalEntries: result.totalEntries
    });
  } catch (error) {
    console.error("Error updating full routine:", error);
    res.status(500).json({
      message: "Failed to update routine",
      error: error.message
    });
  }
};

// Assign class to teacher - new function
export const assignClassToTeacher = async (req, res) => {
  try {
    const { teacherId, className, subject, schedule } = req.body;
    
    // Validate input
    if (!teacherId || !className || !subject || !Array.isArray(schedule) || schedule.length === 0) {
      return res.status(400).json({ 
        message: "Missing required fields. Please provide teacherId, className, subject, and schedule array." 
      });
    }
    
    // Verify teacher exists
    const teacher = await Teacher.findByPk(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    
    // Helper function to ensure period is an integer
    const normalizePeriod = (period) => {
      if (typeof period === 'number') {
        return period;
      }
      
      // Try to extract number from string like "period1"
      if (typeof period === 'string') {
        const match = period.match(/\d+/);
        if (match) {
          return parseInt(match[0], 10);
        }
      }
      
      // Default to null if conversion fails
      return null;
    };
    
    // Begin a transaction
    const result = await sequelize.transaction(async (t) => {
      // Process each schedule entry
      const createdEntries = [];
      const conflictEntries = [];
      
      for (const entry of schedule) {
        const { day, period } = entry;
        
        // Normalize period to ensure it's an integer
        const periodValue = normalizePeriod(period);
        if (periodValue === null) {
          conflictEntries.push({
            day,
            period,
            error: "Invalid period format"
          });
          continue;
        }
        
        // Check if this slot is already assigned
        const existingRoutine = await Routine.findOne({
          where: { teacherId, day, period: periodValue },
          transaction: t
        });
        
        if (existingRoutine) {
          conflictEntries.push({
            day,
            period: periodValue,
            existingClass: existingRoutine.class,
            existingSubject: existingRoutine.subject
          });
          continue;
        }
        
        // Create new routine entry
        const newRoutine = await Routine.create({
          teacherId,
          day,
          period: periodValue,
          subject,
          class: className
        }, { transaction: t });
        
        createdEntries.push(newRoutine);
      }
      
      // Create notification for teacher
      if (createdEntries.length > 0) {
        await TeacherNotice.create({
          teacherId,
          title: `New Class Assignment: ${className}`,
          message: `You have been assigned to teach ${subject} for class ${className}. Check your routine for details.`,
          isRead: false,
          subject: subject
        }, { transaction: t });
      }
      
      return { createdEntries, conflictEntries };
    });
    
    // Return response
    if (result.conflictEntries.length > 0) {
      return res.status(207).json({
        message: "Some schedule entries had conflicts and were not assigned",
        success: result.createdEntries.length > 0,
        assigned: result.createdEntries,
        conflicts: result.conflictEntries
      });
    }
    
    res.status(201).json({
      message: "Class assigned to teacher successfully",
      teacherName: teacher.name,
      className,
      subject,
      assignedSlots: result.createdEntries.length
    });
    
  } catch (error) {
    console.error("Error assigning class to teacher:", error);
    res.status(500).json({
      message: "Failed to assign class",
      error: error.message
    });
  }
};

// Get all classes for a specific class (e.g., "Class 10")
export const getClassRoutine = async (req, res) => {
  try {
    const className = req.params.className;
    
    if (!className) {
      return res.status(400).json({ message: "Class name is required" });
    }
    
    // Find all routine entries for this class
    const routines = await Routine.findAll({
      where: { class: className },
      include: [{
        model: Teacher,
        attributes: ['id', 'name', 'email']
      }],
      order: [
        ['day', 'ASC'],
        ['period', 'ASC']
      ]
    });
    
    // Group by day and period
    const routineByDay = {};
    routines.forEach(routine => {
      if (!routineByDay[routine.day]) {
        routineByDay[routine.day] = {};
      }
      
      routineByDay[routine.day][routine.period] = {
        subject: routine.subject,
        teacher: routine.Teacher ? {
          id: routine.Teacher.id,
          name: routine.Teacher.name
        } : null
      };
    });
    
    res.json({
      className,
      routine: routineByDay
    });
    
  } catch (error) {
    console.error("Error getting class routine:", error);
    res.status(500).json({ message: error.message });
  }
}; 