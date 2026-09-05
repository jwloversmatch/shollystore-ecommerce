import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import {
  useTrackByTokenQuery,
  useTrackMyOrderQuery,
  useTrackMyOrderByCodeMutation,
  useTrackOrderManualMutation,
  TrackOrderResponse,
} from "../features/api/apiSlice";
import {
  Loader2,
  CheckCircle,
  Clock,
  MapPin,
  CreditCard,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Search,
} from "lucide-react";
import SEO from "../components/SEO";
import { formatPaymentMethod } from "../utils/format";

const ACCENT = "#e8622a";
const INITIAL_ITEM_COUNT = 2;

// Normalized query result shape
interface TrackingQueryResult {
  data?: TrackOrderResponse;
  isFetching: boolean;
  isError: boolean;
  error?: {
    data?: { message?: string };
    message?: string;
  };
}

const TrackOrder = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const orderIdParam = searchParams.get("orderId") || "";
  const { user } = useSelector((state: RootState) => state.auth);

  const [showAllItems, setShowAllItems] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // Manual form state
  const [trackingCode, setTrackingCode] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  // Mutation hooks expose `isLoading`, not `isFetching` — `isFetching` only
  // exists on query-hook results (it tracks background refetches, which
  // mutations don't have since they're one-shot triggered actions).
  const [trackMyOrderByCode, { data: authManualData, isLoading: authManualFetching, isError: authManualError, error: authManualErrorObj, reset: resetAuthManual }] = useTrackMyOrderByCodeMutation();
  const [trackOrderManual, { data: guestManualData, isLoading: guestManualFetching, isError: guestManualError, error: guestManualErrorObj, reset: resetGuestManual }] = useTrackOrderManualMutation();

  const isTokenMode = !!token;
  const isAuthMode = !!orderIdParam && !!user;
  const isManualMode = !isTokenMode && !isAuthMode;

  const tokenQuery = useTrackByTokenQuery(token, { skip: !isTokenMode });
  const authQuery = useTrackMyOrderQuery(orderIdParam, { skip: !isAuthMode });

  // Explicitly typed variable for active query result
  let activeQueryResult: TrackingQueryResult | null = null;
  if (isTokenMode) {
    activeQueryResult = tokenQuery as unknown as TrackingQueryResult;
  } else if (isAuthMode) {
    activeQueryResult = authQuery as unknown as TrackingQueryResult;
  }

  const queryData = activeQueryResult?.data;
  const queryIsFetching = activeQueryResult?.isFetching ?? false;
  const queryIsError = activeQueryResult?.isError ?? false;
  const queryError = activeQueryResult?.error;

  // Manual mode result
  const manualData = user ? authManualData : guestManualData;
  const manualIsFetching = user ? authManualFetching : guestManualFetching;
  const manualIsError = user ? authManualError : guestManualError;
  const manualErrorObj = user ? authManualErrorObj : guestManualErrorObj;

  // Final values used in render
  const finalData: TrackOrderResponse | undefined = isManualMode ? manualData : queryData;
  const finalIsFetching = isManualMode ? manualIsFetching : queryIsFetching;
  const finalIsError = isManualMode ? manualIsError : queryIsError;
  const finalError = isManualMode ? manualErrorObj : queryError;

  useEffect(() => {
    if (finalData?.order && !finalIsFetching) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [finalData, finalIsFetching]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;

    if (user) {
      try {
        await trackMyOrderByCode({ trackingCode: trackingCode.trim() }).unwrap();
      } catch {
        // error handled by finalIsError
      }
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(manualEmail)) {
        setEmailError("Please enter a valid email address");
        return;
      }
      setEmailError("");
      try {
        await trackOrderManual({
          orderId: trackingCode.trim(),
          email: manualEmail.trim(),
        }).unwrap();
      } catch {
        // error handled by finalIsError
      }
    }
  };

  const handleTrackAnother = () => {
    setShowAllItems(false);
    setTrackingCode("");
    setManualEmail("");
    setEmailError("");
    if (user) resetAuthManual();
    else resetGuestManual();
    setSearchParams({}, { replace: true });
  };

  let errorMessage = "Order not found. Please check your details.";
  if (finalIsError) {
    if (
      finalError &&
      typeof finalError === "object" &&
      "data" in finalError &&
      finalError.data &&
      typeof finalError.data === "object" &&
      "message" in finalError.data
    ) {
      errorMessage = String(finalError.data.message);
    } else if (
      finalError &&
      typeof finalError === "object" &&
      "message" in finalError &&
      finalError.message
    ) {
      errorMessage = finalError.message;
    }
  }

  const order = finalData?.order;
  const timelineSteps = ["Pending", "Processing", "Shipped", "Delivered"];
  const shouldShowResult = !finalIsFetching && !!order;

  const totalItems = order?.orderItems?.length || 0;
  const visibleItems = showAllItems
    ? order?.orderItems
    : order?.orderItems?.slice(0, INITIAL_ITEM_COUNT);
  const hasMoreItems = totalItems > INITIAL_ITEM_COUNT;

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen px-4 py-8 bg-[#FCFAF5] dark:bg-[#0A0A0B] focus:outline-none pt-[calc(80px+env(safe-area-inset-top,0px))] md:pt-[calc(96px+env(safe-area-inset-top,0px))]"
    >
      <SEO title="Track Order" description="Check the status of your order." />
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-6">
          Track Your Order
        </h1>

        <AnimatePresence mode="wait">
          {/* Manual form */}
          {isManualMode && !shouldShowResult && (
            <motion.div
              key="manual"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 mb-8"
            >
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label htmlFor="tracking-code" className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">
                    Tracking Code
                  </label>
                  <input
                    id="tracking-code"
                    type="text"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white outline-none focus:border-[#e8622a]/60 focus:ring-2 focus:ring-[#e8622a]/12"
                    placeholder="e.g., SHO-2026-AB12CD"
                  />
                </div>

                {!user && (
                  <div>
                    <label htmlFor="manual-email" className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">
                      Email used at checkout
                    </label>
                    <input
                      id="manual-email"
                      type="email"
                      value={manualEmail}
                      onChange={(e) => {
                        setManualEmail(e.target.value);
                        if (emailError) setEmailError("");
                      }}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white outline-none focus:border-[#e8622a]/60 focus:ring-2 focus:ring-[#e8622a]/12"
                      placeholder="you@example.com"
                    />
                    {emailError && (
                      <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-semibold" role="alert">
                        <AlertCircle className="w-3 h-3" /> {emailError}
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={finalIsFetching}
                  className="w-full py-4 rounded-xl font-black text-white text-[15px] flex items-center justify-center gap-2.5 disabled:opacity-50"
                  style={{ background: ACCENT, boxShadow: `0 8px 24px ${ACCENT}44` }}
                >
                  {finalIsFetching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  Track Order
                </button>
              </form>

              {finalIsError && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errorMessage}
                </div>
              )}
            </motion.div>
          )}

          {/* Loading indicator */}
          {finalIsFetching && (
            <div className="flex justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin" style={{ color: ACCENT }} />
            </div>
          )}

          {/* Result display */}
          {shouldShowResult && order && (
            <motion.div
              key="result"
              ref={resultRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-6 rounded-2xl p-6 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-gray-900 dark:text-white">
                  Order Details
                </h2>
                <button
                  onClick={handleTrackAnother}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  aria-label="Track another order"
                >
                  <RotateCcw className="w-4 h-4" />
                  Track Another
                </button>
              </div>

              {/* Status timeline */}
              <div className="flex items-center justify-between mb-6">
                {timelineSteps.map((step, idx) => {
                  const currentStatus = order.status;
                  const isCompleted = timelineSteps.indexOf(currentStatus) >= idx;
                  const isCurrent = currentStatus === step;
                  return (
                    <div key={step} className="flex-1 flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted ? "bg-emerald-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                        }`}
                      >
                        {isCompleted ? <CheckCircle size={16} /> : <Clock size={16} />}
                      </div>
                      <span className={`mt-2 text-xs font-bold ${isCurrent ? "text-emerald-500" : isCompleted ? "text-gray-700 dark:text-gray-300" : "text-gray-400"}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 text-sm">
                {order.trackingNumber && (
                  <p className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Tracking Number</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">{order.trackingNumber}</span>
                  </p>
                )}
                <p className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Status</span>
                  <span className="font-bold text-gray-900 dark:text-white">{order.status}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Total</span>
                  <span className="font-bold text-gray-900 dark:text-white">₦{order.totalPrice.toLocaleString()}</span>
                </p>
                {order.shippingFee !== undefined && (
                  <p className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Shipping</span>
                    <span className="font-bold text-gray-900 dark:text-white">{order.shippingFee === 0 ? "Free" : `₦${order.shippingFee.toLocaleString()}`}</span>
                  </p>
                )}
                <p className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Payment Method</span>
                  <span className="font-bold text-gray-900 dark:text-white">{formatPaymentMethod(order.paymentMethod)}</span>
                </p>
              </div>

              {/* Items */}
              {order.orderItems.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3">Items ({order.orderItems.length})</h3>
                  <div className="space-y-2">
                    {visibleItems?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover" />}
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.qty} × ₦{item.price.toLocaleString()}</p>
                        </div>
                        <span className="text-sm font-bold">₦{(item.qty * item.price).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  {hasMoreItems && (
                    <button
                      onClick={() => setShowAllItems((prev) => !prev)}
                      className="mt-3 w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-gray-700 dark:text-gray-300"
                      aria-expanded={showAllItems}
                    >
                      {showAllItems ? (
                        <>
                          <ChevronUp className="w-4 h-4" /> Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" /> Show all {order.orderItems.length} items
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Shipping address */}
              <div className="mt-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-500" /> Shipping Address
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {order.shippingAddress.address}, {order.shippingAddress.city}
                  {order.shippingAddress.postalCode && `, ${order.shippingAddress.postalCode}`}
                  {order.shippingAddress.country && `, ${order.shippingAddress.country}`}
                </p>
              </div>

              {/* Payment instructions */}
              {order.paymentDetails && (
                <div className="mt-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Payment Instructions
                  </p>
                  {order.paymentMethod === "bank_transfer" && (
                    <>
                      <p className="text-sm">Bank: {order.paymentDetails.bankName}</p>
                      <p className="text-sm">Account Name: {order.paymentDetails.accountName}</p>
                      <p className="text-sm font-mono">Account Number: {order.paymentDetails.accountNumber}</p>
                    </>
                  )}
                  {order.paymentMethod === "whatsapp" && (
                    <p className="text-sm">
                      Please chat with us on WhatsApp at {order.paymentDetails.whatsappNumber} to complete payment.
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};

export default TrackOrder;