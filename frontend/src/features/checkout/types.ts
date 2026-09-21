// src/features/checkout/types.ts

// Re-exports — single source of truth lives in the slices
export type { CartItem, CartState } from "../cart/cartSlice";
export type { IAddress, User } from "../auth/authSlice";

// Checkout-specific types
export interface OrderResponse {
  _id: string;
  trackingNumber?: string;
  trackingToken?: string;
}

export type PaymentMethodId = "paystack" | "bank_transfer" | "whatsapp";

export interface CheckoutFormData {
  address: string;
  city: string;
}

export interface PersistState {
  _persist: { version: number; rehydrated: boolean };
}