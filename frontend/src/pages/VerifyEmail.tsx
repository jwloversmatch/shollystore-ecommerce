import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Mail, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

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
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-email?token=${token}`);
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
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
        setMessage(data.message);
        setStatus('loading'); // Optionally show loading state again
        // Re-trigger verification? Actually the user still needs to click new link.
        // Could redirect to a "Check your email" page.
        navigate('/');
      } else {
        toast.error(data.message || 'Failed to resend verification email.');
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pastel-pink via-pastel-green to-white p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 max-w-md w-full text-center relative overflow-hidden"
      >
        {/* Decorative gradient blob */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-pastel-pink/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-pastel-green/30 rounded-full blur-3xl pointer-events-none" />

        {status === 'loading' && (
          <div className="flex flex-col items-center relative z-10">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-leaf-green/30 border-t-leaf-green mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying...</h2>
            <p className="text-gray-500">Please wait while we verify your email.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="relative z-10">
            <div className="mx-auto mb-6 bg-green-50/50 p-4 rounded-full w-fit">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Verified! ✅</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-leaf-green text-white py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-leaf-green/30"
            >
              Go to Home
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="relative z-10">
            <div className="mx-auto mb-6 bg-red-50/50 p-4 rounded-full w-fit">
              <XCircle className="w-16 h-16 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-4">{message}</p>

            <form onSubmit={handleResend} className="mt-4 space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-leaf-green focus:border-transparent placeholder:text-gray-400"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isResending}
                className="w-full bg-blob-orange text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg shadow-blob-orange/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Resend Verification Email
                  </>
                )}
              </button>
            </form>

            <button
              onClick={() => navigate('/')}
              className="w-full mt-3 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
            >
              Go to Home
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmail;