import mongoose, { Document, Schema } from "mongoose";

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

// ─── Structured cancellation reasons ───────────────────────────────────────────
export const CANCEL_REASONS = [
  "payment_not_received",
  "payment_amount_mismatch",
  "customer_requested",
  "item_out_of_stock",
  "suspected_fraud",
  "other",
] as const;

export type CancelReason = (typeof CANCEL_REASONS)[number];

// ─── Main Order interface ──────────────────────────────────────────────────────
export interface IOrder extends Document {
  user: mongoose.Types.ObjectId | null;
  guestEmail?: string;
  name?: string;
  phone?: string;
  email?: string;

  /** Human-readable order reference, e.g. SHX-2026-00042 */
  orderRef: string;

  /** Courier tracking number — assigned when the order ships */
  trackingNumber?: string;

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
  shippingFee?: number;
  status: "Pending" | "Paid" | "Shipped" | "Delivered" | "Cancelled";
  paymentResult?: { id: string; status: string; update_time: string };
  paymentMethod?: "paystack" | "bank_transfer";
  paymentDetails?: {
    accountNumber?: string;
    bankName?: string;
    accountName?: string;
    whatsappNumber?: string;
  };

  // Webhook idempotency & failure tracking
  paymentEventId?: string;
  paymentEventType?: string;
  paymentFailReason?: string;
  paystackReference?: string;

  // Audit trail — who confirmed payment, when
  paymentConfirmedBy?: mongoose.Types.ObjectId | null;
  paymentConfirmedAt?: Date | null;

  couponCode?: string;
  discount?: number;
  shippingInfo?: IShippingInfo;
  notes?: string;
  adminNotes?: string;
  isGift?: boolean;
  giftMessage?: string;
  customFields?: Map<string, any>;
  trackingToken?: string;
  trackingTokenExpiresAt?: Date;

  // Cancellation audit
  cancellationReason?: CancelReason | string;
  /** Optional internal note alongside the structured reason — not shown to customer */
  cancellationNote?: string;
  cancelledAt?: Date;
  cancelledBy?: mongoose.Types.ObjectId | null;

  createdAt: Date;
  updatedAt: Date;
}

// ─── Order item sub-schema ─────────────────────────────────────────────────────
const OrderItemSchema = new Schema({
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  price: { type: Number, required: true },
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  image: { type: String },
  variant: {
    sku: String,
    color: String,
    size: String,
  },
});

// ─── Shipping info schema ──────────────────────────────────────────────────────
const ShippingInfoSchema = new Schema(
  {
    weight: { type: Number },
    weightUnit: { type: String },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: String,
    },
    shippingClass: { type: String },
    freeShipping: { type: Boolean, default: false },
    trackingNumber: { type: String },
    carrier: { type: String },
  },
  { _id: false },
);

// ─── Main Order schema ─────────────────────────────────────────────────────────
const OrderSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", default: null },
    guestEmail: {
      type: String,
      required: function (this: any) {
        return this.user === null;
      },
    },
    name: { type: String },
    phone: { type: String },
    email: { type: String },

    // ─── Human-readable reference ────────────────────────────────────────
    orderRef: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    trackingNumber: { type: String, unique: true, sparse: true },

    orderItems: { type: [OrderItemSchema], required: true },

    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: String,
      country: String,
      phone: String,
      email: String,
    },

    totalPrice: { type: Number, required: true },
    subtotal: { type: Number },
    taxAmount: { type: Number, default: 0 },
    taxRate: { type: Number },
    shippingFee: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["Pending", "Paid", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    paymentResult: { id: String, status: String, update_time: String },
    paymentMethod: {
      type: String,
      enum: ["paystack", "bank_transfer"],
    },
    paymentDetails: {
      accountNumber: String,
      bankName: String,
      accountName: String,
      whatsappNumber: String,
    },

    // ─── Webhook idempotency & failure tracking ──────────────────────────
    paymentEventId: { type: String },
    paymentEventType: { type: String },
    paymentFailReason: { type: String },
    paystackReference: { type: String, index: true, sparse: true },

    // ─── Payment confirmation audit trail ────────────────────────────────
    paymentConfirmedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    paymentConfirmedAt: { type: Date, default: null },

    couponCode: { type: String },
    discount: { type: Number, default: 0 },

    shippingInfo: { type: ShippingInfoSchema, default: () => ({}) },

    notes: { type: String },
    adminNotes: { type: String },

    isGift: { type: Boolean, default: false },
    giftMessage: { type: String },

    customFields: { type: Map, of: Schema.Types.Mixed },

    // ─── Token-based tracking ────────────────────────────────────────────
    trackingToken: { type: String, index: true },
    trackingTokenExpiresAt: { type: Date },

    // ─── Cancellation audit ──────────────────────────────────────────────
    cancellationReason: { type: String },
    cancellationNote: { type: String },
    cancelledAt: { type: Date },
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ guestEmail: 1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ "orderItems.product": 1 });
OrderSchema.index({ paymentMethod: 1 });
OrderSchema.index({ paymentEventId: 1 });
OrderSchema.index({ trackingToken: 1 });
OrderSchema.index({ orderRef: 1 });

export const Order = mongoose.model<IOrder>("Order", OrderSchema);