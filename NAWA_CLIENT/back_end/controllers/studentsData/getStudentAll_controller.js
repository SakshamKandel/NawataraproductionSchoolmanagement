import Student from "../../models/Student.js";

const getStudentAll = async (req, res) => {
  try {
    if (req.admin || req.teacher) {
      // Only allow teachers to see id, name, and grade
      const attributes = req.admin
        ? [
            'id',
            'name',
            'email',
            'grade',
            'section',
            'rollNumber',
            'address',
            'fatherName',
            'fatherPhone',
            'motherName',
            'motherPhone',
            'createdAt',
            'updatedAt'
          ]
        : ['id', 'name', 'grade', 'section'];
      const result = await Student.findAll({
        where: { grade: req.params.class_name },
        attributes,
        order: [['name', 'ASC']]
      });
      res.json(result);
    }
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).send(error.message);
  }
};

export default getStudentAll;