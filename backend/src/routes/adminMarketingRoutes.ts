import express from 'express';
import { protect } from '../middleware/auth';
import { sendMarketingEmail } from '../controllers/adminMarketingController';
import { isAdmin } from '../middleware/isAdmin'; 

const router = express.Router();

// All routes are protected and admin-only
router.use(protect);
router.post('/send', sendMarketingEmail, isAdmin);

export default router;