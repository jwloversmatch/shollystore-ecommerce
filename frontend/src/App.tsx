// src/App.tsx
import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { motion } from 'framer-motion';

import Navbar from './components/Navbar';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider } from './context/ThemeContext';

// --- Lazy Load Pages with prefetch hints ---
const Home = lazy(() => import(/* webpackPrefetch: true */ './pages/Home'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Products = lazy(() => import('./pages/admin/Products'));
const Orders = lazy(() => import('./pages/admin/Orders'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const HeroSlides = lazy(() => import('./pages/admin/HeroSlides'));
const Categories = lazy(() => import('./pages/admin/Categories'));
const Account = lazy(() => import('./pages/Account'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Coupons = lazy(() => import('./pages/admin/Coupons'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

const ACCENT = "#e8622a";

// Loading fallback – lightweight, no heavy animations
const LoadingFallback = () => (
  <div 
    className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-[#0A0A0B]"
    role="status"
    aria-label="Loading"
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      className="w-12 h-12 rounded-full border-4"
      style={{ borderColor: `${ACCENT}30`, borderTopColor: ACCENT }}
    />
    <span className="sr-only">Loading...</span>
  </div>
);

function AppContent() {
  const location = useLocation();

  // iOS PWA fix: Move scroll to a wrapper div, not body/root
  useEffect(() => {
    // Don't apply this on desktop
    if (window.innerWidth >= 768) return;

    const html = document.documentElement;
    const body = document.body;

    // Prevent body/html from scrolling
    html.style.overflow = 'hidden';
    html.style.height = '100%';
    body.style.overflow = 'hidden';
    body.style.height = '100%';
    body.style.position = 'fixed';
    body.style.width = '100%';
    body.style.top = '0';
    body.style.left = '0';

    return () => {
      html.style.overflow = '';
      html.style.height = '';
      body.style.overflow = '';
      body.style.height = '';
      body.style.position = '';
      body.style.width = '';
      body.style.top = '';
      body.style.left = '';
    };
  }, []);

  // Hide navbar on specific pages
  const hideNavbar = ['/cart', '/checkout', '/404'].includes(location.pathname);

  return (
    <>
      {/* Navbar rendered OUTSIDE the scrollable area */}
      {!hideNavbar && <Navbar />}
      
      {/* Scrollable content area */}
      <div 
        id="app-scroll-container"
        className="md:static"
        style={{
          // On mobile, this becomes the scrollable container
          height: window.innerWidth < 768 ? '100%' : 'auto',
          overflowY: window.innerWidth < 768 ? 'auto' : 'visible',
          WebkitOverflowScrolling: 'touch',
          position: window.innerWidth < 768 ? 'fixed' : 'static',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
        }}
      >
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

            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <Router>
          <Toaster 
            position="top-center" 
            reverseOrder={false}
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-soft)',
              },
            }}
          />
          <AppContent />
        </Router>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;