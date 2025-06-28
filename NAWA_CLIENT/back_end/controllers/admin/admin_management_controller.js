import Admin from '../../models/Admin.js';
import bcrypt from 'bcryptjs';

// Get all admin accounts
export const getAllAdmins = async (req, res) => {
  try {
    let admins = await Admin.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'], // Specify attributes to return
      order: [['createdAt', 'DESC']], // Optional: order by creation date
    });

    // If the logged-in admin is 'admin@gmail.com' or 'admin@nawataraenglishschool.com', filter out developer
    if (req.admin && (req.admin.email === 'admin@gmail.com' || req.admin.email === 'admin@nawataraenglishschool.com')) {
      admins = admins.filter(admin => 
        admin.email !== 'developer@gmail.com' && 
        admin.email !== 'developer@nawataraenglishschool.com'
      );
    }
    // If the logged-in admin is 'developer@gmail.com' or 'developer@nawataraenglishschool.com', show all admins
    // (no filter needed)

    res.status(200).json(admins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ message: "Failed to fetch admin accounts", details: error.message });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const adminToDeleteId = parseInt(req.params.id, 10);
    const requestingAdmin = req.admin; // Populated by verifyAdmin middleware

    // Rule 1: Prevent self-deletion
    if (requestingAdmin.id === adminToDeleteId) {
      return res.status(403).json({ message: "You cannot delete your own account." });
    }    // Rule 2: Prevent anyone from deleting the main admin account
    const adminToVerify = await Admin.findByPk(adminToDeleteId);
    const isMainAdminAccount = adminToVerify && (
      adminToVerify.email === 'admin@gmail.com' || 
      adminToVerify.email === 'admin@nawataraenglishschool.com'
    );
    const isDeveloperAccount = requestingAdmin.email === 'developer@gmail.com' || 
                              requestingAdmin.email === 'developer@nawataraenglishschool.com';
    
    if(isMainAdminAccount && !isDeveloperAccount) {
        return res.status(403).json({ message: "The main admin account can only be deleted by developer." });
    }

    // Rule 3: Specific restriction for admin trying to delete developer
    const isAdminAccount = requestingAdmin.email === 'admin@gmail.com' || 
                          requestingAdmin.email === 'admin@nawataraenglishschool.com';
    if (isAdminAccount) {
      const adminData = await Admin.findByPk(adminToDeleteId);
      const isTargetDeveloper = adminData && (
        adminData.email === 'developer@gmail.com' || 
        adminData.email === 'developer@nawataraenglishschool.com'
      );
      if (isTargetDeveloper) {
        return res.status(403).json({ message: "Admin cannot delete developer account." });
      }
    }

    // Proceed with deletion
    const admin = await Admin.findByPk(adminToDeleteId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    await admin.destroy();
    res.status(200).json({ message: "Admin account deleted successfully." });

  } catch (error) {
    console.error("Error deleting admin:", error);
    res.status(500).json({ message: "Failed to delete admin account", details: error.message });
  }
};

export const changeOwnPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const requestingAdmin = req.admin; // Populated by verifyAdmin middleware

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old password and new password are required." });
    }

    if (newPassword.length < 6) { // Example: Enforce minimum password length
        return res.status(400).json({ message: "New password must be at least 6 characters long." });
    }

    // Verify old password
    const admin = await Admin.findByPk(requestingAdmin.id);
    if (!admin) {
      // This should not happen if verifyAdmin worked correctly
      return res.status(404).json({ message: "Admin account not found." });
    }

    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect old password." });
    }

    // Hash and update new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    admin.password = hashedNewPassword;
    await admin.save();

    res.status(200).json({ message: "Password changed successfully." });

  } catch (error) {
    console.error("Error changing own password:", error);
    res.status(500).json({ message: "Failed to change password", details: error.message });
  }
};

export const resetOtherAdminPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const adminToResetId = parseInt(req.params.id, 10);
    const requestingAdmin = req.admin; // Populated by verifyAdmin middleware

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required." });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long." });
    }

    // Rule 1: Prevent using this route to change one's own password
    if (requestingAdmin.id === adminToResetId) {
      return res.status(403).json({ message: "Please use the 'change own password' feature for your account." });
    }

    const adminToReset = await Admin.findByPk(adminToResetId);
    if (!adminToReset) {
      return res.status(404).json({ message: "Target admin account not found." });
    }

    // Rule 2: Prevent resetting admin account's password, *unless* requester is developer
    const isMainAdminToReset = adminToReset.email === 'admin@gmail.com' || 
                              adminToReset.email === 'admin@nawataraenglishschool.com';
    const isDeveloperRequester = requestingAdmin.email === 'developer@gmail.com' || 
                                requestingAdmin.email === 'developer@nawataraenglishschool.com';
    
    if (isMainAdminToReset && !isDeveloperRequester) {
      return res.status(403).json({ message: "Only developer can reset the main admin account password." });
    }

    // Rule 3: Prevent admin from resetting developer's password
    const isAdminRequester = requestingAdmin.email === 'admin@gmail.com' || 
                            requestingAdmin.email === 'admin@nawataraenglishschool.com';
    const isDeveloperToReset = adminToReset.email === 'developer@gmail.com' || 
                              adminToReset.email === 'developer@nawataraenglishschool.com';
    
    if (isAdminRequester && isDeveloperToReset) {
      return res.status(403).json({ message: "Admin cannot reset developer's password." });
    }

    // Hash and update new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    adminToReset.password = hashedNewPassword;
    await adminToReset.save();

    res.status(200).json({ message: `Password for admin ${adminToReset.email} reset successfully.` });

  } catch (error) {
    console.error("Error resetting other admin's password:", error);
    res.status(500).json({ message: "Failed to reset password", details: error.message });
  }
}; 