import express from 'express';
import { searchMedicines, getMedicineById } from '../controllers/medicineController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/search', searchMedicines);
router.get('/:id', getMedicineById);

export default router;
