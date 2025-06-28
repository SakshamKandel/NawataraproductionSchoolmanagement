import express from "express";
import { verifyAdmin } from "../../../middleware/auth.js";
import class_fee_structController from "../../../controllers/admin/class_fee_struct_controller.js";
import edit_class_fee_struct_Controller from "../../../controllers/admin/edit_classFee_controller.js";
import createUpdateClassFeeController from "../../../controllers/admin/create_class_fee_structure.js";
import listClassFeeStructuresController from "../../../controllers/admin/list_class_fee_structures.js";

const class_fee_struct = express.Router();

// Get fee structure for a specific class
class_fee_struct.get("/structure/fees/:class_name", verifyAdmin, class_fee_structController);

// Edit existing fee structure for a class
class_fee_struct.patch("/edit/fee/:class_name", verifyAdmin, edit_class_fee_struct_Controller);

// Create or update a fee structure
class_fee_struct.post("/structure/fees", verifyAdmin, createUpdateClassFeeController);

// List all fee structures
class_fee_struct.get("/structure/fees", verifyAdmin, listClassFeeStructuresController);

export default class_fee_struct;