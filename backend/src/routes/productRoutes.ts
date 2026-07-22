import express from 'express';
import { getProducts, getProductBySlug } from '../controllers/productController';

const router = express.Router();

router.route('/').get(getProducts);
router.get('/:slug', getProductBySlug);   

export default router;