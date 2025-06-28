import express from "express";
import editStudentController from "../../../controllers/studentsData/editStudentData.js";
import { verifyAdmin } from "../../../middleware/auth.js";

const edit_student = express.Router();

edit_student.patch("/:id", verifyAdmin, editStudentController);

export default edit_student;