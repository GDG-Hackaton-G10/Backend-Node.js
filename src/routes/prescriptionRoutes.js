import express from "express";
import upload from "../middlewares/uploadMiddleware.js";
import { protect } from "../middlewares/authMiddleware.js";
import {
  uploadPrescription,
  getPrescriptionById,
  getUserPrescriptions,
  updateMedicines,
} from "../controllers/prescriptionController.js";
import ownership from "../middlewares/ownershipMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/upload", upload.single("image"), uploadPrescription);

router.get("/user/:userId", getUserPrescriptions);

router.get("/:id", ownership, getPrescriptionById);

router.patch("/:id/medicines", ownership, updateMedicines);

export default router;
