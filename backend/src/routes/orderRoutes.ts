import express from 'express';
import {
  createOrder,
  paystackWebhook,
  verifyPayment,
  getMyOrders,
  trackMyOrder,
  trackByToken,
  trackOrderManual,
  trackMyOrderByCode,
} from '../controllers/orderController';
import { protect } from '../middleware/auth';
import { optionalAuth } from '../middleware/optionalAuth';
import { validate } from '../middleware/validate';
import { checkoutLimiter } from '../middleware/rateLimiter';
import { createOrderSchema } from '../validation/schemas';

const router = express.Router();

// Webhook – public (no auth) but uses raw body for signature verification
router.post('/webhook', express.raw({ type: 'application/json' }), paystackWebhook);

// Payment verification – protected
router.get('/verify/:reference', protect, verifyPayment);

// Create order – public (guest checkout allowed)
router.route('/').post(checkoutLimiter, optionalAuth, validate(createOrderSchema), createOrder);

// My orders – protected
router.get('/my-orders', protect, getMyOrders);

// ─── Manual tracking (POST) ───────────────────────────────────────────────
// Guest manual: requires tracking code and email in body
router.post('/track', trackOrderManual);

// Logged-in manual: requires tracking code only
router.post('/track/me', protect, trackMyOrderByCode);

// ─── Token-based tracking (public) ────────────────────────────────────────
router.get('/track/:token', trackByToken);

// ─── Authenticated tracking by order ID (logged-in) ───────────────────────
router.get('/:orderId/track', protect, trackMyOrder);

export default router;