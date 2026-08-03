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
import { optionalAuth } from '../middleware/optionalAuth';
import { validate } from '../middleware/validate';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter';
import {
  registerSchema,
  loginSchema,
  emailOnlySchema,
  resetPasswordSchema,
  changePasswordSchema,
  profileUpdateSchema,
  addressSchema,
} from '../validation/schemas';

const router = express.Router();

// Public routes
router.post('/register', authLimiter, validate(registerSchema), registerUser);
router.post('/login', authLimiter, validate(loginSchema), loginUser);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', authLimiter, validate(emailOnlySchema), resendVerificationEmail);
router.post('/forgot-password', passwordResetLimiter, validate(emailOnlySchema), forgotPassword);
router.post('/reset-password', passwordResetLimiter, validate(resetPasswordSchema), resetPassword);
router.post('/refresh', authLimiter, refreshAccessToken);
router.post('/logout', optionalAuth, logoutUser);
router.post('/logout-all', protect, logoutAllDevices);
router.get('/verify-email-change', verifyEmailChange);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, validate(profileUpdateSchema), updateProfile);
router.put('/change-password', protect, validate(changePasswordSchema), changePassword);
router.post('/change-email', protect, changeEmail);
router.delete('/account', protect, deleteAccount);

// Address management
router.get('/addresses', protect, getAddresses);
router.post('/addresses', protect, validate(addressSchema), addAddress);
router.put('/addresses/:id', protect, validate(addressSchema.partial()), updateAddress);
router.delete('/addresses/:id', protect, deleteAddress);
router.put('/addresses/:id/default', protect, setDefaultAddress);

export default router;
