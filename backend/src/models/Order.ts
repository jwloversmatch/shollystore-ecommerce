import mongoose, { Document, Schema } from 'mongoose';

// ─── Order item interface ──────────────────────────────────────────────────────
export interface IOrderItem {
  name: string;
  qty: number;
  price: number;
  product: mongoose.Types.ObjectId;
  image?: string;
  variant?: {
    sku?: string;
    color?: string;
    size?: string;
  };
}

// ─── Shipping info interface ───────────────────────────────────────────────────
export interface IShippingInfo {
  weight?: number;
  weightUnit?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  shippingClass?: string;
  freeShipping?: boolean;
  trackingNumber?: string;
  carrier?: string;
}

// ─── Main Order interface ──────────────────────────────────────────────────────
export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  name?: string;
  phone?: string;
  email?: string;
  orderItems: IOrderItem[];
  shippingAddress: {
    address: string;
    city: string;
    postalCode?: string;
    country?: string;
    phone?: string;
    email?: string;
  };
  totalPrice: number;
  subtotal?: number;
  taxAmount?: number;
  taxRate?: number;
  status: 'Pending' | 'Paid' | 'Shipped' | 'Delivered';
  paymentResult?: { id: string; status: string; update_time: string };
  paymentMethod?: 'paystack' | 'bank_transfer' | 'whatsapp';
  paymentDetails?: {
    accountNumber?: string;
    bankName?: string;
    whatsappNumber?: string;
  };
  couponCode?: string;
  discount?: number;
  shippingInfo?: IShippingInfo;
  notes?: string;
  adminNotes?: string;
  isGift?: boolean;
  giftMessage?: string;
  customFields?: Map<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Order item sub-schema ─────────────────────────────────────────────────────
const OrderItemSchema = new Schema({
  name:       { type: String, required: true },
  qty:        { type: Number, required: true },
  price:      { type: Number, required: true },
  product:    { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  image:      { type: String },
  variant: {
    sku:   String,
    color: String,
    size:  String,
  },
});

// ─── Shipping info schema ──────────────────────────────────────────────────────
const ShippingInfoSchema = new Schema({
  weight:       { type: Number },
  weightUnit:   { type: String },
  dimensions:   {
    length: Number,
    width:  Number,
    height: Number,
    unit:   String,
  },
  shippingClass:{ type: String },
  freeShipping: { type: Boolean, default: false },
  trackingNumber: { type: String },
  carrier:        { type: String },
}, { _id: false });

// ─── Main Order schema ─────────────────────────────────────────────────────────
const OrderSchema: Schema = new Schema({
  user:         { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name:         { type: String },
  phone:        { type: String },
  email:        { type: String },

  orderItems:   { type: [OrderItemSchema], required: true },

  shippingAddress: {
    address:    { type: String, required: true },
    city:       { type: String, required: true },
    postalCode: String,
    country:    String,
    phone:      String,
    email:      String,
  },

  totalPrice:   { type: Number, required: true },
  subtotal:     { type: Number },
  taxAmount:    { type: Number, default: 0 },
  taxRate:      { type: Number },

  status:       { type: String, enum: ['Pending', 'Paid', 'Shipped', 'Delivered'], default: 'Pending' },
  paymentResult: { id: String, status: String, update_time: String },
  paymentMethod: { type: String, enum: ['paystack', 'bank_transfer', 'whatsapp'] },
  paymentDetails: {
    accountNumber: String,
    bankName:      String,
    whatsappNumber: String,
  },

  couponCode:   { type: String },
  discount:     { type: Number, default: 0 },

  shippingInfo: { type: ShippingInfoSchema, default: () => ({}) },

  notes:        { type: String },
  adminNotes:   { type: String },

  isGift:       { type: Boolean, default: false },
  giftMessage:  { type: String },

  customFields: { type: Map, of: Schema.Types.Mixed },
}, { timestamps: true });

// ---------- Indexes ----------
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ 'orderItems.product': 1 });
OrderSchema.index({ paymentMethod: 1 });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);