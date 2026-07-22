import express from 'express';
import { getCategories, getCategoryTree } from '../controllers/categoryController';

const router = express.Router();
router.get('/', getCategories);
router.get('/tree', getCategoryTree);   

export default router;