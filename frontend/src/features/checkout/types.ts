// src/features/checkout/types.ts

// Re-exports — single source of truth lives in the slices
export type { CartItem, CartState } from "../cart/cartSlice";
export type { IAddress, User } from "../auth/authSlice";

// ─── Payment methods ──────────────────────────────────────────────────────────
export type PaymentMethodId = "paystack" | "bank_transfer";

// ─── Order status (matches backend) ───────────────────────────────────────────
export type OrderStatus =
  | "Pending"
  | "Paid"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

// ─── Bank transfer details returned by the backend on order creation ──────────
export interface BankDetails {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
}

// ─── Order response from POST /orders ─────────────────────────────────────────
export interface OrderResponse {
  _id: string;
  orderRef: string;
  status: OrderStatus;
  totalPrice: number;
  paymentMethod: PaymentMethodId;
  trackingNumber?: string;
  createdAt: string;
}

// ─── Full create-order API response ───────────────────────────────────────────
export interface CreateOrderResponse {
  success: boolean;
  order: OrderResponse;
  trackingToken: string;
  // Paystack-only
  paymentUrl?: string;
  reference?: string;
  // Bank-transfer-only
  whatsappUrl?: string;
  paymentDetails?: BankDetails;
}

// ─── Form data ────────────────────────────────────────────────────────────────
export interface CheckoutFormData {
  address: string;
  city: string;
}

export interface PersistState {
  _persist: { version: number; rehydrated: boolean };
}