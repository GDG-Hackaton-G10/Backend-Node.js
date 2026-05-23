import express from 'express';
import { createStaffUser, getAllUsers, updateUser } from '../controllers/authController.js';
import { createPharmacy, deletePharmacy, getAllPharmacies, getPharmacyById, updatePharmacy } from '../controllers/pharmacyController.js';
import { getAllMedicineRequests, reviewMedicineRequest } from '../controllers/medicineRequestController.js';
import { adminMiddleware, protect } from '../middlewares/authMiddleware.js';
import { validateCreatePharmacy, validateCreateStaffUser, validateUpdatePharmacy, validateUpdateUser } from '../middlewares/validator.js';

const router = express.Router();

router.use(protect, adminMiddleware);

router.get('/pharmacies', getAllPharmacies);
router.get('/pharmacies/:id', getPharmacyById);
router.post('/users', validateCreateStaffUser, createStaffUser);
router.post('/pharmacies', validateCreatePharmacy, createPharmacy);
router.put('/pharmacies/:id', validateUpdatePharmacy, updatePharmacy);
router.delete('/pharmacies/:id', deletePharmacy);
router.get('/users', getAllUsers);
router.put('/users/:id', validateUpdateUser, updateUser);
router.get('/medicine-requests', getAllMedicineRequests);
router.patch('/medicine-requests/:id', reviewMedicineRequest);

export default router;