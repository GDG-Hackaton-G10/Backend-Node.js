import mongoose from "mongoose";

const prescriptionMedicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    dosage: String,
    frequency: String,
    confidence: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    matchedMedicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      default: null,
    },
    matchedInDatabase: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    imageUrl: {
      type: String,
      required: true,
    },

    ocrText: {
      type: String,
    },
    ocrRawText: {
      type: String,
    },
    medicines: [prescriptionMedicineSchema],
    extractedMedicines: [prescriptionMedicineSchema],

    status: {
      type: String,
      enum: ["uploaded", "processed", "edited"],
      default: "uploaded",
    },
  },
  {
    timestamps: true,
  }
);

const Prescription = mongoose.model("Prescription", prescriptionSchema);

export default Prescription;
