import Routine from "../../models/Routine.js";
import Teacher from "../../models/Teacher.js";
import TeacherNotice from "../../models/TeacherNotice.js";
import sequelize from "../../config/database.js";

const updateRoutine_controller = async (req, res) => {
  try {
    if (!req.admin) {
      return res.status(403).json({ message: "Only administrators can update routines" });
    }
    
    const teacherId = req.params.teacherID;
    const scheduleData = req.body.data;
    
    // Verify teacher exists
    const teacher = await Teacher.findByPk(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    
    // Begin a transaction for data integrity
    const result = await sequelize.transaction(async (t) => {
      // Delete existing routines for this teacher
      await Routine.destroy({
        where: { teacherId },
        transaction: t
      });
      
      // Create new routine entries
      if (Array.isArray(scheduleData)) {
        await Promise.all(scheduleData.map(entry => {
          // Convert period string like "period1" to integer 1
          const periodNumber = entry.period ? parseInt(entry.period.replace('period', '')) : null;
          
          return Routine.create({
            teacherId,
            day: entry.day,
            period: periodNumber, // Save as integer
            subject: entry.subject || '',
            class: entry.class || ''
          }, { transaction: t });
        }));
      }
      
      // Create a notification for the teacher with required subject field
      await TeacherNotice.create({
        teacherId,
        subject: "Routine Update", // Ensuring subject is provided and not null
        message: "Your teaching schedule has been updated by the administrator. Please check your routine.",
        status: 'pending'
      }, { transaction: t });
      
      return { success: true };
    });
    
    res.json({ 
      message: "Routine updated successfully",
      teacherName: teacher.name,
      routineUpdated: true
    });
  } catch (error) {
    console.error("Error updating routine:", error);
    res.status(500).json({
      message: "Failed to update routine",
      error: error.message
    });
  }
};

export default updateRoutine_controller;
