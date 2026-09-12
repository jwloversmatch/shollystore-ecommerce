// src/App.tsx
import { Suspense, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
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
import WishlistSync from "./components/WishlistSync";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
// import StoreAssistant from "./components/StoreAssistant"; // Future feature - store assistant

import {
  Home,
  Cart,
  Checkout,
  Login,
  Register,
  ForgotPassword,
  ResetPassword,
  VerifyEmail,
  Account,
  ProductDetail,
  ShopPage,
  TrackOrder,
  Dashboard,
  Products,
  Orders,
  HeroSlides,
  Categories,
  Coupons,
  Reviews,
  LegalPages,
  UsersPage,
  SettingsLayout,
  GeneralSettings,
  PaymentsSettings,
  NotificationsSettings,
  ActivitySettings,
  NotFound,
  Footer,
  PrivacyPolicy,
  TermsOfUse,
  About,
  Contact,
  ReturnPolicy,
  Unsubscribe,
  AdminLayout,
} from "./routes/lazyPages";

const ACCENT = "#e8622a";

const LoadingFallback = () => (
  <div
    className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-[#0F1011]"
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
  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // AdminLayout handles its own focus/scroll on route change.
    if (isAdminRoute) return;

    const main = document.getElementById("main-content");
    main?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [location.pathname, isAdminRoute]);

  const hideNavbar =
    isAdminRoute ||
    ["/cart", "/checkout", "/404"].includes(location.pathname);

  const showFooter =
    !isAdminRoute &&
    [
      "/",
      "/shop",
      "/privacy",
      "/terms",
      "/about",
      "/contact",
      "/returns",
      "/unsubscribe",
    ].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      <PWAInstallPrompt />
      <CartSync />
      <WishlistSync />
      {/* Future feature: Store Assistant – visible on all pages */}
      {/* <StoreAssistant /> */}

      <Suspense fallback={<LoadingFallback />}>
        <ErrorBoundary>
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

            {/* Admin routes — wrapped in AdminRoute (auth guard) + AdminLayout (shell) */}
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<Dashboard />} />
                <Route path="/admin/products" element={<Products />} />
                <Route path="/admin/orders" element={<Orders />} />
                <Route path="/admin/hero-slides" element={<HeroSlides />} />
                <Route path="/admin/categories" element={<Categories />} />
                <Route path="/admin/coupons" element={<Coupons />} />
                <Route path="/admin/reviews" element={<Reviews />} />
                <Route path="/admin/legal" element={<LegalPages />} />
                <Route path="/admin/users" element={<UsersPage />} />

                {/* Settings — nested routes with a shared rail */}
                <Route path="/admin/settings" element={<SettingsLayout />}>
                  <Route index element={<Navigate to="general" replace />} />
                  <Route path="general" element={<GeneralSettings />} />
                  <Route path="payments" element={<PaymentsSettings />} />
                  <Route
                    path="notifications"
                    element={<NotificationsSettings />}
                  />
                  <Route path="activity" element={<ActivitySettings />} />
                </Route>
              </Route>
            </Route>

            {/* Legal pages */}
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfUse />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/returns" element={<ReturnPolicy />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />

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