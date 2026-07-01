import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  _id: string;
  name: string;
  image: string;
  price: number;
  qty: number;
  stock: number;
}

interface CartState {
  cartItems: CartItem[];
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  } | null;
}

const initialState: CartState = {
  cartItems: [],
  shippingAddress: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const item = action.payload;
      const existItem = state.cartItems.find((x) => x._id === item._id);
      if (existItem) {
        existItem.qty = item.qty;
      } else {
        state.cartItems.push(item);
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cartItems = state.cartItems.filter((x) => x._id !== action.payload);
    },
    // ✅ NEW: Update quantity for an item in the cart
    updateQuantity: (state, action: PayloadAction<{ _id: string; qty: number }>) => {
      const { _id, qty } = action.payload;
      const item = state.cartItems.find((x) => x._id === _id);
      if (item) {
        // Professional check: ensure we don't go below 1 or exceed available stock
        item.qty = Math.max(1, Math.min(qty, item.stock));
      }
    },
    saveShippingAddress: (state, action: PayloadAction<CartState['shippingAddress']>) => {
      state.shippingAddress = action.payload;
    },
    clearCart: (state) => {
      state.cartItems = [];
    },
  },
});

// ✅ Don't forget to export the new action
export const { 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  saveShippingAddress, 
  clearCart 
} = cartSlice.actions;

export default cartSlice.reducer;