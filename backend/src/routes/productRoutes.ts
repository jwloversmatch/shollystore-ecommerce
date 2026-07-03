import express from 'express';
import { getProducts } from '../controllers/productController';
import { getProductBySlug } from '../controllers/productController';

const router = express.Router();
router.route('/').get(getProducts);
router.get('/products/:slug', getProductBySlug);

export default router;