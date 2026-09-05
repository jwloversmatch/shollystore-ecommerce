import { useState, useRef } from "react";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { RootState } from "../store";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
  applyCoupon,
  removeCoupon,
  CartItem as CartItemType,
} from "../features/cart/cartSlice";
import {
  Trash2,
  ShoppingBag,
  Minus,
  Plus,
  ArrowLeft,
  AlertCircle,
  CreditCard,
  Sparkles,
  Flame,
  Tag,
  Loader2,
  X,
  CheckCircle,
} from "lucide-react";
import SEO from "../components/SEO";
import { getCloudinaryUrl } from "../utils/cloudinary";
import { useValidateCouponMutation } from "../features/api/apiSlice";

// ─── Constants ─────────────────────────────────────────────────────────────────
const ACCENT = "#e8622a";

interface PersistState {
  _persist: { version: number; rehydrated: boolean };
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
const DarkCartSkeleton = () => (
  <div
    className="animate-pulse flex items-center gap-4 p-5 rounded-2xl
    bg-gray-100 dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06]"
    role="status"
    aria-label="Loading cart item"
  >
    <span className="sr-only">Loading...</span>
    <div className="w-20 h-20 rounded-xl shrink-0 bg-gray-200 dark:bg-[#1c1c1c]" />
    <div className="flex-1 space-y-3">
      <div className="h-4 w-2/3 rounded-lg bg-gray-200 dark:bg-[#1c1c1c]" />
      <div className="h-3 w-1/3 rounded-lg bg-gray-200 dark:bg-[#1c1c1c]" />
    </div>
    <div className="h-9 w-24 rounded-xl shrink-0 bg-gray-200 dark:bg-[#1c1c1c]" />
  </div>
);

// ─── Ambient background ─────────────────────────────────────────────────────
const AmbientBg = () => (
  <div aria-hidden="true">
    <motion.div
      animate={{ x: ["-12%", "12%", "-12%"], y: ["-8%", "8%", "-8%"] }}
      transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
      className="fixed pointer-events-none rounded-full blur-[130px] -z-10"
      style={{
        width: 600,
        height: 600,
        top: -200,
        left: -200,
        background: ACCENT,
        opacity: 0.06,
      }}
    />
    <motion.div
      animate={{ x: ["12%", "-12%", "12%"], y: ["10%", "-10%", "10%"] }}
      transition={{ repeat: Infinity, duration: 38, ease: "linear" }}
      className="fixed pointer-events-none rounded-full blur-[130px] -z-10"
      style={{
        width: 560,
        height: 560,
        bottom: -200,
        right: -200,
        background: "#10b981",
        opacity: 0.04,
      }}
    />
  </div>
);

// ─── Empty cart view ──────────────────────────────────────────────────────────
const EmptyCart = () => {
  const navigate = useNavigate();
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden
      bg-[#FCFAF5] dark:bg-[#0A0A0B] focus:outline-none"
    >
      <SEO
        title="Your Cart"
        description="Review your items and proceed to secure checkout."
      />
      <AmbientBg />
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm text-center rounded-3xl p-10
          bg-[#FCFAF5] dark:bg-[#141414]
          border border-gray-200 dark:border-white/[0.07]
          shadow-lg dark:shadow-[0_40px_90px_rgba(0,0,0,0.6)]"
      >
        <div
          className="absolute top-0 inset-x-0 h-px rounded-t-3xl"
          style={{
            background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
          }}
        />
        <div className="flex justify-center mb-6">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 rounded-full border-2 border-dashed pointer-events-none"
              style={{ borderColor: `${ACCENT}30` }}
              aria-hidden="true"
            />
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background: `${ACCENT}12`,
                boxShadow: `0 0 0 3px ${ACCENT}`,
              }}
            >
              <ShoppingBag
                className="w-10 h-10"
                style={{ color: ACCENT }}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
        <p
          className="text-[10px] font-extrabold uppercase tracking-[0.22em] mb-3"
          style={{ color: ACCENT }}
        >
          Your Cart
        </p>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-3 leading-tight">
          It's empty right now
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
          Looks like you haven't added anything yet. Explore our catalog and
          find something you'll love!
        </p>
        <motion.button
          whileHover={{ scale: 1.04, boxShadow: `0 16px 40px ${ACCENT}55` }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/shop")}
          className="w-full py-4 rounded-xl font-black text-white text-[15px] flex items-center justify-center gap-2.5 group"
          style={{ background: ACCENT, boxShadow: `0 8px 24px ${ACCENT}44` }}
          aria-label="Browse products to add to your cart"
        >
          <Sparkles className="w-5 h-5" aria-hidden="true" />
          Browse Products
        </motion.button>
      </motion.div>
    </main>
  );
};

