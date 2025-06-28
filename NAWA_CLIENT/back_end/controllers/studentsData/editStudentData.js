import Student from "../../models/Student.js";

const editStudentController = async (req, res) => {
  try {
    console.log('Edit student request received');
    console.log('Admin user:', req.user);
    console.log('Headers:', req.headers);
    console.log('Cookies:', req.cookies);
    
    // The verifyAdmin middleware already checks admin status
    // We just need to verify we have the data we need
    if (!req.params.id) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Update data is required" });
    }

    console.log("Editing student with ID:", req.params.id);
    console.log("Update data:", req.body);

    // Find student first to check if it exists
    const student = await Student.findByPk(req.params.id);
    
    if (!student) {
      console.log("Student not found with ID:", req.params.id);
      return res.status(404).json({ message: "Student not found" });
    }
    
    console.log("Found student:", student.toJSON());
    
    // Create update data without modifying the password
    const updateData = {
      name: req.body.name,
      grade: req.body.grade,
      section: req.body.section || null,
      fatherName: req.body.fatherName,
      fatherPhone: req.body.fatherPhone,
      motherName: req.body.motherName,
      motherPhone: req.body.motherPhone,
      address: req.body.address,
      email: req.body.email
    };

    // Keep the existing password
    updateData.password = student.password;
    
    console.log("Prepared update data:", updateData);
    
    // Update student data
    const [numUpdated] = await Student.update(updateData, {
      where: { id: req.params.id }
    });
    
    if (numUpdated === 0) {
      console.log("No updates made for student:", req.params.id);
      return res.status(400).json({ message: "No changes were made to the student data" });
    }
    
    const updatedStudent = await Student.findByPk(req.params.id);
    console.log("Successfully updated student:", updatedStudent.toJSON());
    
    // Remove password from response
    const studentResponse = updatedStudent.toJSON();
    delete studentResponse.password;
    
    res.json({ 
      message: "Student updated successfully",
      student: studentResponse
    });
  } catch (error) {
    console.error("Error updating student data:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors.map(e => ({
          field: e.path,
          message: e.message
        }))
      });
    }
    
    res.status(500).json({ 
      message: "Error updating student",
      error: error.message 
    });
  }
};

export default editStudentController;