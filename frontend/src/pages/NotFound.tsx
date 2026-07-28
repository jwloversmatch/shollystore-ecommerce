// src/pages/NotFound.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search, ShoppingBag } from 'lucide-react';
import SEO from '../components/SEO';

const NotFound: React.FC = () => {
  return (
    <>
      <SEO 
        title="Page Not Found" 
        description="The page you're looking for doesn't exist. Return to SholexStore to continue shopping."
        noIndex={true}
      />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-orange-50 dark:from-[#0A0A0B] dark:to-[#1a1a1a] px-4">
        <div className="max-w-2xl w-full text-center">
          {/* Animated 404 Number */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="relative"
          >
            <motion.h1
              className="text-[180px] sm:text-[220px] font-black leading-none select-none"
              style={{
                background: "linear-gradient(135deg, #e8622a, #ff8c42)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              404
            </motion.h1>

            {/* Floating elements */}
            <motion.div
              className="absolute -top-4 -right-4 sm:-right-8"
              animate={{
                rotate: [0, 10, 0, -10, 0],
                y: [0, -5, 0, 5, 0],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-[#e8622a] opacity-30" />
            </motion.div>

            <motion.div
              className="absolute -bottom-4 -left-4 sm:-left-8"
              animate={{
                rotate: [0, -15, 0, 15, 0],
                y: [0, 5, 0, -5, 0],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <Search className="w-10 h-10 sm:w-14 sm:h-14 text-[#e8622a] opacity-30" />
            </motion.div>
          </motion.div>

          {/* Error Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Oops! Page Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
              The page you're looking for might have been moved, deleted, or never existed.
              Let's get you back on track!
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#e8622a] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                <Home className="w-5 h-5" />
                Back to Home
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700"
              >
                <ShoppingBag className="w-5 h-5" />
                Browse Products
              </Link>
            </motion.div>
          </motion.div>

          {/* Go Back Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-6"
          >
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-[#e8622a] dark:hover:text-[#e8622a] transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </motion.div>

          {/* Decorative Dots */}
          <motion.div
            className="mt-12 flex justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-3 h-3 rounded-full bg-[#e8622a] opacity-20"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default NotFound;