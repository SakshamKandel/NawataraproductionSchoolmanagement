import Admin from "../../models/Admin.js";
import bcrypt from "bcryptjs";

// Helper function to generate a unique random ID (strictly 4 digits)
async function generateUniqueAdminId() {
  let id;
  let isUnique = false;
  while (!isUnique) {
    // Generate a random number between 1000 and 9999
    id = Math.floor(1000 + Math.random() * 9000); // 1000-9999
    const existingAdmin = await Admin.findByPk(id);
    if (!existingAdmin) {
      isUnique = true;
    }
  }
  return id;
}

const admin_create_controller = async (req, res) => {
  try {
    if (req.admin) { // This checks if the user making the request is an admin
      const { name, email, password, role } = req.body;
      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newAdminId = await generateUniqueAdminId();

      await Admin.create({
        id: newAdminId,
        name,
        email,
        password: hashedPassword,
        role: role || 'admin'
      });
      res.status(201).json({ message: "Admin Account Creation Successful", adminId: newAdminId });
    } else {
      // If req.admin is not populated, it means the requesting user is not authenticated as an admin.
      // This case should ideally be caught by middleware (like verifyAdmin) before reaching here.
      return res.status(403).json({ message: "Forbidden: Only admins can create new admin accounts." });
    }
  } catch (error) {
    console.error("Error creating admin account:", error);
    // Check for SequelizeUniqueConstraintError if email is already taken
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: "Email already in use.", details: error.errors.map(e => e.message) });
    }
    res.status(500).json({ message: "Failed to create admin account", details: error.message });
  }
};

export default admin_create_controller;

