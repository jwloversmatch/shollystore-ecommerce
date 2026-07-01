import express from 'express';
import { getSettings, updateSettings } from '../controllers/adminSettingsController';
import { protect } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';

const router = express.Router();
router.route('/')
  .get(protect, isAdmin, getSettings)
  .put(protect, isAdmin, updateSettings);

export default router;