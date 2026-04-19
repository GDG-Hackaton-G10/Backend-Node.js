import mongoose from "mongoose";

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

    ocrRawText: {
      type: String,
    },

    extractedMedicines: [
      {
        name: {
          type: String,
          required: true,
        },
        dosage: String,
        frequency: String,
        confidence: {
          type: String, 
          default: "medium",
        },
        matchedInDatabase: {
          type: Boolean,
          default: false,
        },
      },
    ],

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