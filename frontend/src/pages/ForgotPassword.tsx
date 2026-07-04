import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForgotPasswordMutation } from '../features/api/apiSlice';
import { Mail, ArrowLeft, Send, CheckCircle, AlertCircle } from 'lucide-react';
import SEO from '../components/SEO';

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
      // error is shown via errorMessage
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-leaf-green/5 via-pastel-pink/30 to-blob-orange/10 p-4">
        <SEO title="Check Your Email" description="Password reset link sent" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-white/50"
        >
          <CheckCircle className="w-16 h-16 text-leaf-green mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Check Your Email</h2>
          <p className="text-gray-600 mb-6">
            If an account exists for <strong>{email}</strong>, you'll receive a password reset link shortly.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-leaf-green font-semibold hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-leaf-green/5 via-pastel-pink/30 to-blob-orange/10 p-4">
      <SEO title="Forgot Password" description="Reset your LotceWieth account password" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full border border-white/50"
      >
        <Link to="/login" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-leaf-green mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Forgot Password?</h2>
        <p className="text-gray-500 mb-6 text-sm">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-leaf-green focus:border-transparent placeholder:text-gray-400 bg-white/70"
              placeholder="you@example.com"
              required
            />
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm p-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <motion.button
            type="submit"
            disabled={isLoading || !email.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-leaf-green text-white py-3.5 rounded-xl font-bold shadow-lg shadow-leaf-green/30 hover:bg-green-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              'Sending...'
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