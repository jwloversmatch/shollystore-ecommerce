import express from 'express';
import { getProducts, getProductBySlug, getProductSuggestions  } from '../controllers/productController';

const router = express.Router();

router.route('/').get(getProducts);

router.get('/suggestions', getProductSuggestions);
router.get('/:slug', getProductBySlug);   

export default router;