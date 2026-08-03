import express from 'express';
import { protect } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';
import { sendMarketingEmail } from '../controllers/adminMarketingController';
import { auditLog } from '../middleware/securityLogger';

const router = express.Router();

router.use(protect, isAdmin);
router.post('/send', auditLog('marketing_email_send'), sendMarketingEmail);

export default router;
