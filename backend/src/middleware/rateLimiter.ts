import rateLimit from 'express-rate-limit';

const jsonHandler = (message: string) => ({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message },
});

/** General API rate limit */
export const apiLimiter = rateLimit({
  ...jsonHandler('Too many requests. Please try again later.'),
  max: 300,
});

/** Auth endpoints — strict */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: { success: false, message: 'Too many authentication attempts. Try again in 15 minutes.' },
});

/** Password reset — very strict */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many password reset requests. Try again later.' },
});

/** Checkout / order creation */
export const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many checkout attempts. Please wait before trying again.' },
});

/** Coupon validation */
export const couponLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many coupon validation attempts.' },
});
