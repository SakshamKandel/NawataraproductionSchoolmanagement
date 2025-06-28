import express from "express";
import { verifyAdmin } from "../../../middleware/auth.js";
import getFeeController from "../../../controllers/studentsData/getFeeController.js";

const get_fee=express.Router();

get_fee.get("/:id", verifyAdmin, getFeeController);

export default get_fee