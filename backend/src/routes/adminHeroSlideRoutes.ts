import express from 'express';
import {
  getAllHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
} from '../controllers/heroSlideController';
import { protect } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';

const router = express.Router();
router
  .route('/')
  .get(protect, isAdmin, getAllHeroSlides)
  .post(protect, isAdmin, createHeroSlide);
router
  .route('/:id')
  .put(protect, isAdmin, updateHeroSlide)
  .delete(protect, isAdmin, deleteHeroSlide);

export default router;