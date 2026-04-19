import Prescription from "../models/Prescription.js";
import cloudinary from "../utils/cloudinary.js";

export const uploadPrescription = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    const result = await cloudinary.uploader.upload(file.path);

    const prescription = await Prescription.create({
      userId: req.user?.id || "64b2c3d4e5f6a1b2c3d4e5f6",
      imageUrl: result.secure_url,
      status: "uploaded",
    });

    res.status(201).json({
      success: true,
      prescriptionId: prescription._id,
      imageUrl: result.secure_url,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    res.json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserPrescriptions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const prescriptions = await Prescription.find({
      userId: req.params.userId,
    })
      .limit(Number(limit))
      .skip((page - 1) * limit);

    res.json({
      success: true,
      data: prescriptions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMedicines = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    prescription.extractedMedicines = req.body.medicines;
    prescription.status = "edited";

    await prescription.save();

    res.json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};