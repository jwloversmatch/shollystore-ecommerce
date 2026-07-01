import express from 'express';
import { uploadImage } from '../controllers/uploadController';
import { protect } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';

const router = express.Router();
// Only admins can upload images
router.post('/', protect, isAdmin, uploadImage);

export default router; 