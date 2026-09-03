// src/App.tsx
import { Suspense, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { HelmetProvider } from "react-helmet-async";
import { motion, MotionConfig } from "framer-motion";

import Navbar from "./components/Navbar";
import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./context/ThemeContext";
import CartSync from "./components/CartSync";

import {
  Home, Cart, Checkout, Login, Register, ForgotPassword, ResetPassword,
  VerifyEmail, Account, ProductDetail, ShopPage, TrackOrder,
  Dashboard, Products, Orders, HeroSlides, Categories, Coupons, Settings,
  NotFound, Footer, PrivacyPolicy, TermsOfUse, About, Contact, Reviews 
} from "./routes/lazyPages";

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
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const main = document.getElementById("main-content");
    main?.focus({ preventScroll: true });
    // Reset scroll to top on navigation
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Hide navbar on specific pages
  const hideNavbar = ["/cart", "/checkout", "/404"].includes(location.pathname);

  // Show footer on Home, Shop, and legal pages
  const showFooter = ["/", "/shop", "/privacy", "/terms", "/about", "/contact"].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      <CartSync />

      <Suspense fallback={<LoadingFallback />}>
        <ErrorBoundary>
          {/* Force remount of Routes on every pathname change */}
          <Routes key={location.pathname}>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/shop" element={<ShopPage />} /> 
            <Route path="/track-order" element={<TrackOrder />} />

            {/* Authenticated routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/account" element={<Account />} />
            </Route>

            {/* Admin routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/products" element={<Products />} />
              <Route path="/admin/settings" element={<Settings />} />
              <Route path="/admin/orders" element={<Orders />} />
              <Route path="/admin/hero-slides" element={<HeroSlides />} />
              <Route path="/admin/categories" element={<Categories />} />
              <Route path="/admin/coupons" element={<Coupons />} />
              <Route path="/admin/reviews" element={<Reviews />} />
            </Route>

            {/* Legal pages */}
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfUse />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* 404 fallback */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </Suspense>

      {showFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <MotionConfig reducedMotion="user">
          <Router>
            <Toaster
              position="top-center"
              reverseOrder={false}
              toastOptions={{
                duration: 3000,
                style: {
                  background: "var(--bg-surface)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-soft)",
                },
              }}
            />
            <AppContent />
          </Router>
        </MotionConfig>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;