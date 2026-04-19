import Prescription from "../models/Prescription.js";

const ownership = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

   
    if (!req.user) {
      req.user = { id: prescription.userId.toString() };
    }

    if (prescription.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default ownership;