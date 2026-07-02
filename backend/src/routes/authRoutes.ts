import express from 'express';
import { registerUser, loginUser, verifyEmail, resendVerificationEmail, updateProfile } from '../controllers/authController';
import { protect } from '../middleware/auth';   

const router = express.Router();
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.put('/profile', protect, updateProfile); 

export default router;