import mongoose from 'mongoose';
import Pharmacy from '../models/Pharmacy.js';
import PharmacyMedicine from '../models/PharmacyMedicine.js';
import Medicine from '../models/Medicine.js';
import AppError from '../utils/appError.js';
import { sendSuccess } from '../utils/responseFormatter.js';

const getOwnedPharmacy = async (ownerId) => {
  return Pharmacy.findOne({ ownerId }).lean();
};

const assertObjectId = (value, message) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new AppError(message, 400, 'VALIDATION_ERROR');
  }
};

const serializeInventoryItem = (item) => ({
  id: item._id,
  pharmacyId: item.pharmacyId,
  medicineId: item.medicineId,
  medicine: item.medicineId && typeof item.medicineId === 'object' ? item.medicineId : null,
  price: item.price,
  stock: item.stock,
  availability: item.availability,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

const getOwnedInventoryItem = async (ownerId, inventoryId) => {
  const pharmacy = await getOwnedPharmacy(ownerId);

  if (!pharmacy) {
    return { pharmacy: null, item: null };
  }

  const item = await PharmacyMedicine.findOne({ _id: inventoryId, pharmacyId: pharmacy._id })
    .populate('medicineId', 'name genericName category')
    .lean();

  return { pharmacy, item };
};

export const getPharmacyMedicines = async (req, res, next) => {
  try {
    const pharmacy = await getOwnedPharmacy(req.user._id);

    if (!pharmacy) {
      return next(new AppError('Pharmacy not found for this user', 404, 'PHARMACY_NOT_FOUND'));
    }

    const items = await PharmacyMedicine.find({ pharmacyId: pharmacy._id })
      .populate('medicineId', 'name genericName category')
      .lean();

    return sendSuccess(res, items.map(serializeInventoryItem), 200);
  } catch (error) {
    next(error);
  }
};

export const getPharmacyMedicineById = async (req, res, next) => {
  try {
    const { id } = req.params;
    assertObjectId(id, 'Invalid pharmacy medicine id');

    const { pharmacy, item } = await getOwnedInventoryItem(req.user._id, id);

    if (!pharmacy) {
      return next(new AppError('Pharmacy not found for this user', 404, 'PHARMACY_NOT_FOUND'));
    }

    if (!item) {
      return next(new AppError('Pharmacy medicine not found', 404, 'PHARMACY_MEDICINE_NOT_FOUND'));
    }

    return sendSuccess(res, serializeInventoryItem(item), 200);
  } catch (error) {
    next(error);
  }
};

export const createPharmacyMedicine = async (req, res, next) => {
  try {
    const pharmacy = await getOwnedPharmacy(req.user._id);

    if (!pharmacy) {
      return next(new AppError('Pharmacy not found for this user', 404, 'PHARMACY_NOT_FOUND'));
    }

    const { medicineId, price, stock, availability } = req.body;
    assertObjectId(medicineId, 'Invalid medicine id');

    const medicine = await Medicine.findById(medicineId).lean();

    if (!medicine) {
      return next(new AppError('Medicine not found', 404, 'MEDICINE_NOT_FOUND'));
    }

    const inventoryItem = await PharmacyMedicine.create({
      pharmacyId: pharmacy._id,
      medicineId,
      price,
      stock,
      availability,
    });

    const populatedItem = await PharmacyMedicine.findById(inventoryItem._id)
      .populate('medicineId', 'name genericName category')
      .lean();

    return sendSuccess(res, serializeInventoryItem(populatedItem), 'Medicine added to pharmacy inventory', 201);
  } catch (error) {
    if (error?.code === 11000) {
      return next(new AppError('Medicine already exists in this pharmacy inventory', 409, 'DUPLICATE_INVENTORY_ITEM'));
    }

    next(error);
  }
};

export const updatePharmacyMedicine = async (req, res, next) => {
  try {
    const pharmacy = await getOwnedPharmacy(req.user._id);

    if (!pharmacy) {
      return next(new AppError('Pharmacy not found for this user', 404, 'PHARMACY_NOT_FOUND'));
    }

    export const updatePharmacyMedicineByPut = updatePharmacyMedicine;

    const { id } = req.params;
    assertObjectId(id, 'Invalid pharmacy medicine id');

    const updatedItem = await PharmacyMedicine.findOneAndUpdate(
      { _id: id, pharmacyId: pharmacy._id },
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate('medicineId', 'name genericName category')
      .lean();

    if (!updatedItem) {
      return next(new AppError('Pharmacy medicine not found', 404, 'PHARMACY_MEDICINE_NOT_FOUND'));
    }

    return sendSuccess(res, serializeInventoryItem(updatedItem), 'Medicine inventory updated');
  } catch (error) {
    next(error);
  }
};

export const deletePharmacyMedicine = async (req, res, next) => {
  try {
    const pharmacy = await getOwnedPharmacy(req.user._id);

    if (!pharmacy) {
      return next(new AppError('Pharmacy not found for this user', 404, 'PHARMACY_NOT_FOUND'));
    }

    const { id } = req.params;
    assertObjectId(id, 'Invalid pharmacy medicine id');

    const deletedItem = await PharmacyMedicine.findOneAndDelete({ _id: id, pharmacyId: pharmacy._id }).lean();

    if (!deletedItem) {
      return next(new AppError('Pharmacy medicine not found', 404, 'PHARMACY_MEDICINE_NOT_FOUND'));
    }

    return sendSuccess(res, null, 'Medicine removed from pharmacy inventory');
  } catch (error) {
    next(error);
  }
};