import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTrackOrderQuery } from "../features/api/apiSlice";
import {
  AlertCircle,
  Loader2,
  Search,
  ArrowLeft,
  CheckCircle,
  Clock,
  MapPin,
  CreditCard,
} from "lucide-react";
import SEO from "../components/SEO";
import { formatPaymentMethod } from "../utils/format";

const ACCENT = "#e8622a";

const TrackOrder = () => {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const {
    data,
    isFetching,
    isError,
    error,
  } = useTrackOrderQuery(
    { orderId, email },
    { skip: !submitted || !orderId || !email }
  );

  // Scroll to result when it appears (no setState here, only DOM operation)
  useEffect(() => {
    if (submitted && data?.order && !isFetching) {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [submitted, data, isFetching]);

  // Clear result and errors when user edits inputs
  const handleInputChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      setSubmitted(false);
      if (emailError) setEmailError("");
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    setEmailError("");
    setSubmitted(true);
  };

  let errorMessage = "Order not found. Please check your details.";
  if (isError) {
    if (
      "data" in error &&
      error.data &&
      typeof error.data === "object" &&
      "message" in error.data
    ) {
      errorMessage = String(error.data.message);
    } else if ("message" in error && error.message) {
      errorMessage = error.message;
    }
  }

  const order = data?.order;
  const timelineSteps = ["Pending", "Processing", "Shipped", "Delivered"];
  const shouldShowResult = submitted && !isFetching && !!order;

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen px-4 py-8 bg-[#FCFAF5] dark:bg-[#0A0A0B] focus:outline-none pt-[calc(80px+env(safe-area-inset-top,0px))] md:pt-[calc(96px+env(safe-area-inset-top,0px))]"
    >
      <SEO title="Track Order" description="Check the status of your order." />
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-6">
          Track Your Order
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4 mb-8" noValidate>
          <div>
            <label
              htmlFor="track-order-id"
              className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-1"
            >
              Order ID or Tracking Number
            </label>
            <input
              id="track-order-id"
              type="text"
              value={orderId}
              onChange={handleInputChange(setOrderId)}
              required
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white outline-none focus:border-[#e8622a]/60 focus:ring-2 focus:ring-[#e8622a]/12"
              placeholder="e.g., SHO-2026-AB12CD"
              aria-required="true"
            />
          </div>
          <div>
            <label
              htmlFor="track-email"
              className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-1"
            >
              Email used at checkout
            </label>
            <input
              id="track-email"
              type="email"
              value={email}
              onChange={handleInputChange(setEmail)}
              required
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white outline-none focus:border-[#e8622a]/60 focus:ring-2 focus:ring-[#e8622a]/12"
              placeholder="you@example.com"
              aria-required="true"
              aria-invalid={!!emailError}
              aria-describedby={emailError ? "track-email-error" : undefined}
            />
            {emailError && (
              <p
                id="track-email-error"
                className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-semibold"
                role="alert"
              >
                <AlertCircle className="w-3 h-3" aria-hidden="true" /> {emailError}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isFetching || !orderId.trim() || !email.trim()}
            className="w-full py-4 rounded-xl font-black text-white text-[15px] flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: ACCENT, boxShadow: `0 8px 24px ${ACCENT}44` }}
            aria-busy={isFetching}
          >
            {isFetching ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            {isFetching ? "Searching…" : "Track Order"}
          </button>
        </form>

        <AnimatePresence>
          {isError && submitted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-400 flex items-center gap-2"
              role="alert"
            >
              <AlertCircle className="w-4 h-4" />
              {errorMessage}
            </motion.div>
          )}

          {shouldShowResult && order && (
            <motion.div
              ref={resultRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 rounded-2xl p-6 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 shadow-lg"
            >
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">
                Order Details
              </h2>

              {/* Status timeline */}
              <div className="flex items-center justify-between mb-6">
                {timelineSteps.map((step, idx) => {
                  const currentStatus = order.status;
                  const isCompleted =
                    timelineSteps.indexOf(currentStatus) >= idx;
                  const isCurrent = currentStatus === step;
                  return (
                    <div key={step} className="flex-1 flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? "bg-emerald-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle size={16} />
                        ) : (
                          <Clock size={16} />
                        )}
                      </div>
                      <span
                        className={`mt-2 text-xs font-bold ${
                          isCurrent
                            ? "text-emerald-500"
                            : isCompleted
                            ? "text-gray-700 dark:text-gray-300"
                            : "text-gray-400"
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 text-sm">
                {order.trackingNumber && (
                  <p className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      Tracking Number
                    </span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">
                      {order.trackingNumber}
                    </span>
                  </p>
                )}
                <p className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Status</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {order.status}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Total</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    ₦{order.totalPrice.toLocaleString()}
                  </span>
                </p>
                {order.shippingFee !== undefined && (
                  <p className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      Shipping
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {order.shippingFee === 0
                        ? "Free"
                        : `₦${order.shippingFee.toLocaleString()}`}
                    </span>
                  </p>
                )}
                <p className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Payment Method
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatPaymentMethod(order.paymentMethod)}
                  </span>
                </p>
              </div>

              {/* Items */}
              {order.orderItems.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                    Items
                  </h3>
                  <div className="space-y-2">
                    {order.orderItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.qty} × ₦{item.price.toLocaleString()}
                          </p>
                        </div>
                        <span className="text-sm font-bold">
                          ₦{(item.qty * item.price).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shipping address */}
              <div className="mt-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  Shipping Address
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {order.shippingAddress.address}, {order.shippingAddress.city}
                  {order.shippingAddress.postalCode &&
                    `, ${order.shippingAddress.postalCode}`}
                  {order.shippingAddress.country &&
                    `, ${order.shippingAddress.country}`}
                </p>
              </div>

              {/* Payment instructions */}
              {order.paymentDetails && (
                <div className="mt-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Payment Instructions
                  </p>
                  {order.paymentMethod === "bank_transfer" && (
                    <>
                      <p className="text-sm">
                        Bank: {order.paymentDetails.bankName}
                      </p>
                      <p className="text-sm">
                        Account Name: {order.paymentDetails.accountName}
                      </p>
                      <p className="text-sm font-mono">
                        Account Number: {order.paymentDetails.accountNumber}
                      </p>
                    </>
                  )}
                  {order.paymentMethod === "whatsapp" && (
                    <p className="text-sm">
                      Please chat with us on WhatsApp at{" "}
                      {order.paymentDetails.whatsappNumber} to complete payment.
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