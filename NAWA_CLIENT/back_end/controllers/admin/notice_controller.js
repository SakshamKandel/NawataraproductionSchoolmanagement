import Notice from "../../models/Notice.js";
import Admin from "../../models/Admin.js";
import Teacher from "../../models/Teacher.js";

const noticeController = async (req, res) => {
  try {
    console.log("Creating notice with data:", req.body);
    
    const { title, content, forTeachers, forStudents } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    // Create notice using Sequelize
    const result = await Notice.create({
      adminId: req.admin.id,
      title: title,
      content: content,
      forTeachers: Boolean(forTeachers),  // Ensure boolean value
      forStudents: Boolean(forStudents),  // Ensure boolean value
      publishDate: new Date()
    });
    
    console.log("Created notice:", JSON.stringify(result.toJSON(), null, 2));
    
    res.status(201).json({ 
      message: "Notice created successfully", 
      notice: {
        id: result.id,
        title: result.title,
        content: result.content,
        forTeachers: result.forTeachers,
        forStudents: result.forStudents
      }
    });
  } catch (error) {
    console.error("Error in notice controller:", error);
    res.status(500).json({
      message: "Failed to create notice",
      error: error.message
    });
  }
};

export default noticeController;
