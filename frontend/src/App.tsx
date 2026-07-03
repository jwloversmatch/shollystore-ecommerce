import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

// Import Navbar and AdminRoute synchronously
import Navbar from './components/Navbar';
import AdminRoute from './components/AdminRoute';

// --- Lazy Load Pages (Code Splitting) ---
const Home = React.lazy(() => import('./pages/Home'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));

// --- Admin Pages ---
const Dashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const Products = React.lazy(() => import('./pages/admin/Products'));
const Orders = React.lazy(() => import('./pages/admin/Orders'));
const VerifyEmail = React.lazy(() => import('./pages/VerifyEmail'));
const HeroSlides = React.lazy(() => import('./pages/admin/HeroSlides'));
const Categories = React.lazy(() => import('./pages/admin/Categories'));
const Account = React.lazy(() => import('./pages/Account'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Coupons = React.lazy(() => import('./pages/admin/Coupons'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

import Settings from './pages/admin/Settings';

// A beautiful fallback loading skeleton
const LoadingFallback = () => (
  <div className="min-h-[60vh] flex justify-center items-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-leaf-green"></div>
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Toaster position="top-center" reverseOrder={false} />
        <Navbar />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/account" element={<Account />} />

            {/* ✅ Product Detail – public, no auth required */}
            <Route path="/product/:slug" element={<ProductDetail />} />

            {/* Protected Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/products" element={<Products />} />
              <Route path="/admin/settings" element={<Settings />} />
              <Route path="/admin/orders" element={<Orders />} />
              <Route path="/admin/hero-slides" element={<HeroSlides />} />
              <Route path="/admin/categories" element={<Categories />} />
              <Route path="/admin/coupons" element={<Coupons />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
    </HelmetProvider>
  );
}

export default App;