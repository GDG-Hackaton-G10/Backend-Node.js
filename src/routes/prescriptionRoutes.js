import express from "express";
import upload from "../middleware/upload.js";
import {
  uploadPrescription,
  getPrescriptionById,
  getUserPrescriptions,
  updateMedicines,
} from "../controllers/prescriptionController.js";

import ownership from "../middleware/ownershipMiddleware.js";

const router = express.Router();

router.post("/upload", upload.single("image"), uploadPrescription);

router.get("/:id", ownership, getPrescriptionById);

router.get("/user/:userId", getUserPrescriptions);

router.patch("/:id/medicines", ownership, updateMedicines);

export default router;