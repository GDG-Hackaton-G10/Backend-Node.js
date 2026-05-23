import mongoose from 'mongoose';
import Pharmacy from '../models/Pharmacy.js';
import User from '../models/User.js';
import Medicine from '../models/Medicine.js';
import PharmacyMedicine from '../models/PharmacyMedicine.js';
import AppError from '../utils/appError.js';
import { sendSuccess } from '../utils/responseFormatter.js';
import bcrypt from 'bcryptjs';

const parseQueryList = (value) => {
	if (!value) {
		return [];
	}

	if (Array.isArray(value)) {
		return value.flatMap((item) => String(item).split(','));
	}

	return String(value)
		.split(',')
		.map((item) => item.trim())
		.filter(Boolean);
};

const getAvailabilityStatus = (availableCount, requestedCount) => {
	if (!requestedCount) {
		return 'Unknown';
	}

	if (availableCount === 0) {
		return 'Unavailable';
	}

	if (availableCount >= requestedCount) {
		return 'Available';
	}

	return 'Partial';
};

const buildNearbyPipeline = ({ longitude, latitude, radiusKm }) => ([
	{
		$geoNear: {
			near: {
				type: 'Point',
				coordinates: [longitude, latitude],
			},
			distanceField: 'distanceMeters',
			spherical: true,
			maxDistance: radiusKm * 1000,
			key: 'location',
		},
	},
	{
		$match: {
			status: 'approved',
		},
	},
	{
		$project: {
			name: 1,
			ownerId: 1,
			status: 1,
			address: 1,
			openingHours: 1,
			contactInfo: 1,
			location: 1,
			distanceMeters: 1,
			createdAt: 1,
			updatedAt: 1,
		},
	},
]);

export const getNearbyPharmacies = async (req, res, next) => {
	try {
		const latitude = Number(req.query.latitude || req.query.lat);
		const longitude = Number(req.query.longitude || req.query.lng);
		const radiusKm = Math.max(1, Math.min(Number(req.query.radiusKm || req.query.radius || 5), 20));
		const requestedMedicineIds = parseQueryList(req.query.medicineIds || req.query.medicines);

		if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
			return next(new AppError('Latitude and longitude are required', 400, 'VALIDATION_ERROR'));
		}

		const validMedicineObjectIds = requestedMedicineIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
		const requestedMedicineObjectIds = validMedicineObjectIds.map((id) => new mongoose.Types.ObjectId(id));
		const requestedMedicineIdsSet = new Set(validMedicineObjectIds);

		const nearbyPharmacies = await Pharmacy.aggregate(buildNearbyPipeline({ longitude, latitude, radiusKm }));
		const nearbyPharmacyIds = nearbyPharmacies.map((pharmacy) => pharmacy._id);
		const inventoryItems = nearbyPharmacyIds.length
			? await PharmacyMedicine.find({ pharmacyId: { $in: nearbyPharmacyIds } })
				.populate('medicineId', 'name genericName category dosage aliases')
				.lean()
			: [];

		const inventoryMap = inventoryItems.reduce((map, item) => {
			const pharmacyId = item.pharmacyId.toString();
			if (!map.has(pharmacyId)) {
				map.set(pharmacyId, []);
			}

			map.get(pharmacyId).push(item);
			return map;
		}, new Map());

		const medicineLookupIds = requestedMedicineObjectIds.length
			? requestedMedicineObjectIds
			: inventoryItems.map((item) => item.medicineId._id);

		const medicineDocs = medicineLookupIds.length
			? await Medicine.find({ _id: { $in: medicineLookupIds } })
				.select('name genericName category dosage aliases')
				.lean()
			: [];

		const medicineMap = new Map(medicineDocs.map((medicine) => [medicine._id.toString(), medicine]));

		const results = nearbyPharmacies.map((pharmacy) => {
			const inventory = (inventoryMap.get(pharmacy._id.toString()) || []).map((entry) => {
				const medicineId = entry.medicineId._id.toString();
				const medicine = medicineMap.get(medicineId) || entry.medicineId || null;

				return {
					medicine: medicine || { _id: entry.medicineId._id },
					price: entry.price,
					stock: entry.stock,
					availability: Boolean(entry.availability),
				};
			});

			const availableRequestedMedicines = requestedMedicineObjectIds.length
				? inventory.filter((entry) => entry.availability && requestedMedicineIdsSet.has(entry.medicine._id.toString()))
				: [];

			const availableCount = availableRequestedMedicines.length;
			const requestedCount = requestedMedicineObjectIds.length;
			const distanceKm = Number((pharmacy.distanceMeters / 1000).toFixed(2));

			return {
				id: pharmacy._id,
				name: pharmacy.name,
				status: pharmacy.status,
				address: pharmacy.address || null,
				openingHours: pharmacy.openingHours || null,
				contactInfo: pharmacy.contactInfo,
				location: pharmacy.location,
				distanceKm,
				inventory,
				availability: {
					requestedCount,
					availableCount,
					status: getAvailabilityStatus(availableCount, requestedCount),
					summary: requestedCount
						? `${availableCount} out of ${requestedCount} medicines available`
						: 'Medicine availability not requested',
				},
			};
		});

		const mapResults = results.map((pharmacy) => ({
			name: pharmacy.name,
			lat: pharmacy.location?.coordinates?.[1] ?? null,
			lng: pharmacy.location?.coordinates?.[0] ?? null,
			status: pharmacy.status,
			distance: pharmacy.distanceKm,
		}));

		return sendSuccess(res, {
			radiusKm,
			center: { latitude, longitude },
			total: mapResults.length,
			pharmacies: mapResults,
			details: results,
		});
	} catch (error) {
		next(error);
	}
};

