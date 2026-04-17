import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    imageUrl: {
        type: String,
        required: true,
    },
    ocrText: {
        type: String
    },
    medicines: [{
        name: {
            type: String,
            required: true
        },
        dosage: String,
        frequency: String,
        confidence: Number,
        matchedMedicine: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Medicine'
        }
    }],
    status: {
        type: String,
        enum: ['uploaded', 'processed', 'edited'],
        default: 'uploaded'
    }
}, {
    timestamps: true
});

const Prescription = mongoose.model('Prescription', prescriptionSchema);
export default Prescription;