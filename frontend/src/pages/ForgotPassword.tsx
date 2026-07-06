import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForgotPasswordMutation } from '../features/api/apiSlice';
import { Mail, ArrowLeft, Send, CheckCircle, AlertCircle } from 'lucide-react';
import SEO from '../components/SEO';

// ─── Constants ────────────────────────────────────────────────────────────────
const ACCENT = '#e8622a';

// ─── Ambient background (same orbs & dot grid as Register/Login) ──────────────
const AmbientBg = () => (
  <>
    <motion.div
      animate={{ x: ['-12%', '12%', '-12%'], y: ['-8%', '10%', '-8%'] }}
      transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
      className="fixed pointer-events-none rounded-full blur-[130px] -z-10"
      style={{ width: 640, height: 640, top: -200, left: -200, background: ACCENT, opacity: 0.065 }}
    />
    <motion.div
      animate={{ x: ['12%', '-12%', '12%'], y: ['12%', '-10%', '12%'] }}
      transition={{ repeat: Infinity, duration: 38, ease: 'linear' }}
      className="fixed pointer-events-none rounded-full blur-[130px] -z-10"
      style={{ width: 600, height: 600, bottom: -200, right: -200, background: '#10b981', opacity: 0.04 }}
    />
    <div
      className="fixed inset-0 pointer-events-none -z-10"
      style={{
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}
    />
  </>
);

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [forgotPassword, { isLoading, error }] = useForgotPasswordMutation();
  const errorMessage = (error as { data?: { message?: string } })?.data?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await forgotPassword(email.trim()).unwrap();
      setSent(true);
    } catch {
      // error is displayed via errorMessage
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden" style={{ background: '#0A0A0B' }}>
        <SEO title="Check Your Email" description="Password reset link sent" />
        <AmbientBg />

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-md rounded-3xl p-8 sm:p-10 text-center"
          style={{
            background: '#141414',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 40px 90px rgba(0,0,0,0.65)',
          }}
        >
          {/* Accent top line */}
          <div
            className="absolute top-0 inset-x-0 h-px rounded-t-3xl"
            style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }}
          />

          {/* Animated check circle */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-4 rounded-full border-2 border-dashed pointer-events-none"
                style={{ borderColor: `${ACCENT}30` }}
              />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22, delay: 0.1 }}
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: `${ACCENT}15`, boxShadow: `0 0 0 3px ${ACCENT}` }}
              >
                <CheckCircle className="w-9 h-9" style={{ color: ACCENT }} />
              </motion.div>
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-[10px] font-extrabold uppercase tracking-[0.22em] mb-2"
            style={{ color: ACCENT }}
          >
            Email sent
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="text-3xl font-black text-white mb-3 leading-tight"
          >
            Check your inbox
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-gray-500 text-sm leading-relaxed mb-2"
          >
            If an account exists for
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }}
            className="inline-block px-4 py-2 rounded-xl border mb-6 text-sm font-bold text-white"
            style={{ background: '#1c1c1c', borderColor: 'rgba(255,255,255,0.1)' }}
          >
            {email}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-gray-600 text-xs mb-8 leading-relaxed"
          >
            You'll receive a password reset link shortly.
            Check your spam folder if you don't see it.
          </motion.p>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-bold hover:opacity-80 transition-opacity"
            style={{ color: ACCENT }}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  // ── Main form ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 sm:py-14 relative overflow-hidden" style={{ background: '#0A0A0B' }}>
      <SEO title="Forgot Password" description="Reset your Ires Kitchen account password" />
      <AmbientBg />

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md rounded-3xl p-8 sm:p-10"
        style={{
          background: '#141414',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 40px 90px rgba(0,0,0,0.65)',
        }}
      >
        {/* Accent top line */}
        <div
          className="absolute top-0 inset-x-0 h-px rounded-t-3xl"
          style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }}
        />

        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] mb-2" style={{ color: ACCENT }}>
          Account recovery
        </p>

        <h2 className="text-3xl font-black text-white mb-2 leading-tight">
          Forgot password?
        </h2>

        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Enter your email and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-600" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-white bg-[#1c1c1c] placeholder-gray-600 outline-none transition-all duration-200 border border-white/[0.08] focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="flex items-start gap-2.5 p-3.5 rounded-xl border text-sm"
              style={{
                background: 'rgba(239,68,68,0.07)',
                borderColor: 'rgba(239,68,68,0.2)',
                color: '#f87171',
              }}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={isLoading || !email.trim()}
            whileHover={!isLoading ? { scale: 1.02, boxShadow: `0 18px 44px ${ACCENT}55` } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
            className="w-full py-4 rounded-xl font-black text-white text-[15px] flex items-center justify-center gap-2.5 transition-all disabled:opacity-55 disabled:cursor-not-allowed"
            style={{
              background: ACCENT,
              boxShadow: `0 8px 24px ${ACCENT}44`,
            }}
          >
            {isLoading ? (
              'Sending…'
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send Reset Link
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;