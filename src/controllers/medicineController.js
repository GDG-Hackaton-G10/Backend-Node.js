import mongoose from "mongoose";
import Medicine from "../models/Medicine.js";
import AppError from "../utils/appError.js";
import { sendSuccess } from "../utils/responseFormatter.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const searchMedicines = async (req, res, next) => {
  try {
    const query = String(req.query.q || req.query.query || "").trim();
    const limit = Math.min(Number(req.query.limit) || 10, 25);

    if (!query) {
      return next(new AppError("Search query is required", 400, "VALIDATION_ERROR"));
    }

    const safeQuery = escapeRegex(query);
    const searchConditions = [
      { name: { $regex: `^${safeQuery}`, $options: "i" } },
      { genericName: { $regex: `^${safeQuery}`, $options: "i" } },
      { aliases: { $regex: safeQuery, $options: "i" } },
    ];

    const medicines = await Medicine.find({ $or: searchConditions })
      .select("name genericName dosage category aliases")
      .limit(limit)
      .lean();

    return sendSuccess(res, medicines, 200);
  } catch (error) {
    next(error);
  }
};

export const getMedicineById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError("Invalid medicine id", 400, "VALIDATION_ERROR"));
    }

    const medicine = await Medicine.findById(id).lean();

    if (!medicine) {
      return next(new AppError("Medicine not found", 404, "MEDICINE_NOT_FOUND"));
    }

    return sendSuccess(res, medicine, 200);
  } catch (error) {
    next(error);
  }
};
