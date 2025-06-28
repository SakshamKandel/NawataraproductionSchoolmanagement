import Routine from "../../models/Routine.js";

const routine_fetch_controller = async (req, res) => {
  try {
    let teacherId;
    
    if (req.params.id) {
      // Admin accessing a specific teacher's routine
      if (req.admin) {
        teacherId = req.params.id;
      } else {
        return res.status(403).send("Unauthorized access");
      }
    } else {
      // Teacher accessing their own routine
      teacherId = req.user.id;
    }
    
    const routines = await Routine.findAll({
      where: { teacherId },
      order: [
        ['day', 'ASC'],
        ['period', 'ASC']
      ]
    });
    
    res.send(routines);
  } catch (error) {
    console.error("Error fetching routines:", error);
    res.status(500).send(error.message);
  }
};

export default routine_fetch_controller;
