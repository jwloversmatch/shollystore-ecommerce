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
  CheckoutFormData,
  IAddress,
  OrderResponse,
  PaymentMethodId,
} from "../types";

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
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderData, setOrderData] = useState<OrderResponse | null>(null);

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
          stock: item.stock,
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

      const result = await createOrder(orderPayload).unwrap();
      dispatch(clearCart());

      if (paymentMethod === "paystack") {
        window.location.assign(result.paymentUrl);
        return;
      }

      setOrderSuccess(true);
      setOrderData({
        _id: result.order._id,
        trackingNumber: result.order.trackingNumber,
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

  return { submit, isLoading, orderSuccess, orderData };
};