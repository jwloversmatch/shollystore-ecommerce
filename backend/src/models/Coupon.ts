import mongoose, { Document, Schema } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountAmount: number;
  minOrderAmount?: number;
  isActive: boolean;
  expiresAt?: Date;
  usageLimit?: number;
  usedCount: number;
  createdAt: Date;
}

const CouponSchema: Schema = new Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountAmount: { type: Number, required: true },
  minOrderAmount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date },
  usageLimit: { type: Number, default: 0 },
  usedCount: { type: Number, default: 0 },
}, { timestamps: true });

CouponSchema.index({ code: 1 });

export const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema);