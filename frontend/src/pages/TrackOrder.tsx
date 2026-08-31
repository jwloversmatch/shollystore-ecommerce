import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTrackOrderQuery } from "../features/api/apiSlice";
import { AlertCircle, Loader2, Search, ArrowLeft } from "lucide-react";
import SEO from "../components/SEO";

const ACCENT = "#e8622a";

const TrackOrder = () => {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const { data, isFetching, isError, error } = useTrackOrderQuery(
    { orderId, email },
    { skip: !submitted || !orderId || !email },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  // Type-safe error message extraction
  let errorMessage = "Order not found. Please check your details.";
  if (isError) {
    if (
      "data" in error &&
      error.data &&
      typeof error.data === "object" &&
      "message" in error.data
    ) {
      errorMessage = String(error.data.message);
    } else if ("message" in error) {
      errorMessage = error.message || errorMessage;
    }
  }

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen px-4 py-8 bg-[#FCFAF5] dark:bg-[#0A0A0B] focus:outline-none"
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

        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div>
            <label
              htmlFor="track-order-id"
              className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-1"
            >
              Order ID
            </label>
            <input
              id="track-order-id"
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white outline-none focus:border-[#e8622a]/60 focus:ring-2 focus:ring-[#e8622a]/12"
              placeholder="e.g., 60f7c1e5b9d1e9001c9e1234"
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
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white outline-none focus:border-[#e8622a]/60 focus:ring-2 focus:ring-[#e8622a]/12"
              placeholder="you@example.com"
            />
          </div>
          <button
            type="submit"
            disabled={isFetching}
            className="w-full py-4 rounded-xl font-black text-white text-[15px] flex items-center justify-center gap-2.5"
            style={{ background: ACCENT, boxShadow: `0 8px 24px ${ACCENT}44` }}
          >
            {isFetching ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            Track Order
          </button>
        </form>

        {isError && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {errorMessage}
          </div>
        )}

        {data?.order && (
          <div className="rounded-2xl p-6 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 shadow-lg">
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">
              Order Details
            </h2>
            <div className="space-y-3 text-sm">
              <p className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Status</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {data.order.status}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Total</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  ₦{data.order.totalPrice.toLocaleString()}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Payment Method
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {data.order.paymentMethod}
                </span>
              </p>
              {data.order.paymentDetails && (
                <div className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                    Payment Instructions
                  </p>
                  {data.order.paymentMethod === "bank_transfer" && (
                    <>
                      <p className="text-sm">
                        Bank: {data.order.paymentDetails.bankName}
                      </p>
                      <p className="text-sm">
                        Account Name: {data.order.paymentDetails.accountName}
                      </p>
                      <p className="text-sm font-mono">
                        Account Number:{" "}
                        {data.order.paymentDetails.accountNumber}
                      </p>
                    </>
                  )}
                  {data.order.paymentMethod === "whatsapp" && (
                    <p className="text-sm">
                      Please chat with us on WhatsApp at{" "}
                      {data.order.paymentDetails.whatsappNumber} to complete
                      payment.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default TrackOrder;
