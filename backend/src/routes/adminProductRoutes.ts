import express from 'express';
import { createProduct, updateProduct, deleteProduct } from '../controllers/adminProductController';
import { protect } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';

const router = express.Router();

router.route('/')
  .post(protect, isAdmin, createProduct);

router.route('/:id')
  .put(protect, isAdmin, updateProduct)
  .delete(protect, isAdmin, deleteProduct);

export default router;