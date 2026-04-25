import express from "express";
import { extractMedicines } from "../controllers/prescriptController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();


router.post("/extract-medicines", protect, extractMedicines);

export default router;