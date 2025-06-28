import Teacher from '../../models/Teacher.js';

const salaryViewController = async (req, res) => {
  try {
    if (req.admin) {
      const result = await Teacher.findByPk(req.params.id);
      res.json(result);
    } else {
      res.status(403).json({ message: "Unauthorized access" });
    }
  } catch (error) {
    res.status(504).send(error.message);
  }
};

export default salaryViewController;
