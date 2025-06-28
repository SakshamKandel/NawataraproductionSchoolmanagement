import express from "express"
import { verifyToken, verifyRoles } from "../../middleware/auth.js";
import Teacher from "../../models/Teacher.js";
import { Op } from 'sequelize';

const fetch_teachers = express.Router()

fetch_teachers.get("/", verifyToken, verifyRoles(['Admin', 'Teacher']), async(req, res) => {
    try {
        console.log("Fetching teachers...");
        const result = await Teacher.findAll({
            attributes: { exclude: ['password'] }
        });
        res.json(result);
    } catch (error) {
        console.error("Error fetching teachers:", error);
        res.status(500).json({ 
            message: "Failed to fetch teachers", 
            error: error.message 
        });
    }
})

export default fetch_teachers;