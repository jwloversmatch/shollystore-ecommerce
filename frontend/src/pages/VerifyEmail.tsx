import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Mail,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';

// ---------- Animation variants (with literal types) ----------
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
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (!token) {
      if (isMounted.current) {
        setStatus('error');
        setMessage('Invalid or missing verification link. Please request a new one.');
      }
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/verify-email?token=${token}`
        );
        const data = await res.json();
        if (isMounted.current) {
          if (data.success) {
            setStatus('success');
            setMessage(data.message || 'Your email has been successfully verified!');
          } else {
            setStatus('error');
            setMessage(data.message || 'Verification failed. The token may have expired or been invalid.');
          }
        }
      } catch {
        if (isMounted.current) {
          setStatus('error');
          setMessage('An error occurred. Please try again later.');
        }
      }
    };

    verify();
  }, [location]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) {
      toast.error('Please enter your email address.');
      return;
    }
    setIsResending(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        navigate('/');
      } else {
        toast.error(data.message || 'Failed to resend verification email.');
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  <SEO
  title="Verify Your Email"
  description="Verify your email address to activate your LotceWieth account."
/>

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-gradient-to-br from-leaf-green/5 via-pastel-pink/30 to-blob-orange/10 overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: ['-10%', '10%', '-10%'],
            y: ['-5%', '15%', '-5%'],
          }}
          transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
          className="absolute top-10 -left-20 w-72 h-72 bg-leaf-green/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: ['10%', '-10%', '10%'],
            y: ['15%', '-10%', '15%'],
          }}
          transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
          className="absolute bottom-10 -right-20 w-96 h-96 bg-blob-orange/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pastel-pink/10 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-white/50 overflow-hidden"
      >
        {/* Floating sparkles */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
          className="absolute top-4 right-4 text-leaf-green/30"
        >
          <Sparkles className="w-6 h-6" />
        </motion.div>
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
          className="absolute bottom-4 left-4 text-blob-orange/30"
        >
          <Sparkles className="w-5 h-5" />
        </motion.div>

        {/* ---- Loading State ---- */}
        <AnimatePresence mode="wait">
          {status === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="rounded-full h-16 w-16 border-4 border-leaf-green/30 border-t-leaf-green mb-6"
              />
              <motion.h2 variants={itemFadeUp} className="text-2xl font-bold text-gray-800 mb-2">
                Verifying…
              </motion.h2>
              <motion.p variants={itemFadeUp} className="text-gray-500">
                Please wait while we verify your email.
              </motion.p>
            </motion.div>
          )}

          {/* ---- Success State ---- */}
          {status === 'success' && (
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
                className="mx-auto mb-6 bg-green-50/50 p-4 rounded-full w-fit"
              >
                <CheckCircle className="w-16 h-16 text-green-500" />
              </motion.div>
              <motion.h2 variants={itemFadeUp} className="text-2xl font-bold text-gray-800 mb-2">
                Email Verified! ✅
              </motion.h2>
              <motion.p variants={itemFadeUp} className="text-gray-600 mb-6">
                {message}
              </motion.p>
              <motion.button
                variants={itemFadeUp}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/')}
                className="w-full bg-leaf-green text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 group"
              >
                Go to Home
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>
          )}

          {/* ---- Error State ---- */}
          {status === 'error' && (
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
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="mx-auto mb-6 bg-red-50/50 p-4 rounded-full w-fit"
              >
                <XCircle className="w-16 h-16 text-red-500" />
              </motion.div>
              <motion.h2 variants={itemFadeUp} className="text-2xl font-bold text-gray-800 mb-2">
                Verification Failed
              </motion.h2>
              <motion.p variants={itemFadeUp} className="text-gray-600 mb-6">
                {message}
              </motion.p>

              <motion.form
                variants={itemFadeUp}
                onSubmit={handleResend}
                className="w-full space-y-3"
              >
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-leaf-green focus:border-transparent placeholder:text-gray-400 bg-white/70 backdrop-blur-sm"
                    required
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={isResending}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-blob-orange text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blob-orange/30 hover:shadow-blob-orange/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5" />
                      Resend Verification Email
                    </>
                  )}
                </motion.button>
              </motion.form>

              <motion.button
                variants={itemFadeUp}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/')}
                className="w-full mt-3 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
              >
                Go to Home
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;