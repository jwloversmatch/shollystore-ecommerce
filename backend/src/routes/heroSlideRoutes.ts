import express from 'express';
import { getHeroSlides } from '../controllers/heroSlideController';

const router = express.Router();
router.get('/', getHeroSlides);

export default router;