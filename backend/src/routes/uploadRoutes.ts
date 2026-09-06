import express from 'express';
import { uploadImage } from '../controllers/uploadController';
import { protect } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';

const router = express.Router();

// Admin-only upload (for product images, etc.)
router.post('/', protect, isAdmin, uploadImage);

// User upload for reviews, avatars, etc.
router.post('/review-image', protect, uploadImage);

export default router;