// ─── Cart header ─────────────────────────────────────────────────────────────
const CartHeader = ({
  totalItems,
  onClearAll,
  isClearModalOpen,
}: {
  totalItems: number;
  onClearAll: () => void;
  isClearModalOpen: boolean;
}) => {
  const navigate = useNavigate();
  return (
    <motion.header
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="flex items-center justify-between gap-3 mb-6 md:mb-8"
    >
      <div className="flex items-center gap-3 min-w-0">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate("/shop")}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl shrink-0 transition-colors
            text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white
            bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.07]"
          aria-label="Continue shopping"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span className="text-xs font-bold hidden sm:inline">
            Continue Shopping
          </span>
        </motion.button>
        <div className="min-w-0">
          <p
            className="text-[10px] font-extrabold uppercase tracking-[0.2em]"
            style={{ color: ACCENT }}
          >
            My Cart
          </p>
          <h1 className="text-xl md:text-3xl font-black text-gray-900 dark:text-white leading-none truncate">
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </h1>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={onClearAll}
        className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl shrink-0 text-red-400 hover:text-red-300 transition-colors
          bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20"
        aria-label={`Remove all ${totalItems} items from cart`}
        aria-haspopup="dialog"
        aria-expanded={isClearModalOpen}
        aria-controls="clear-cart-dialog"
      >
        <Trash2 className="w-4 h-4" aria-hidden="true" />
        <span className="hidden sm:inline text-xs font-bold">Clear All</span>
      </motion.button>
    </motion.header>
  );
};

// ─── Cart item row ────────────────────────────────────────────────────────────
const CartItem = ({ item }: { item: CartItemType }) => {
  const dispatch = useDispatch();

  // Fallback to 99 if stock is missing, so quantity controls always work
  const maxStock = item.stock ?? 99;

  const handleQty = (delta: number) => {
    const next = item.qty + delta;
    if (next >= 1 && next <= maxStock)
      dispatch(updateQuantity({ _id: item._id, qty: next }));
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 md:p-5 rounded-2xl transition-all
        bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.07]
        hover:border-gray-300 dark:hover:border-white/[0.12]"
      aria-label={`${item.name}, quantity ${item.qty}, price ₦${(item.price * item.qty).toLocaleString()}`}
      whileHover={{ borderColor: "rgba(255,255,255,0.12)" }}
    >
      <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden shrink-0">
        <img
          src={getCloudinaryUrl(
            item.image || "https://via.placeholder.com/100",
            200,
          )}
          alt={item.name}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0 w-full">
        <h2 className="font-bold text-base md:text-lg text-gray-900 dark:text-white truncate leading-tight">
          {item.name}
        </h2>
        <p className="text-sm font-semibold mt-0.5" style={{ color: ACCENT }}>
          ₦{item.price.toLocaleString()} / unit
        </p>
        <div className="flex items-center justify-between mt-3 gap-3 flex-wrap">
          <div
            className="flex items-center rounded-xl overflow-hidden
            bg-gray-100 dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/[0.08]"
            aria-label={`Quantity selector for ${item.name}`}
          >
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => handleQty(-1)}
              disabled={item.qty <= 1}
              className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label={`Decrease quantity of ${item.name}`}
            >
              <Minus className="w-3.5 h-3.5" aria-hidden="true" />
            </motion.button>
            <span
              className="w-9 text-center font-black text-gray-900 dark:text-white text-sm select-none"
              aria-live="polite"
            >
              {item.qty}
            </span>
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => handleQty(1)}
              disabled={item.qty >= maxStock}
              className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label={`Increase quantity of ${item.name}`}
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            </motion.button>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <div className="text-right">
              <p className="font-black text-gray-900 dark:text-white text-lg leading-none">
                ₦{(item.price * item.qty).toLocaleString()}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-[10px] mt-0.5">
                {item.qty} × ₦{item.price.toLocaleString()}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => dispatch(removeFromCart(item._id))}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0
                bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-500"
              aria-label={`Remove ${item.name} from cart`}
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

