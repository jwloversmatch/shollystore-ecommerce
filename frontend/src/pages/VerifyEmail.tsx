import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Mail,
  RefreshCw,
  ArrowRight,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import SEO from "../components/SEO";
import {
  useVerifyEmailQuery,
  useResendVerificationMutation,
} from "../features/api/apiSlice";


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const successIcon = {
  hidden: { scale: 0, rotate: -90 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 20 },
  },
};

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [resendEmail, setResendEmail] = useState("");
  const [resendVerification, { isLoading: isResending }] =
    useResendVerificationMutation();

  const {
    data,
    isError,
    isLoading: isVerifying,
    isSuccess,
  } = useVerifyEmailQuery(token, {
    skip: !token,
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

  let status: "loading" | "success" | "error";
  let message = "";

  if (!token) {
    status = "error";
    message = "Invalid or missing verification link. Please request a new one.";
  } else if (isSuccess) {
    status = "success";
    message = data?.message || "Your email has been successfully verified!";
  } else if (isError) {
    status = "error";
    message = "An error occurred. Please try again later.";
  } else if (isVerifying) {
    status = "loading";
  } else {
    status = "error";
    message = "Verification failed. The token may have expired or been invalid.";
  }

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) {
      toast.error("Please enter your email address.");
      return;
    }
    try {
      const result = await resendVerification(resendEmail).unwrap();
      toast.success(result.message || "Verification email sent!");
      navigate("/");
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      toast.error(e?.data?.message || "Failed to resend verification email.");
    }
  };

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen flex items-center justify-center p-4 bg-[#FCFAF5] dark:bg-[#0A0A0B] focus:outline-none"
      style={{
        paddingTop: "calc(80px + env(safe-area-inset-top, 0px))",
        paddingBottom: "calc(64px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <SEO
        title="Verify Your Email"
        description="Verify your email address to activate your Sholex account."
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md rounded-3xl p-8 shadow-2xl text-center"
        style={{
          background: "#fff",
          color: "#111827",
          border: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <div aria-live="polite" aria-atomic="true">
          <AnimatePresence mode="wait">
            {/* Loading */}
            {status === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#e8622a] mb-6"
                  aria-hidden="true"
                />
                <h2 className="text-2xl font-black text-gray-900 mb-2">
                  Verifying…
                </h2>
                <p className="text-gray-600">
                  Please wait while we verify your email.
                </p>
              </motion.div>
            )}

            {/* Success */}
            {status === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  variants={successIcon}
                  initial="hidden"
                  animate="visible"
                  className="mx-auto mb-6 bg-green-50 p-4 rounded-full w-fit"
                >
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </motion.div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">
                  Email Verified! ✅
                </h2>
                <p className="text-gray-700 mb-6">{message}</p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/")}
                  className="w-full bg-[#e8622a] text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-[#c9511f] transition-all flex items-center justify-center gap-2"
                >
                  Go to Home <ArrowRight className="w-5 h-5" />
                </motion.button>
              </motion.div>
            )}

            {/* Error */}
            {status === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="mx-auto mb-6 bg-red-50 p-4 rounded-full w-fit"
                >
                  <XCircle className="w-16 h-16 text-red-500" />
                </motion.div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">
                  Verification Failed
                </h2>
                <p className="text-gray-700 mb-6">{message}</p>

                <form onSubmit={handleResend} className="w-full space-y-3">
                  <div className="relative">
                    <label htmlFor="verify-resend-email" className="sr-only">
                      Email address
                    </label>
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"
                      aria-hidden="true"
                    />
                    <input
                      id="verify-resend-email"
                      type="email"
                      placeholder="Enter your email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      autoComplete="email"
                      className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-[#e8622a] focus:border-transparent placeholder:text-gray-400"
                      style={{ background: "#f9fafb", color: "#111827" }}
                      required
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={isResending}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-[#e8622a] text-white py-3.5 rounded-xl font-bold shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isResending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-5 h-5" />
                    )}
                    {isResending ? "Sending…" : "Resend Verification Email"}
                  </motion.button>
                </form>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/")}
                  className="w-full mt-3 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Go to Home
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </main>
  );
};

export default VerifyEmail;