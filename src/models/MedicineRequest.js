import mongoose from 'mongoose';

const medicineRequestSchema = new mongoose.Schema({
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100,
  },
  genericName: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  dosage: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  category: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  aliases: [{
    type: String,
    trim: true,
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true,
  },
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    default: null,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  reviewedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

medicineRequestSchema.index({ requesterId: 1, status: 1 });

const MedicineRequest = mongoose.model('MedicineRequest', medicineRequestSchema);

export default MedicineRequest;