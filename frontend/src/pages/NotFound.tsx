import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Compass } from 'lucide-react';
import SEO from '../components/SEO';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-leaf-green/5 via-pastel-pink/30 to-blob-orange/10 overflow-hidden relative px-4">
      <SEO
        title="Page Not Found"
        description="The page you're looking for doesn't exist. Let's get you back on track."
      />

      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: ['-5%', '5%', '-5%'] }}
          transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
          className="absolute -top-32 -left-32 w-80 h-80 bg-leaf-green/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], x: ['5%', '-5%', '5%'] }}
          transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-blob-orange/20 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-12 max-w-lg w-full text-center"
      >
        {/* Floating compass icon */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="inline-flex mb-4"
        >
          <Compass className="w-16 h-16 text-leaf-green/60" />
        </motion.div>

        {/* 404 large number */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
          className="text-8xl md:text-9xl font-black bg-gradient-to-r from-leaf-green to-blob-orange bg-clip-text text-transparent mb-2 leading-none"
        >
          404
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-2xl md:text-3xl font-bold text-gray-800 mb-2"
        >
          Oops! Page Not Found
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-gray-500 mb-8"
        >
          The page you’re looking for doesn’t exist or has been moved. Let’s get you back to refreshing drinks.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 10px 25px rgba(74, 143, 41, 0.3)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/')}
            className="bg-leaf-green text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all flex items-center gap-2 justify-center"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(-1)}
            className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2 justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;