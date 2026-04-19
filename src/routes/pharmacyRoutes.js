import express from 'express';
import { getNearbyPharmacies, getPharmacyById } from '../controllers/pharmacyController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/nearby', getNearbyPharmacies);
router.get('/:id', getPharmacyById);

export default router;
