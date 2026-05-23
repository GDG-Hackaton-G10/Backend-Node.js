import express from 'express';
import {
	createPharmacyMedicine,
	deletePharmacyMedicine,
	getPharmacyMedicineById,
	getPharmacyMedicines,
	updatePharmacyMedicineByPut,
	updatePharmacyMedicine,
} from '../controllers/pharmacyMedicineController.js';
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
router.put('/medicines/:id', validateUpdatePharmacyMedicine, updatePharmacyMedicineByPut);
router.patch('/medicines/:id', validateUpdatePharmacyMedicine, updatePharmacyMedicine);
router.delete('/medicines/:id', deletePharmacyMedicine);
router.get('/profile', getPharmacyProfile);
router.put('/profile', updatePharmacyProfile);

export default router;