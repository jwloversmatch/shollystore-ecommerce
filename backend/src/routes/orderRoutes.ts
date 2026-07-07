// routes/orderRoutes.ts
import express from 'express';
import {
  createOrder,
  paystackWebhook,
  verifyPayment,   
  getMyOrders,
} from '../controllers/orderController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Webhook – Paystack sends raw JSON here (no global JSON parsing)
router.post('/webhook', express.raw({ type: 'application/json' }), paystackWebhook);

// Payment verification – called by the frontend after Paystack redirects back
router.get('/verify/:reference', protect, verifyPayment);

// Orders
router.route('/').post(protect, createOrder);
router.get('/my-orders', protect, getMyOrders);

export default router;