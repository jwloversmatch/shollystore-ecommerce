import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { apiSlice } from './features/api/apiSlice';
import cartReducer from './features/cart/cartSlice';
import authReducer from './features/auth/authSlice';
import { persistStore, persistReducer } from 'redux-persist';

// custom storage (unchanged)
const storage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return Promise.resolve(null);
    return Promise.resolve(window.localStorage.getItem(key));
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return Promise.resolve();
    window.localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return Promise.resolve();
    window.localStorage.removeItem(key);
    return Promise.resolve();
  },
};

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['cart', 'auth'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(apiSlice.middleware),
});

export const persistor = persistStore(store);

// ✅ FIX: Derive RootState from rootReducer so all slices are visible
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;