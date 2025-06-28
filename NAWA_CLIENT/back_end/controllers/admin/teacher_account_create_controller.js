import Teacher from '../../models/Teacher.js';
import bcrypt from 'bcryptjs';

const teacher_acc_create = async (req, res) => {
  try {
    if (!req.admin) {
      return res.status(403).json({ message: "Only admin can create teacher accounts" });
    }

    // Check for required fields
    const requiredFields = ['name', 'email', 'password'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Validation Error",
        details: [`Missing required fields: ${missingFields.join(', ')}`]
      });
    }

    // Check if teacher with email already exists
    const existingTeacher = await Teacher.findOne({ where: { email: req.body.email } });
    if (existingTeacher) {
      return res.status(400).json({ 
        message: "A teacher with this email already exists",
        details: "Please use a different email address or check if the teacher is already registered"
      });
    }

    // Hash the password before saving
    const saltRounds = 10; // Or your preferred salt rounds
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    // Create new teacher account
    const result = await Teacher.create({
      ...req.body,
      password: hashedPassword
    });

    res.status(201).json({ 
      message: "Teacher Account Creation Successful",
      teacherId: result.id
    });
  } catch (error) {
    console.error("Teacher creation error:", error);
    res.status(500).json({ 
      message: "Failed to create teacher account",
      details: error.message
    });
  }
};

export default teacher_acc_create;

// New function to change teacher password
export const changeTeacherPassword = async (req, res) => {
  try {
    if (!req.admin) {
      return res.status(403).json({ message: "Only admins can change teacher passwords" });
    }

    const { teacherId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.trim() === "") {
      return res.status(400).json({ message: "New password cannot be empty" });
    }

    const teacher = await Teacher.findByPk(teacherId);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Hash the new password
    const saltRounds = 10; // Or your preferred salt rounds
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the teacher's password
    teacher.password = hashedPassword;
    await teacher.save();

    res.status(200).json({ message: "Teacher password updated successfully" });

  } catch (error) {
    console.error("Error changing teacher password:", error);
    res.status(500).json({
      message: "Failed to change teacher password",
      details: error.message
    });
  }
};
