// middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { PaystackError, ValidationError } from '../services/paystack.service';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Log full error for debugging
  console.error('🔥', err);

  if (err instanceof ValidationError) {
    return res.status(400).json({
      status: false,
      message: err.message,
    });
  }

  if (err instanceof PaystackError) {
    // Operational error – safe to expose a generic message
    const statusCode = err.statusCode || 502;
    return res.status(statusCode).json({
      status: false,
      message: 'Payment processing failed. Please try again.',
    });
  }

  // Unexpected error – do not leak details
  return res.status(500).json({
    status: false,
    message: 'Internal server error',
  });
}