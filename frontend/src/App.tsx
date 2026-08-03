// src/App.tsx
import { Suspense, lazy, useEffect, useRef } from "react";
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

// --- Lazy Load Pages with prefetch hints ---
const Home = lazy(() => import(/* webpackPrefetch: true */ "./pages/Home"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Products = lazy(() => import("./pages/admin/Products"));
const Orders = lazy(() => import("./pages/admin/Orders"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const HeroSlides = lazy(() => import("./pages/admin/HeroSlides"));
const Categories = lazy(() => import("./pages/admin/Categories"));
const Account = lazy(() => import("./pages/Account"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Coupons = lazy(() => import("./pages/admin/Coupons"));
const ShopPage = lazy(() => import("./pages/ShopPage"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
  }, [location.pathname]);

  // Hide navbar on specific pages
  const hideNavbar = ["/cart", "/checkout", "/404"].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Suspense fallback={<LoadingFallback />}>
        <ErrorBoundary>
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
              <Route path="/shop" element={<ShopPage />} />
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
        </ErrorBoundary>
      </Suspense>
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