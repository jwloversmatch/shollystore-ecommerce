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

  router.post('/webhook', express.raw({ type: 'application/json' }), paystackWebhook);
  router.get('/verify/:reference', protect, verifyPayment);
  router.route('/').post(protect, checkoutLimiter, validate(createOrderSchema), createOrder);
  router.get('/my-orders', protect, getMyOrders);

  export default router;
