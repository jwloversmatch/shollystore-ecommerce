import rateLimit from 'express-rate-limit';
import { Request } from 'express';

const jsonHandler = (message: string) => ({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message },
});

const cronAllowedIps = (process.env.CRON_ALLOWED_IPS || '')
  .split(',')
  .map((ip) => ip.trim())
  .filter(Boolean);

const cronSkipPaths = (process.env.CRON_SKIP_RATE_LIMIT_PATHS || '/api/health,/api/ping,/ping')
  .split(',')
  .map((p) => p.trim())
  .filter(Boolean);

/** Skip rate limiting for webhooks, health checks, and cron job IPs/paths */
export const shouldSkipRateLimit = (req: Request): boolean => {
  const path = req.path || '';
  const originalUrl = req.originalUrl || '';

  if (path.includes('/webhook') || originalUrl.includes('/webhook')) {
    return true;
  }

  if (cronSkipPaths.some((p) => path === p || originalUrl.startsWith(p))) {
    return true;
  }

  const clientIp = req.ip || req.socket?.remoteAddress || '';
  if (clientIp && cronAllowedIps.some((ip) => clientIp === ip || clientIp.endsWith(`:${ip}`))) {
    return true;
  }

  return false;
};

/** General API rate limit */
export const apiLimiter = rateLimit({
  ...jsonHandler('Too many requests. Please try again later.'),
  max: 500,
  skip: shouldSkipRateLimit,
});

/** Auth endpoints — strict */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skip: shouldSkipRateLimit,
  message: { success: false, message: 'Too many authentication attempts. Try again in 15 minutes.' },
});

/** Password reset — very strict */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: shouldSkipRateLimit,
  message: { success: false, message: 'Too many password reset requests. Try again later.' },
});

/** Checkout / order creation */
export const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: shouldSkipRateLimit,
  message: { success: false, message: 'Too many checkout attempts. Please wait before trying again.' },
});

/** Coupon validation */
export const couponLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: shouldSkipRateLimit,
  message: { success: false, message: 'Too many coupon validation attempts.' },
});