// ─── Order summary panel (modified to include coupon) ─────────────────────────
const OrderSummary = ({
  totalPrice,
  totalItems,
  onCheckout,
  couponCode,
  setCouponCode,
  appliedCoupon,
  couponDiscount,
  couponError,
  handleApplyCoupon,
  handleRemoveCoupon,
  isApplying,
  finalTotal,
  user,
}: {
  totalPrice: number;
  totalItems: number;
  onCheckout: () => void;
  couponCode: string;
  setCouponCode: (val: string) => void;
  appliedCoupon: string | null;
  couponDiscount: number;
  couponError: string;
  handleApplyCoupon: () => void;
  handleRemoveCoupon: () => void;
  isApplying: boolean;
  finalTotal: number;
  user: { email: string } | null;
}) => (
  <motion.aside
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.15, duration: 0.5 }}
    className="lg:col-span-1"
    aria-label="Order summary"
  >
    <div
      className="relative rounded-2xl p-6 md:p-7 lg:sticky lg:top-24
      bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.07]
      shadow-lg dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
    >
      <div
        className="absolute top-0 inset-x-0 h-px rounded-t-2xl"
        style={{
          background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
        }}
      />
      <div className="flex items-center gap-2 mb-6">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: `${ACCENT}18` }}
        >
          <Flame
            className="w-4 h-4"
            style={{ color: ACCENT }}
            aria-hidden="true"
          />
        </div>
        <h2 className="text-lg font-black text-gray-900 dark:text-white">
          Order Summary
        </h2>
      </div>

      {/* Coupon area: only if user logged in */}
      {user ? (
        <div className="mb-5">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2.5 flex items-center gap-1.5">
            <Tag className="w-3 h-3" aria-hidden="true" /> Discount Code
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <label htmlFor="cart-coupon" className="sr-only">
                Coupon code
              </label>
              <input
                id="cart-coupon"
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                disabled={!!appliedCoupon}
                placeholder="Enter code"
                className="w-full px-4 py-3 rounded-xl text-sm bg-gray-100 dark:bg-[#1c1c1c] border border-gray-300 dark:border-white/[0.08] outline-none placeholder-gray-500 dark:placeholder-gray-600 text-gray-900 dark:text-white focus:border-[#e8622a]/60 focus:ring-2 focus:ring-[#e8622a]/12 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono tracking-widest"
              />
            </div>
            {!appliedCoupon ? (
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={isApplying || !couponCode.trim()}
                className="px-4 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40 shrink-0"
                style={{ background: ACCENT }}
                aria-label="Apply coupon code"
              >
                {isApplying ? (
                  <Loader2
                    className="w-4 h-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  "Apply"
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="px-4 py-3 rounded-xl text-sm font-bold transition-all shrink-0 text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20"
                aria-label="Remove coupon"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
          <AnimatePresence>
            {couponError && (
              <p
                className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-semibold"
                role="alert"
              >
                <AlertCircle className="w-3 h-3" aria-hidden="true" />{" "}
                {couponError}
              </p>
            )}
            {appliedCoupon && (
              <p className="mt-1.5 text-xs font-bold flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="w-3 h-3" aria-hidden="true" />{" "}
                {appliedCoupon} applied
              </p>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="mb-5 p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-sm text-blue-800 dark:text-blue-200">
          <p className="flex items-start gap-2">
            <AlertCircle
              className="w-4 h-4 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <span>
              Have a coupon?{" "}
              <Link
                to="/login"
                className="font-bold underline hover:opacity-80 transition-opacity"
              >
                Sign in
              </Link>{" "}
              or{" "}
              <Link
                to="/register"
                className="font-bold underline hover:opacity-80 transition-opacity"
              >
                create an account
              </Link>{" "}
              to apply it to your order.
            </span>
          </p>
        </div>
      )}

      <dl className="space-y-3 text-sm">
        <div className="flex justify-between items-center">
          <dt className="text-gray-500 dark:text-gray-400 font-medium">
            Subtotal
          </dt>
          <dd className="text-gray-900 dark:text-white font-bold">
            ₦{totalPrice.toLocaleString()}
          </dd>
        </div>
        {couponDiscount > 0 && (
          <div className="flex justify-between items-center">
            <dt className="text-emerald-600 dark:text-emerald-400 font-medium">
              Discount
            </dt>
            <dd className="text-emerald-600 dark:text-emerald-400 font-bold">
              - ₦{couponDiscount.toLocaleString()}
            </dd>
          </div>
        )}
        <div className="flex justify-between items-center">
          <dt className="text-gray-500 dark:text-gray-400 font-medium">
            Items
          </dt>
          <dd className="text-gray-900 dark:text-white font-bold">
            {totalItems}
          </dd>
        </div>
        <div className="flex justify-between items-center">
          <dt className="text-gray-500 dark:text-gray-400 font-medium">
            Delivery
          </dt>
          <dd className="font-bold text-gray-900 dark:text-white">
            Calculated at checkout
          </dd>
        </div>
      </dl>

      <div className="my-5 h-px bg-gray-200 dark:bg-white/[0.06]" />

      <div className="flex justify-between items-end">
        <span className="text-gray-400 dark:text-gray-500 font-bold text-sm uppercase tracking-wider">
          Total
        </span>
        <div className="text-right">
          <span className="block text-3xl font-black" style={{ color: ACCENT }}>
            ₦{finalTotal.toLocaleString()}
          </span>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02, boxShadow: `0 16px 40px ${ACCENT}55` }}
        whileTap={{ scale: 0.98 }}
        onClick={onCheckout}
        className="w-full mt-6 py-4 rounded-xl font-black text-white text-[15px] flex items-center justify-center gap-2.5 group"
        style={{ background: ACCENT, boxShadow: `0 8px 24px ${ACCENT}44` }}
        aria-label="Proceed to secure checkout"
      >
        <CreditCard className="w-5 h-5" aria-hidden="true" />
        Proceed to Checkout
      </motion.button>

      <div className="mt-4 flex items-center justify-center gap-2">
        <AlertCircle
          className="w-3 h-3 text-gray-400 dark:text-gray-500 shrink-0"
          aria-hidden="true"
        />
        <span className="text-[11px] text-gray-400 dark:text-gray-500">
          Secure checkout via Paystack
        </span>
      </div>

      <div
        className="mt-4 flex items-center justify-center gap-3"
        aria-label="Accepted payment methods"
      >
        {["💳", "🏦", "💬"].map((icon, i) => (
          <div
            key={i}
            className="w-9 h-6 rounded-md flex items-center justify-center text-sm
            bg-gray-100 dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/[0.06]"
            aria-hidden="true"
          >
            {icon}
          </div>
        ))}
        <span className="text-[10px] text-gray-400 dark:text-gray-500">
          Card · Bank · WhatsApp
        </span>
      </div>
    </div>
  </motion.aside>
);

// ─── Clear cart modal (unchanged) ─────────────────────────────────────────────
const ClearCartModal = ({
  isOpen,
  onClose,
  onConfirm,
  totalItems,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  totalItems: number;
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, isOpen, onClose);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{
              background: "rgba(0,0,0,0.72)",
              backdropFilter: "blur(8px)",
            }}
            onClick={onClose}
            role="presentation"
            aria-hidden="true"
          />
          <motion.div
            key="modal"
            initial={{ scale: 0.9, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.93, y: 16, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            id="clear-cart-dialog"
            aria-modal="true"
            aria-labelledby="clear-cart-title"
          >
            <div
              ref={dialogRef}
              className="relative w-full max-w-sm rounded-2xl p-7
              bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.08]
              shadow-lg dark:shadow-[0_40px_90px_rgba(0,0,0,0.6)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="absolute top-0 inset-x-0 h-px rounded-t-2xl"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(239,68,68,0.6), transparent)",
                }}
              />

              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5
                bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20"
              >
                <Trash2 className="w-6 h-6 text-red-500" aria-hidden="true" />
              </div>

              <h3
                id="clear-cart-title"
                className="text-2xl font-black text-gray-900 dark:text-white mb-2"
              >
                Clear your cart?
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-7">
                All {totalItems} {totalItems === 1 ? "item" : "items"} will be
                removed. This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-xl text-sm font-bold
                    text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors
                    bg-gray-100 dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/[0.08]"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onConfirm}
                  className="flex-1 py-3.5 rounded-xl text-sm font-bold text-white"
                  style={{
                    background: "rgba(239,68,68,0.9)",
                    boxShadow: "0 6px 18px rgba(239,68,68,0.3)",
                  }}
                  aria-label={`Remove all ${totalItems} items from cart`}
                >
                  Clear Cart
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN CART COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const Cart = () => {
  const [showClearModal, setShowClearModal] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems, appliedCoupon, couponDiscount } = useSelector(
    (s: RootState) => s.cart,
  );
  const { user } = useSelector((s: RootState) => s.auth);
  const isRehydrated = useSelector(
    (s: RootState & PersistState) => s._persist?.rehydrated,
  );

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [validateCoupon, { isLoading: isApplying }] =
    useValidateCouponMutation();

  const totalItems = cartItems.reduce((a, i) => a + i.qty, 0);
  const totalPrice = cartItems.reduce((a, i) => a + i.price * i.qty, 0);
  const finalTotal = totalPrice - couponDiscount;

  const handleApplyCoupon = async () => {
    setCouponError("");
    if (!couponCode.trim()) return;
    try {
      const res = await validateCoupon({
        code: couponCode,
        orderTotal: totalPrice,
      }).unwrap();
      dispatch(
        applyCoupon({ code: res.coupon.code, discount: res.coupon.discount }),
      );
      toast.success(`₦${res.coupon.discount.toLocaleString()} off applied!`);
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      setCouponError(e?.data?.message || "Invalid coupon");
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    setCouponCode("");
    setCouponError("");
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  // ══════ LOADING (rehydration) ═══════════════════════════════════════════════
  if (isRehydrated === false) {
    return (
      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen pt-20 pb-24 px-4 md:px-8 bg-[#FCFAF5] dark:bg-[#0A0A0B] focus:outline-none"
      >
        <SEO
          title="Your Cart"
          description="Review your items and proceed to secure checkout."
        />
        <div className="max-w-4xl mx-auto space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <DarkCartSkeleton key={i} />
          ))}
        </div>
      </main>
    );
  }

  // ══════ EMPTY CART ═══════════════════════════════════════════════════════════
  if (cartItems.length === 0) return <EmptyCart />;

  // ══════ CART WITH ITEMS ═══════════════════════════════════════════════════════
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen pt-20 md:pt-24 pb-28 md:pb-16 px-4 md:px-6 relative overflow-x-hidden
      bg-[#FCFAF5] dark:bg-[#0A0A0B] focus:outline-none"
    >
      <SEO
        title="Your Cart"
        description="Review your items and proceed to secure checkout."
      />
      <AmbientBg />

      <div className="max-w-7xl mx-auto">
        <CartHeader
          totalItems={totalItems}
          onClearAll={() => setShowClearModal(true)}
          isClearModalOpen={showClearModal}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-8">
          <div className="lg:col-span-2 space-y-3" aria-label="Cart items">
            <AnimatePresence mode="popLayout">
              {cartItems.map((item) => (
                <CartItem key={item._id} item={item} />
              ))}
            </AnimatePresence>
          </div>

          <OrderSummary
            totalPrice={totalPrice}
            totalItems={totalItems}
            onCheckout={handleCheckout}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            appliedCoupon={appliedCoupon}
            couponDiscount={couponDiscount}
            couponError={couponError}
            handleApplyCoupon={handleApplyCoupon}
            handleRemoveCoupon={handleRemoveCoupon}
            isApplying={isApplying}
            finalTotal={finalTotal}
            user={user}
          />
        </div>
      </div>

      <ClearCartModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={() => {
          dispatch(clearCart());
          setShowClearModal(false);
        }}
        totalItems={totalItems}
      />
    </main>
  );
};

export default Cart;
