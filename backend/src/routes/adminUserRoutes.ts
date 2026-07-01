import express from 'express';
import { getUsers, updateUserRole } from '../controllers/adminUserController';
import { protect } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';

const router = express.Router();
router.route('/').get(protect, isAdmin, getUsers);
router.route('/:id/role').put(protect, isAdmin, updateUserRole);

export default router;