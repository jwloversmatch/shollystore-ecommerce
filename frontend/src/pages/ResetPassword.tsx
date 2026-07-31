import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useResetPasswordMutation } from "../features/api/apiSlice";
import { Lock, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import SEO from "../components/SEO";

const ACCENT = "#e8622a";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const token = new URLSearchParams(location.search).get("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      return;
    }
    try {
      await resetPassword({ token, password }).unwrap();
      setSuccess(true);
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      setErrorMsg(error?.data?.message || "Something went wrong");
    }
  };

  if (success) {
    return (
      <main id="main-content" tabIndex={-1} className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden bg-[#FCFAF5] dark:bg-[#0A0A0B] focus:outline-none">
        <SEO title="Password Reset" description="Your password has been reset" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md rounded-3xl p-8 sm:p-10 text-center
            bg-[#FCFAF5] dark:bg-[#141414]
            border border-gray-200 dark:border-white/[0.07]
            shadow-lg dark:shadow-[0_40px_90px_rgba(0,0,0,0.65)]"
        >
          <div
            className="absolute top-0 inset-x-0 h-px rounded-t-3xl"
            style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }}
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
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 22, delay: 0.1 }}
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: `${ACCENT}15`, boxShadow: `0 0 0 3px ${ACCENT}` }}
              >
                <CheckCircle className="w-9 h-9" style={{ color: ACCENT }} aria-hidden="true" />
              </motion.div>
            </div>
          </div>

          <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] mb-2" style={{ color: ACCENT }}>
            Password updated
          </p>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3 leading-tight">
            Password Reset!
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
            Your password has been changed successfully.
          </p>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-white text-sm transition-all hover:scale-105"
            style={{ background: ACCENT, boxShadow: `0 8px 24px ${ACCENT}44` }}
          >
            Go to Login
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen flex items-center justify-center px-4 py-10 sm:py-14 relative overflow-hidden bg-[#FCFAF5] dark:bg-[#0A0A0B] focus:outline-none">
      <SEO title="Reset Password" description="Set a new password for your account" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md rounded-3xl p-8 sm:p-10
          bg-[#FCFAF5] dark:bg-[#141414]
          border border-gray-200 dark:border-white/[0.07]
          shadow-lg dark:shadow-[0_40px_90px_rgba(0,0,0,0.65)]"
      >
        <div
          className="absolute top-0 inset-x-0 h-px rounded-t-3xl"
          style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }}
        />

        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to Login
        </Link>

        <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] mb-2" style={{ color: ACCENT }}>
          Set new password
        </p>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 leading-tight">
          Reset Password
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="reset-new-password" className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400 dark:text-gray-600" aria-hidden="true" />
              <input
                id="reset-new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm
                  bg-gray-100 dark:bg-[#1c1c1c]
                  text-gray-900 dark:text-white
                  placeholder-gray-500 dark:placeholder-gray-600
                  outline-none transition-all duration-200
                  border border-gray-300 dark:border-white/[0.08]
                  focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15"
                placeholder="New password"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="reset-confirm-password" className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400 dark:text-gray-600" aria-hidden="true" />
              <input
                id="reset-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm
                  bg-gray-100 dark:bg-[#1c1c1c]
                  text-gray-900 dark:text-white
                  placeholder-gray-500 dark:placeholder-gray-600
                  outline-none transition-all duration-200
                  border border-gray-300 dark:border-white/[0.08]
                  focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15"
                placeholder="Confirm new password"
                required
              />
            </div>
          </div>

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              role="alert"
              className="flex items-start gap-2.5 p-3.5 rounded-xl border text-sm"
              style={{
                background: 'rgba(239,68,68,0.07)',
                borderColor: 'rgba(239,68,68,0.2)',
                color: '#f87171',
              }}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={!isLoading ? { scale: 1.02, boxShadow: `0 18px 44px ${ACCENT}55` } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
            className="w-full py-4 rounded-xl font-black text-white text-[15px] flex items-center justify-center gap-2.5 transition-all disabled:opacity-55 disabled:cursor-not-allowed"
            style={{
              background: ACCENT,
              boxShadow: `0 8px 24px ${ACCENT}44`,
            }}
          >
            {isLoading ? 'Resetting…' : 'Reset Password'}
          </motion.button>
        </form>
      </motion.div>
    </main>
  );
};

export default ResetPassword;