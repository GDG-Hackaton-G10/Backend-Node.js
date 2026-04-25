import Prescription from "../models/Prescription.js";
import AppError from "../utils/appError.js";

const ownership = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return next(
        new AppError("Prescription not found", 404, "PRESCRIPTION_NOT_FOUND")
      );
    }

    if (!req.user) {
      return next(new AppError("Not authenticated", 401));
    }

    const userId = req.user._id?.toString() || req.user.id;
    const isOwner = prescription.userId.toString() === userId;
    const isPrivileged = ["admin", "pharmacy_manager"].includes(req.user.role);

    if (!isOwner && !isPrivileged) {
      return next(
        new AppError(
          "You do not have permission to access this prescription",
          403,
          "FORBIDDEN"
        )
      );
    }

    req.prescription = prescription;
    next();
  } catch (error) {
    next(error);
  }
};

export default ownership;
