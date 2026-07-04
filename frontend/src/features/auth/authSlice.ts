import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface IAddress {
  _id: string;
  label: string;
  address: string;
  city: string;
  postalCode?: string;
  country?: string;
  isDefault: boolean;
}

export interface User {
  _id: string;
  email: string;
  role: 'user' | 'admin';
  name?: string;
  phone?: string;
  addresses?: IAddress[];
  lastLogin?: string;
  isVerified?: boolean;
  createdAt?: string;
}

interface AuthState {
  user: User | null;
}

const initialState: AuthState = {
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Now accepts { user, token } from the new backend
    setCredentials: (state, action: PayloadAction<{ user: User; token?: string }>) => {
      state.user = action.payload.user;
      if (action.payload.token) {
        localStorage.setItem('token', action.payload.token);
      }
    },
    logout: (state) => {
      state.user = null;
      localStorage.removeItem('token');
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { setCredentials, logout, updateProfile } = authSlice.actions;
export default authSlice.reducer;