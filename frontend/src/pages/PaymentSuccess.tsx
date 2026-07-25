import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLazyVerifyPaymentQuery } from '../features/api/apiSlice';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';

const ACCENT = '#e8622a';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const reference = searchParams.get('reference') || searchParams.get('trxref') || '';

  const [trigger, { data, isLoading, isError }] = useLazyVerifyPaymentQuery();

  useEffect(() => {
    if (reference) {
      trigger(reference);
    }
  }, [reference, trigger]);

  // Determine status
  let status: 'loading' | 'success' | 'error' = 'loading';
  let message = '';

  if (!reference) {
    status = 'error';
    message = 'No transaction reference found.';
  } else if (isLoading) {
    status = 'loading';
  } else if (isError) {
    status = 'error';
    message = 'Unable to verify payment. Please contact support.';
  } else if (data) {
    if (data.status && data.data?.status === 'success') {
      status = 'success';
      message = 'Payment successful! Your order is being processed.';
    } else {
      status = 'error';
      message = `Payment ${data.data?.status ?? 'failed'}. Please contact support.`;
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden
        bg-[#FCFAF5] dark:bg-[#0A0A0B]"
    >
      <SEO title="Payment Status" description="Verify your payment status." />

      {/* Ambient background orbs */}
      <motion.div
        animate={{ x: ['-12%', '12%', '-12%'], y: ['-8%', '8%', '-8%'] }}
        transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
        className="fixed pointer-events-none rounded-full blur-[130px] -z-10"
        style={{
          width: 640,
          height: 640,
          top: -200,
          left: -200,
          background: ACCENT,
          opacity: 0.065,
        }}
      />
      <motion.div
        animate={{ x: ['12%', '-12%', '12%'], y: ['12%', '-10%', '12%'] }}
        transition={{ repeat: Infinity, duration: 38, ease: 'linear' }}
        className="fixed pointer-events-none rounded-full blur-[130px] -z-10"
        style={{
          width: 600,
          height: 600,
          bottom: -200,
          right: -200,
          background: '#10b981',
          opacity: 0.04,
        }}
      />

      {/* Dot grid texture – light/dark */}
      <div
        className="absolute inset-0 pointer-events-none
          bg-[radial-gradient(rgba(0,0,0,0.03)_1px,transparent_1px)]
          dark:bg-[radial-gradient(rgba(255,255,255,0.025)_1px,transparent_1px)]
          bg-[length:28px_28px]"
      />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md rounded-3xl p-8 sm:p-10
          bg-[#FCFAF5] dark:bg-[#141414]
          border border-gray-200 dark:border-white/[0.07]
          shadow-lg dark:shadow-[0_40px_90px_rgba(0,0,0,0.65)]"
      >
        <div
          className="absolute top-0 inset-x-0 h-px rounded-t-3xl"
          style={{
            background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
          }}
        />

        {/* Icon */}
        <div className="flex justify-center mb-6">
          {status === 'loading' ? (
            <Loader2 className="w-16 h-16 text-orange-500 animate-spin" />
          ) : status === 'success' ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: '#10b98120',
                boxShadow: '0 0 0 4px #10b981',
              }}
            >
              <CheckCircle className="w-10 h-10 text-green-500" />
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: '#ef444420',
                boxShadow: '0 0 0 4px #ef4444',
              }}
            >
              <XCircle className="w-10 h-10 text-red-500" />
            </motion.div>
          )}
        </div>

        <h2 className="text-2xl font-black text-center mb-2 text-gray-900 dark:text-white">
          {status === 'loading'
            ? 'Verifying Payment'
            : status === 'success'
            ? 'Payment Confirmed'
            : 'Payment Failed'}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-6">{message}</p>

        <div className="flex flex-col gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/orders')}
            className="w-full py-4 rounded-xl font-black text-white text-[15px] flex items-center justify-center gap-2.5"
            style={{
              background: ACCENT,
              boxShadow: `0 8px 24px ${ACCENT}44`,
            }}
          >
            {status === 'success' ? 'View Order' : 'Try Again'}
            <ArrowRight className="w-5 h-5" />
          </motion.button>
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 dark:text-gray-400 font-bold text-sm hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Back to Shop
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;