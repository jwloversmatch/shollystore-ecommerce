import express from 'express';
import { createCategory, updateCategory, deleteCategory } from '../controllers/categoryController';
import { protect } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';

const router = express.Router();
router.route('/')
  .post(protect, isAdmin, createCategory);
router.route('/:id')
  .put(protect, isAdmin, updateCategory)
  .delete(protect, isAdmin, deleteCategory);

export default router;