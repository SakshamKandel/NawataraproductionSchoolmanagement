import Student from '../../models/Student.js';

const removeStudentController = async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(403).json({ message: "Only admin can remove students" });
        }

        const studentId = req.params.id;
        
        // Delete the student
        const deletedCount = await Student.destroy({ where: { id: studentId } });
        
        if (!deletedCount) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.json({ message: "Student removed successfully" });
    } catch (error) {
        console.error("Error removing student:", error);
        res.status(500).json({ message: error.message });
    }
};

export default removeStudentController; 