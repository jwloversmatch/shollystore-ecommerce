// src/features/checkout/hooks/useOrderSubmit.ts

import { useState } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { useCreateOrderMutation } from "../../api/apiSlice";
import {
  clearCart,
  type CartItem,
  type CartState,
} from "../../cart/cartSlice";
import type { User } from "../../auth/authSlice";
import type {
  BankDetails,
  CheckoutFormData,
  CreateOrderResponse,
  IAddress,
  OrderResponse,
  PaymentMethodId,
} from "../types";

export interface SubmittedOrder extends OrderResponse {
  whatsappUrl?: string;
  paymentDetails?: BankDetails;
  trackingToken?: string;
}

interface Params {
  cart: CartState;
  user: User | null;
  guestEmail: string;
  guestName: string;
  guestPhone: string;
  paymentMethod: PaymentMethodId;
  isNewAddress: boolean;
  selectedSavedAddress: IAddress | undefined;
  isRehydrated: boolean | undefined;
  onNeedsAccount: () => void;
}

export const useOrderSubmit = ({
  cart,
  user,
  guestEmail,
  guestName,
  guestPhone,
  paymentMethod,
  isNewAddress,
  selectedSavedAddress,
  isRehydrated,
  onNeedsAccount,
}: Params) => {
  const dispatch = useDispatch();
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [order, setOrder] = useState<SubmittedOrder | null>(null);

  const submit = async (data: CheckoutFormData) => {
    if (!user && isRehydrated && !guestEmail.trim()) {
      toast.error("Email is required for guest checkout");
      return;
    }

    try {
      const finalShippingAddress =
        selectedSavedAddress && !isNewAddress
          ? {
              address: selectedSavedAddress.address,
              city: selectedSavedAddress.city,
              postalCode: selectedSavedAddress.postalCode || "",
              country: selectedSavedAddress.country || "Nigeria",
            }
          : {
              address: data.address,
              city: data.city,
              postalCode: "",
              country: "Nigeria",
            };

      const orderPayload = {
        orderItems: cart.cartItems.map((item: CartItem) => ({
          product: item._id,
          name: item.name,
          qty: item.qty,
          price: item.price,
          image: item.image,
        })),
        shippingAddress: finalShippingAddress,
        paymentMethod,
        couponCode: cart.appliedCoupon || undefined,
        ...(user
          ? {}
          : {
              guestEmail: guestEmail.trim(),
              name: guestName.trim() || undefined,
              phone: guestPhone.trim() || undefined,
            }),
      };

      const result: CreateOrderResponse =
        await createOrder(orderPayload).unwrap();
      dispatch(clearCart());

      // Paystack → redirect to hosted checkout; we never see the success state
      if (paymentMethod === "paystack") {
        if (!result.paymentUrl) {
          toast.error("Payment gateway did not return a URL. Please try again.");
          return;
        }
        window.location.assign(result.paymentUrl);
        return;
      }

      // Bank transfer → capture the order and show the pending view
      setOrder({
        ...result.order,
        whatsappUrl: result.whatsappUrl,
        paymentDetails: result.paymentDetails,
        trackingToken: result.trackingToken,
      });

      if (!user) {
        onNeedsAccount();
      }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      toast.error(
        e?.data?.message || "Failed to place order. Please try again.",
      );
    }
  };

  return { submit, isLoading, order };
};