import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Mail,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import SEO from "../components/SEO";
import {
  useVerifyEmailQuery,
  useResendVerificationMutation,
} from "../features/api/apiSlice";

const ACCENT = "#e8622a";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemFadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
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

  // If no token, show error immediately
  const { data, isError, isLoading: isVerifying } = useVerifyEmailQuery(token, {
    skip: !token,
  });

  // Determine status based on query states
  let status: "loading" | "success" | "error" = "loading";
  let message = "";

  if (!token) {
    status = "error";
    message = "Invalid or missing verification link. Please request a new one.";
  } else if (isVerifying) {
    status = "loading";
  } else if (isError) {
    status = "error";
    message = "An error occurred. Please try again later.";
  } else if (data) {
    status = data.success ? "success" : "error";
    message =
      data.message ||
      (data.success
        ? "Your email has been successfully verified!"
        : "Verification failed. The token may have expired or been invalid.");
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
      className="min-h-screen flex items-center justify-center p-4 relative bg-[#FCFAF5] dark:bg-[#0A0A0B] overflow-hidden focus:outline-none"
    >
      <SEO
        title="Verify Your Email"
        description="Verify your email address to activate your Sholex account."
      />

      {/* Ambient background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <motion.div
          animate={{ x: ["-10%", "10%", "-10%"], y: ["-5%", "15%", "-5%"] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="absolute top-10 -left-20 w-72 h-72 rounded-full blur-3xl opacity-[0.08]"
          style={{ background: ACCENT }}
        />
        <motion.div
          animate={{ x: ["10%", "-10%", "10%"], y: ["15%", "-10%", "15%"] }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          className="absolute bottom-10 -right-20 w-96 h-96 rounded-full blur-3xl opacity-[0.06]"
          style={{ background: ACCENT }}
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 bg-white/90 dark:bg-[#141414] backdrop-blur-2xl rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-gray-200 dark:border-white/[0.07] overflow-hidden"
      >
        {/* Floating sparkles */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="absolute top-4 right-4 opacity-20"
          style={{ color: ACCENT }}
          aria-hidden="true"
        >
          <Sparkles className="w-6 h-6" />
        </motion.div>
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          className="absolute bottom-4 left-4 opacity-10"
          style={{ color: ACCENT }}
          aria-hidden="true"
        >
          <Sparkles className="w-5 h-5" />
        </motion.div>

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
                  className="rounded-full h-16 w-16 border-4 border-gray-200 dark:border-white/10 border-t-[#e8622a] mb-6"
                  aria-hidden="true"
                />
                <motion.h2
                  variants={itemFadeUp}
                  className="text-2xl font-black text-gray-900 dark:text-white mb-2"
                >
                  Verifying…
                </motion.h2>
                <motion.p
                  variants={itemFadeUp}
                  className="text-gray-500 dark:text-gray-400"
                >
                  Please wait while we verify your email.
                </motion.p>
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
                  className="mx-auto mb-6 bg-green-50 dark:bg-green-500/10 p-4 rounded-full w-fit"
                >
                  <CheckCircle
                    className="w-16 h-16 text-green-500"
                    aria-hidden="true"
                  />
                </motion.div>
                <motion.h2
                  variants={itemFadeUp}
                  className="text-2xl font-black text-gray-900 dark:text-white mb-2"
                >
                  Email Verified! ✅
                </motion.h2>
                <motion.p
                  variants={itemFadeUp}
                  className="text-gray-600 dark:text-gray-400 mb-6"
                >
                  {message}
                </motion.p>
                <motion.button
                  variants={itemFadeUp}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/")}
                  className="w-full bg-[#e8622a] text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-[#c9511f] transition-all flex items-center justify-center gap-2 group"
                >
                  Go to Home
                  <ArrowRight
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    aria-hidden="true"
                  />
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
                  className="mx-auto mb-6 bg-red-50 dark:bg-red-500/10 p-4 rounded-full w-fit"
                >
                  <XCircle
                    className="w-16 h-16 text-red-500"
                    aria-hidden="true"
                  />
                </motion.div>
                <motion.h2
                  variants={itemFadeUp}
                  className="text-2xl font-black text-gray-900 dark:text-white mb-2"
                >
                  Verification Failed
                </motion.h2>
                <motion.p
                  variants={itemFadeUp}
                  className="text-gray-600 dark:text-gray-400 mb-6"
                >
                  {message}
                </motion.p>

                <motion.form
                  variants={itemFadeUp}
                  onSubmit={handleResend}
                  className="w-full space-y-3"
                >
                  <div className="relative">
                    <label htmlFor="verify-resend-email" className="sr-only">
                      Email address
                    </label>
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      id="verify-resend-email"
                      type="email"
                      placeholder="Enter your email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      autoComplete="email"
                      className="w-full border border-gray-300 dark:border-white/[0.08] rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-[#e8622a] focus:border-transparent placeholder:text-gray-400 bg-white/70 dark:bg-[#1c1c1c] dark:text-white"
                      required
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={isResending}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-[#e8622a] text-white py-3.5 rounded-xl font-bold shadow-lg shadow-[#e8622a]/30 hover:shadow-[#e8622a]/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isResending ? (
                      <>
                        <Loader2
                          className="w-5 h-5 animate-spin"
                          aria-hidden="true"
                        />
                        Sending…
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-5 h-5" aria-hidden="true" />
                        Resend Verification Email
                      </>
                    )}
                  </motion.button>
                </motion.form>

                <motion.button
                  variants={itemFadeUp}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/")}
                  className="w-full mt-3 bg-gray-100 dark:bg-[#1c1c1c] text-gray-700 dark:text-gray-300 py-3 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-[#2a2a2a] transition-all"
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