import express from 'express';
import {
  getAllOrders,
  updateOrderStatus,
  getSalesAnalytics,
  getTopProducts,
  getCustomerCount,
  getUniqueOrderCustomers,
  getAdminStats,
} from '../controllers/adminOrderController';
import { protect } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';

const router = express.Router();

// ✅ Dashboard stats – returns { orders, totalRevenue } (excludes Pending)
router.route('/').get(protect, isAdmin, getAdminStats);

// ✅ Paginated orders list – returns { orders, total, page, totalPages, totalRevenue }
router.route('/all').get(protect, isAdmin, getAllOrders);

// Other routes
router.route('/:id/status').put(protect, isAdmin, updateOrderStatus);
router.route('/analytics').get(protect, isAdmin, getSalesAnalytics);
router.route('/analytics/top-products').get(protect, isAdmin, getTopProducts);
router.route('/analytics/customers').get(protect, isAdmin, getCustomerCount);
router.route('/analytics/order-customers').get(protect, isAdmin, getUniqueOrderCustomers);

export default router;