export const getPharmacyById = async (req, res, next) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return next(new AppError('Invalid pharmacy id', 400, 'VALIDATION_ERROR'));
		}

		const pharmacy = await Pharmacy.findById(id)
			.lean();

		if (!pharmacy) {
			return next(new AppError('Pharmacy not found', 404, 'PHARMACY_NOT_FOUND'));
		}

		const inventory = await PharmacyMedicine.find({ pharmacyId: pharmacy._id })
			.populate('medicineId', 'name genericName category dosage aliases')
			.lean();

		return sendSuccess(res, {
			id: pharmacy._id,
			name: pharmacy.name,
			ownerId: pharmacy.ownerId,
			status: pharmacy.status,
			address: pharmacy.address || null,
			openingHours: pharmacy.openingHours || null,
			contactInfo: pharmacy.contactInfo,
			location: pharmacy.location,
			inventory: inventory.map((entry) => ({
				id: entry._id,
				medicine: entry.medicineId,
				price: entry.price,
				stock: entry.stock,
				availability: entry.availability,
			})),
			createdAt: pharmacy.createdAt,
			updatedAt: pharmacy.updatedAt,
		});
	} catch (error) {
		next(error);
	}
};

export const createPharmacy = async (req, res, next) => {
	try {
		const { ownerId, ...payload } = req.body;
		const owner = await User.findById(ownerId).lean();

		if (!owner) {
			return next(new AppError('Owner user not found', 404, 'OWNER_NOT_FOUND'));
		}

		if (owner.role !== 'pharmacy') {
			return next(new AppError('Owner must have pharmacy role', 400, 'INVALID_OWNER_ROLE'));
		}

		const pharmacy = await Pharmacy.create({
			...payload,
			ownerId,
			status: payload.status || 'pending',
		});

		return sendSuccess(res, pharmacy, 'Pharmacy created successfully', 201);
	} catch (error) {
		next(error);
	}
};

export const getAllPharmacies = async (req, res, next) => {
	try {
		const pharmacies = await Pharmacy.find().lean();
		return sendSuccess(res, pharmacies, 200);
	} catch (error) {
		next(error);
	}
};

export const updatePharmacy = async (req, res, next) => {
	try {
		const { id } = req.params;
		const updates = { ...req.body };

		if (updates.ownerId) {
			const owner = await User.findById(updates.ownerId).lean();
			if (!owner) {
				return next(new AppError('Owner user not found', 404, 'OWNER_NOT_FOUND'));
			}

			if (owner.role !== 'pharmacy') {
				return next(new AppError('Owner must have pharmacy role', 400, 'INVALID_OWNER_ROLE'));
			}
		}

		const pharmacy = await Pharmacy.findByIdAndUpdate(id, updates, {
			new: true,
			runValidators: true,
		}).lean();

		if (!pharmacy) {
			return next(new AppError('Pharmacy not found', 404, 'PHARMACY_NOT_FOUND'));
		}

		return sendSuccess(res, pharmacy, 'Pharmacy updated successfully');
	} catch (error) {
		next(error);
	}
};

export const deletePharmacy = async (req, res, next) => {
	try {
		const { id } = req.params;

		const pharmacy = await Pharmacy.findByIdAndDelete(id).lean();

		if (!pharmacy) {
			return next(new AppError('Pharmacy not found', 404, 'PHARMACY_NOT_FOUND'));
		}

		await PharmacyMedicine.deleteMany({ pharmacyId: id });

		return sendSuccess(res, null, 'Pharmacy deleted successfully');
	} catch (error) {
		next(error);
	}
};

export const getPharmacyProfile = async (req, res, next) => {
	try {
		const pharmacy = await Pharmacy.findOne({ ownerId: req.user._id }).lean();

		if (!pharmacy) {
			return next(new AppError('Pharmacy not found for this user', 404, 'PHARMACY_NOT_FOUND'));
		}

		return sendSuccess(res, pharmacy, 200);
	} catch (error) {
		next(error);
	}
};

export const updatePharmacyProfile = async (req, res, next) => {
	try {
		const pharmacy = await Pharmacy.findOneAndUpdate(
			{ ownerId: req.user._id },
			{ $set: req.body },
			{ new: true, runValidators: true }
		).lean();

		if (!pharmacy) {
			return next(new AppError('Pharmacy not found for this user', 404, 'PHARMACY_NOT_FOUND'));
		}

		return sendSuccess(res, pharmacy, 'Pharmacy profile updated successfully');
	} catch (error) {
		next(error);
	}
};
