import express from 'express';
import { protect, } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon } from '../controllers/couponController';

const router = express.Router();

router.route('/')
  .get(protect, isAdmin, getCoupons)
  .post(protect, isAdmin, createCoupon);

router.route('/:id')
  .put(protect, isAdmin, updateCoupon)
  .delete(protect, isAdmin, deleteCoupon);

router.post('/validate', validateCoupon);

export default router;