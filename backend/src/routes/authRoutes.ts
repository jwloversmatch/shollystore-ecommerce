import express from 'express';
import {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerificationEmail,
  updateProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  refreshAccessToken,
  logoutUser,
  logoutAllDevices,
  getMe,
  changeEmail,
  verifyEmailChange,
  deleteAccount,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh', refreshAccessToken);            // refresh token (public with token)
router.post('/logout', logoutUser);                     // may or may not be authenticated, but token is optional
router.post('/logout-all', protect, logoutAllDevices);   // authenticated
router.get('/verify-email-change', verifyEmailChange);   // public token verification

// Protected routes (require authentication)
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/change-email', protect, changeEmail);
router.delete('/account', protect, deleteAccount);

// Address management (protected)
router.get('/addresses', protect, getAddresses);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:id', protect, updateAddress);
router.delete('/addresses/:id', protect, deleteAddress);
router.put('/addresses/:id/default', protect, setDefaultAddress);

export default router;