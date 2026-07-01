import express from 'express';
import { updateStock } from '../controllers/adminInventoryController';
import { protect } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';

const router = express.Router();
router.route('/:id').put(protect, isAdmin, updateStock);

export default router;