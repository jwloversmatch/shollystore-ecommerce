import express from 'express';
import { registerUser, loginUser, verifyEmail, resendVerificationEmail, updateProfile, getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress, } from '../controllers/authController';
import { protect } from '../middleware/auth';   

const router = express.Router();
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.put('/profile', protect, updateProfile); 
router.get('/addresses', protect, getAddresses);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:id', protect, updateAddress);
router.delete('/addresses/:id', protect, deleteAddress);
router.put('/addresses/:id/default', protect, setDefaultAddress);

export default router;