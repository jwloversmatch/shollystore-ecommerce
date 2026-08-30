import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  _id: string;
  name: string;
  image: string;
  price: number;
  qty: number;
  stock: number;
  variant?: {
    sku?: string;
    color?: string;
    size?: string;
  };
}

interface CartState {
  cartItems: CartItem[];
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  } | null;
  appliedCoupon: string | null;
  couponDiscount: number;
}

const initialState: CartState = {
  cartItems: [],
  shippingAddress: null,
  appliedCoupon: null,
  couponDiscount: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const item = action.payload;
      const existItem = state.cartItems.find((x) => x._id === item._id);
      if (existItem) {
        existItem.qty += item.qty;
      } else {
        state.cartItems.push(item);
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cartItems = state.cartItems.filter((x) => x._id !== action.payload);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ _id: string; qty: number }>,
    ) => {
      const { _id, qty } = action.payload;
      const item = state.cartItems.find((x) => x._id === _id);
      if (item) {
        item.qty = Math.max(1, Math.min(qty, item.stock));
      }
    },
    saveShippingAddress: (
      state,
      action: PayloadAction<CartState["shippingAddress"]>,
    ) => {
      state.shippingAddress = action.payload;
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.appliedCoupon = null;
      state.couponDiscount = 0;
    },
    applyCoupon: (
      state,
      action: PayloadAction<{ code: string; discount: number }>,
    ) => {
      state.appliedCoupon = action.payload.code;
      state.couponDiscount = action.payload.discount;
    },
    removeCoupon: (state) => {
      state.appliedCoupon = null;
      state.couponDiscount = 0;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  saveShippingAddress,
  clearCart,
  applyCoupon,
  removeCoupon,
} = cartSlice.actions;

export default cartSlice.reducer;
