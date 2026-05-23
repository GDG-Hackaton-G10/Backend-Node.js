import mongoose from 'mongoose';

const pharmacyMedicineSchema = new mongoose.Schema({
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    required: true,
    index: true,
  },
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true,
    index: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  stock: {
    type: Number,
    default: 0,
    min: 0,
  },
  availability: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

pharmacyMedicineSchema.index({ pharmacyId: 1, medicineId: 1 }, { unique: true });

const PharmacyMedicine = mongoose.model('PharmacyMedicine', pharmacyMedicineSchema);
export default PharmacyMedicine;