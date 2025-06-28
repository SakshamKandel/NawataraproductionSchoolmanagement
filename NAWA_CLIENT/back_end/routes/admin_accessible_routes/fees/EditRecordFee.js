import express from "express";
import edit_record_fee_controller from "../../../controllers/admin/edit_record_fee_controller.js";
import { verifyAdmin } from "../../../middleware/auth.js";

const edit_record_fee=express.Router();

edit_record_fee.patch("/:id", verifyAdmin, edit_record_fee_controller);


export default edit_record_fee;