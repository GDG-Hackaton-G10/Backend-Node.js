import Medicine from '../models/Medicine.js';
import MedicineRequest from '../models/MedicineRequest.js';
import Pharmacy from '../models/Pharmacy.js';
import AppError from '../utils/appError.js';
import { sendSuccess } from '../utils/responseFormatter.js';

const normalize = (value) => String(value || '').trim().toLowerCase();

const buildMedicinePayload = ({ name, genericName, dosage, category, aliases = [] }) => ({
  name: String(name || '').trim(),
  genericName: genericName ? String(genericName).trim() : String(name || '').trim(),
  dosage: dosage ? String(dosage).trim() : '',
  category: category ? String(category).trim() : '',
  aliases: Array.isArray(aliases) ? aliases.map((alias) => String(alias).trim()).filter(Boolean) : [],
});

const findExistingMedicine = async (payload) => {
  const normalizedName = normalize(payload.name);
  const normalizedGenericName = normalize(payload.genericName || payload.name);

  return Medicine.findOne({
    $or: [
      { name: new RegExp(`^${payload.name}$`, 'i') },
      { genericName: new RegExp(`^${payload.genericName || payload.name}$`, 'i') },
      { aliases: { $in: payload.aliases } },
    ],
  }).lean();
};

export const createMedicineRequest = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findOne({ ownerId: req.user._id }).lean();

    if (!pharmacy) {
      return next(new AppError('Pharmacy not found for this user', 404, 'PHARMACY_NOT_FOUND'));
    }

    const payload = buildMedicinePayload(req.body);

    if (!payload.name) {
      return next(new AppError('Medicine name is required', 400, 'VALIDATION_ERROR'));
    }

    const request = await MedicineRequest.create({
      requesterId: req.user._id,
      ...payload,
      notes: req.body.notes || '',
    });

    return sendSuccess(res, request, 'Medicine request submitted successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getMyMedicineRequests = async (req, res, next) => {
  try {
    const requests = await MedicineRequest.find({ requesterId: req.user._id })
      .populate('medicineId', 'name genericName dosage category aliases')
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, requests, 200);
  } catch (error) {
    next(error);
  }
};

export const getAllMedicineRequests = async (req, res, next) => {
  try {
    const requests = await MedicineRequest.find()
      .populate('requesterId', 'name email role')
      .populate('medicineId', 'name genericName dosage category aliases')
      .populate('reviewedBy', 'name email role')
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, requests, 200);
  } catch (error) {
    next(error);
  }
};

export const reviewMedicineRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return next(new AppError('Status must be approved or rejected', 400, 'VALIDATION_ERROR'));
    }

    const request = await MedicineRequest.findById(id);

    if (!request) {
      return next(new AppError('Medicine request not found', 404, 'MEDICINE_REQUEST_NOT_FOUND'));
    }

    if (status === 'approved') {
      const payload = buildMedicinePayload(request);
      let medicine = await findExistingMedicine(payload);

      if (!medicine) {
        medicine = await Medicine.create(payload);
      }

      request.status = 'approved';
      request.medicineId = medicine._id;
    } else {
      request.status = 'rejected';
    }

    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    if (notes) {
      request.notes = String(notes).trim();
    }

    await request.save();

    const populatedRequest = await MedicineRequest.findById(request._id)
      .populate('requesterId', 'name email role')
      .populate('medicineId', 'name genericName dosage category aliases')
      .populate('reviewedBy', 'name email role')
      .lean();

    return sendSuccess(res, populatedRequest, `Medicine request ${status} successfully`);
  } catch (error) {
    next(error);
  }
};