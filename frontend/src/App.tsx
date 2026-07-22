import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { motion } from 'framer-motion';

import Navbar from './components/Navbar';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';

// --- Lazy Load Pages (unchanged) ---
const Home = React.lazy(() => import('./pages/Home'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const Dashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const Products = React.lazy(() => import('./pages/admin/Products'));
const Orders = React.lazy(() => import('./pages/admin/Orders'));
const VerifyEmail = React.lazy(() => import('./pages/VerifyEmail'));
const HeroSlides = React.lazy(() => import('./pages/admin/HeroSlides'));
const Categories = React.lazy(() => import('./pages/admin/Categories'));
const Account = React.lazy(() => import('./pages/Account'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Coupons = React.lazy(() => import('./pages/admin/Coupons'));
const ShopPage = React.lazy(() => import('./pages/ShopPage'));
import Settings from './pages/admin/Settings';

const ACCENT = "#e8622a";

const LoadingFallback = () => (
  <div className="min-h-screen flex justify-center items-center" style={{ background: "#0A0A0B" }}>
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      className="w-12 h-12 rounded-full border-4"
      style={{ borderColor: `${ACCENT}30`, borderTopColor: ACCENT }}
    />
  </div>
);

function AppContent() {
  const location = useLocation();

  // Hide navbar on cart and checkout pages
  const hideNavbar = location.pathname === '/cart' || location.pathname === '/checkout';

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/account" element={<Account />} />
          <Route path="/products/:slug" element={<ProductDetail />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/shop/*" element={<ShopPage />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/products" element={<Products />} />
            <Route path="/admin/settings" element={<Settings />} />
            <Route path="/admin/orders" element={<Orders />} />
            <Route path="/admin/hero-slides" element={<HeroSlides />} />
            <Route path="/admin/categories" element={<Categories />} />
            <Route path="/admin/coupons" element={<Coupons />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Toaster position="top-center" reverseOrder={false} />
        <AppContent />
      </Router>
    </HelmetProvider>
  );
}

export default App;