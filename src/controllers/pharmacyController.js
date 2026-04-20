import mongoose from "mongoose";
import Pharmacy from "../models/Pharmacy.js";
import Medicine from "../models/Medicine.js";
import AppError from "../utils/appError.js";
import { sendSuccess } from "../utils/responseFormatter.js";

const parseQueryList = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => String(item).split(","));
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const getAvailabilityStatus = (availableCount, requestedCount) => {
  if (!requestedCount) {
    return "Unknown";
  }

  if (availableCount === 0) {
    return "Unavailable";
  }

  if (availableCount >= requestedCount) {
    return "Available";
  }

  return "Partial";
};

const buildNearbyPipeline = ({ longitude, latitude, radiusKm }) => [
  {
    $geoNear: {
      near: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      distanceField: "distanceMeters",
      spherical: true,
      maxDistance: radiusKm * 1000,
      key: "location",
    },
  },
  {
    $project: {
      name: 1,
      address: 1,
      openingHours: 1,
      contactInfo: 1,
      location: 1,
      medicines: 1,
      distanceMeters: 1,
      createdAt: 1,
      updatedAt: 1,
    },
  },
];

export const getNearbyPharmacies = async (req, res, next) => {
  try {
    const latitude = Number(req.query.latitude || req.query.lat);
    const longitude = Number(req.query.longitude || req.query.lng);
    const radiusKm = Math.max(
      1,
      Math.min(Number(req.query.radiusKm || req.query.radius || 5), 20)
    );
    const requestedMedicineIds = parseQueryList(
      req.query.medicineIds || req.query.medicines
    );

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return next(
        new AppError("Latitude and longitude are required", 400, "VALIDATION_ERROR")
      );
    }

    const validMedicineObjectIds = requestedMedicineIds.filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );
    const requestedMedicineObjectIds = validMedicineObjectIds.map(
      (id) => new mongoose.Types.ObjectId(id)
    );
    const requestedMedicineIdsSet = new Set(validMedicineObjectIds);

    const nearbyPharmacies = await Pharmacy.aggregate(
      buildNearbyPipeline({ longitude, latitude, radiusKm })
    );

    const medicineLookupIds = requestedMedicineObjectIds.length
      ? requestedMedicineObjectIds
      : nearbyPharmacies.flatMap((pharmacy) =>
          pharmacy.medicines.map((item) => item.medicine)
        );

    const medicineDocs = medicineLookupIds.length
      ? await Medicine.find({ _id: { $in: medicineLookupIds } })
          .select("name genericName category dosage aliases")
          .lean()
      : [];

    const medicineMap = new Map(
      medicineDocs.map((medicine) => [medicine._id.toString(), medicine])
    );

    const results = nearbyPharmacies.map((pharmacy) => {
      const inventory = pharmacy.medicines.map((entry) => {
        const medicineId = entry.medicine.toString();
        const medicine = medicineMap.get(medicineId) || null;

        return {
          medicine: medicine || { _id: entry.medicine },
          inStock: Boolean(entry.inStock),
          quantity: entry.quantity || 0,
        };
      });

      const availableRequestedMedicines = requestedMedicineObjectIds.length
        ? inventory.filter(
            (entry) =>
              entry.inStock &&
              requestedMedicineIdsSet.has(entry.medicine._id.toString())
          )
        : [];

      const availableCount = availableRequestedMedicines.length;
      const requestedCount = requestedMedicineObjectIds.length;
      const distanceKm = Number((pharmacy.distanceMeters / 1000).toFixed(2));

      return {
        id: pharmacy._id,
        name: pharmacy.name,
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
            : "Medicine availability not requested",
        },
      };
    });

    const mapResults = results.map((pharmacy) => ({
      name: pharmacy.name,
      lat: pharmacy.location?.coordinates?.[1] ?? null,
      lng: pharmacy.location?.coordinates?.[0] ?? null,
      type: "Verified",
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
      return next(new AppError("Invalid pharmacy id", 400, "VALIDATION_ERROR"));
    }

    const pharmacy = await Pharmacy.findById(id)
      .populate("medicines.medicine", "name genericName category dosage aliases")
      .lean();

    if (!pharmacy) {
      return next(new AppError("Pharmacy not found", 404, "PHARMACY_NOT_FOUND"));
    }

    const inventory = pharmacy.medicines.map((entry) => ({
      medicine: entry.medicine,
      inStock: Boolean(entry.inStock),
      quantity: entry.quantity || 0,
    }));

    return sendSuccess(res, {
      id: pharmacy._id,
      name: pharmacy.name,
      address: pharmacy.address || null,
      openingHours: pharmacy.openingHours || null,
      contactInfo: pharmacy.contactInfo,
      location: pharmacy.location,
      inventory,
      createdAt: pharmacy.createdAt,
      updatedAt: pharmacy.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};
