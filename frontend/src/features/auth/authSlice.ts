import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  _id: string;
  email: string;
  role: 'user' | 'admin';
  name?: string;
  phone?: string;
  createdAt?: string;
  token?: string;
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
    setCredentials: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      if (action.payload.token) {
        localStorage.setItem('token', action.payload.token);
      }
    },
    logout: (state) => {
      state.user = null;
      localStorage.removeItem('token');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;