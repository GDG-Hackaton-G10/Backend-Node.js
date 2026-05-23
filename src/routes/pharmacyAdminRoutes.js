import express from 'express';
import {
	createPharmacyMedicine,
	deletePharmacyMedicine,
	getPharmacyMedicineById,
	getPharmacyMedicines,
	updatePharmacyMedicine,
} from '../controllers/pharmacyMedicineController.js';
import {
	createMedicineRequest,
	getMyMedicineRequests,
} from '../controllers/medicineRequestController.js';
import { getPharmacyProfile, updatePharmacyProfile } from '../controllers/pharmacyController.js';
import { pharmacyMiddleware, protect } from '../middlewares/authMiddleware.js';
import {
	validateCreatePharmacyMedicine,
	validateUpdatePharmacyMedicine,
} from '../middlewares/validator.js';

const router = express.Router();

router.use(protect, pharmacyMiddleware);

router.get('/medicines', getPharmacyMedicines);
router.get('/medicines/:id', getPharmacyMedicineById);
router.post('/medicines', validateCreatePharmacyMedicine, createPharmacyMedicine);
router.put('/medicines/:id', validateUpdatePharmacyMedicine, updatePharmacyMedicine);
router.patch('/medicines/:id', validateUpdatePharmacyMedicine, updatePharmacyMedicine);
router.delete('/medicines/:id', deletePharmacyMedicine);
router.get('/profile', getPharmacyProfile);
router.put('/profile', updatePharmacyProfile);
router.get('/medicine-requests', getMyMedicineRequests);
router.post('/medicine-requests', createMedicineRequest);

export default router;