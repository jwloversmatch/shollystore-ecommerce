import express from 'express';
import { subscribe, unsubscribe, sendNotification } from '../controllers/pushController';
import { protect } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';

const router = express.Router();

router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);
router.post('/send', protect, isAdmin, sendNotification);   

export default router;