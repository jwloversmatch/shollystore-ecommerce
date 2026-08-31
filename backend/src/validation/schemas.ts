import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const registerSchema = z.object({
  email: z.string().email('Invalid email address').max(254).transform((e: string) => e.trim().toLowerCase()),
  password: passwordSchema,
  name: z.string().max(100).optional().transform((v: string | undefined) => v?.trim() ?? ''),
  phone: z.string().max(20).optional().transform((v: string | undefined) => v?.trim() ?? ''),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').max(254).transform((e: string) => e.trim().toLowerCase()),
  password: z.string().min(1, 'Password is required').max(128),
});

export const emailOnlySchema = z.object({
  email: z.string().email('Invalid email address').max(254).transform((e: string) => e.trim().toLowerCase()),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required').max(128),
  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: passwordSchema,
});

export const profileUpdateSchema = z.object({
  name: z.string().max(100).optional().transform((v: string | undefined) => v?.trim()),
  phone: z.string().max(20).optional().transform((v: string | undefined) => v?.trim()),
});

export const addressSchema = z.object({
  label: z.string().max(50).default('Home'),
  address: z.string().min(1, 'Address is required').max(500),
  city: z.string().min(1, 'City is required').max(100),
  postalCode: z.string().max(20).optional().default(''),
  country: z.string().max(100).optional().default(''),
  isDefault: z.boolean().optional().default(false),
});

export const orderItemSchema = z.object({
  _id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid product ID'),
  name: z.string().max(200),
  qty: z.number().int().min(1).max(100),
  price: z.number().min(0),
  image: z.string().url().optional().or(z.literal('')),
  variant: z
    .object({
      sku: z.string().max(100).optional(),
      color: z.string().max(50).optional(),
      size: z.string().max(50).optional(),
    })
    .optional(),
});

export const createOrderSchema = z.object({
  orderItems: z.array(orderItemSchema).min(1, 'At least one item is required'),
  shippingAddress: z.object({
    address: z.string().min(1).max(500),
    city: z.string().min(1).max(100),
    postalCode: z.string().max(20).optional(),
    country: z.string().max(100).optional(),
  }),
  paymentMethod: z.enum(['paystack', 'bank_transfer', 'whatsapp']).default('paystack'),
  couponCode: z.string().max(50).optional(),
  notes: z.string().max(1000).optional(),
  isGift: z.boolean().optional().default(false),
  giftMessage: z.string().max(500).optional(),
  shippingInfo: z.record(z.string(), z.unknown()).optional(),

  // Guest checkout fields (optional)
  guestEmail: z.string().email('Invalid email').max(254).optional(),
  name: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
});

export const validateCouponSchema = z.object({
  code: z.string().min(1).max(50).transform((c: string) => c.trim().toUpperCase()),
  orderTotal: z.number().min(0),
});

export const mongoIdSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID'),
});