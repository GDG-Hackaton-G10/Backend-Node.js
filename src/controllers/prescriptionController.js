import Prescription from "../models/Prescription.js";
import cloudinary from "../utils/cloudinary.js";
import AppError from "../utils/appError.js";
import { sendSuccess } from "../utils/responseFormatter.js";

const normalizeMedicines = (medicines = []) =>
  medicines.map((medicine) => ({
    name: medicine.name,
    dosage: medicine.dosage,
    frequency: medicine.frequency,
    confidence: medicine.confidence ?? null,
    matchedMedicine: medicine.matchedMedicine || null,
    matchedInDatabase: Boolean(
      medicine.matchedInDatabase ?? medicine.matchedMedicine
    ),
  }));

export const uploadPrescription = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError("No image uploaded", 400, "VALIDATION_ERROR"));
    }

    const result = await cloudinary.uploader.upload(req.file.path);

    const prescription = await Prescription.create({
      userId: req.user.id,
      imageUrl: result.secure_url,
      status: "uploaded",
    });

    return sendSuccess(
      res,
      {
        prescriptionId: prescription._id,
        imageUrl: result.secure_url,
      },
      "Prescription uploaded successfully",
      201
    );
  } catch (error) {
    next(error);
  }
};

export const getPrescriptionById = async (req, res, next) => {
  try {
    const prescription =
      req.prescription || (await Prescription.findById(req.params.id).lean());

    if (!prescription) {
      return next(
        new AppError("Prescription not found", 404, "PRESCRIPTION_NOT_FOUND")
      );
    }

    return sendSuccess(res, prescription, 200);
  } catch (error) {
    next(error);
  }
};

export const getUserPrescriptions = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const pageNumber = Math.max(Number(req.query.page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const requestingUserId = req.user._id?.toString() || req.user.id;
    const isPrivileged = ["admin", "pharmacy_manager"].includes(req.user.role);

    if (!isPrivileged && requestingUserId !== userId) {
      return next(
        new AppError(
          "You do not have permission to view these prescriptions",
          403,
          "FORBIDDEN"
        )
      );
    }

    const [prescriptions, total] = await Promise.all([
      Prescription.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limitNumber)
        .skip((pageNumber - 1) * limitNumber)
        .lean(),
      Prescription.countDocuments({ userId }),
    ]);

    return sendSuccess(res, {
      items: prescriptions,
      page: pageNumber,
      limit: limitNumber,
      total,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMedicines = async (req, res, next) => {
  try {
    if (!Array.isArray(req.body.medicines)) {
      return next(
        new AppError("Medicines must be provided as an array", 400, "VALIDATION_ERROR")
      );
    }

    const prescription = req.prescription || (await Prescription.findById(req.params.id));

    if (!prescription) {
      return next(
        new AppError("Prescription not found", 404, "PRESCRIPTION_NOT_FOUND")
      );
    }

    const medicines = normalizeMedicines(req.body.medicines);

    prescription.medicines = medicines;
    prescription.extractedMedicines = medicines;
    prescription.status = "edited";

    await prescription.save();

    return sendSuccess(
      res,
      prescription,
      "Prescription medicines updated successfully"
    );
  } catch (error) {
    next(error);
  }
};
