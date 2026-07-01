import express from 'express';
import { createOrder, paystackWebhook } from '../controllers/orderController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Webhook MUST be public (no protect), because Paystack calls it
router.post('/webhook', express.raw({ type: 'application/json' }), paystackWebhook);

// Protect the create order route so only logged-in users can order
router.route('/').post(protect, createOrder);

export default router;