import express from 'express';
import {
  createOrder,
  paystackWebhook,
  verifyPayment,
  getMyOrders,
} from '../controllers/orderController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { checkoutLimiter } from '../middleware/rateLimiter';
import { createOrderSchema } from '../validation/schemas';

const router = express.Router();

// Webhook – public (no auth) but uses raw body for signature verification
router.post('/webhook', express.raw({ type: 'application/json' }), paystackWebhook);

// Payment verification – keep protected for now (only logged-in users need this)
router.get('/verify/:reference', protect, verifyPayment);

// Create order – public (guest checkout allowed)
router.route('/').post(checkoutLimiter, validate(createOrderSchema), createOrder);

// My orders – still protected
router.get('/my-orders', protect, getMyOrders);

export default router;