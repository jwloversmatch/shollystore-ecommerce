import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { RootState } from '../store';
import {
  removeFromCart,
  updateQuantity,
  clearCart,
} from '../features/cart/cartSlice';
import {
  Trash2,
  ShoppingBag,
  Minus,
  Plus,
  ArrowLeft,
  AlertCircle,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import { CartItemSkeleton } from '../components/Skeletons';

// ---------- Animation Variants ----------
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemFadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 },
  },
};

interface PersistState {
  _persist: {
    version: number;
    rehydrated: boolean;
  };
}

const Cart = () => {
  const [showClearModal, setShowClearModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);

  // Check if Redux Persist has finished rehydrating
  const isRehydrated = useSelector(
  (state: RootState & PersistState) => state._persist?.rehydrated
);
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please login to checkout');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    navigate('/checkout');
  };

  const handleQty = (id: string, currentQty: number, delta: number, stock: number) => {
    const newQty = currentQty + delta;
    if (newQty >= 1 && newQty <= stock) {
      dispatch(updateQuantity({ _id: id, qty: newQty }));
    }
  };

  const handleClearCart = () => {
    if (cartItems.length === 0) return;
    setShowClearModal(true);
  };

  const confirmClearCart = () => {
    dispatch(clearCart());
    setShowClearModal(false);
  };

  // ---------- Rehydration loading state ----------
  if (isRehydrated === false) {
    return (
      <div className="min-h-screen pt-16 md:pt-24 pb-16 px-4 md:px-8 flex flex-col items-center">
        <div className="max-w-7xl w-full space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <CartItemSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // ---------- Empty Cart ----------
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pastel-pink/40 via-pastel-green/40 to-white overflow-hidden relative">
        {/* Fixed background blobs – no overflow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.1, 1], x: ['-5%', '5%', '-5%'] }}
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
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-white/50 max-w-sm w-full mx-4 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="inline-flex mx-auto mb-4"
          >
            <ShoppingBag className="w-16 h-16 text-gray-300" />
          </motion.div>
          <motion.h2 variants={itemFadeUp} className="text-2xl font-bold text-gray-800 mb-2">
            Your cart is empty
          </motion.h2>
          <motion.p variants={itemFadeUp} className="text-gray-500 mb-6">
            Looks like you haven't added anything to your cart yet.
          </motion.p>
          <motion.button
            variants={itemFadeUp}
            whileHover={{ scale: 1.03, boxShadow: '0 10px 25px rgba(251, 146, 60, 0.3)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/')}
            className="bg-blob-orange text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 mx-auto"
          >
            <Sparkles className="w-5 h-5" />
            Start Shopping
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ---------- Cart with Items ----------
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-pastel-pink/40 via-pastel-green/40 to-white pt-16 md:pt-24 pb-16 px-4 md:px-8 flex flex-col items-center relative overflow-x-hidden"
    >
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.05, 1], x: ['-5%', '5%', '-5%'] }}
          transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
          className="absolute -top-32 -left-32 w-80 h-80 bg-leaf-green/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], x: ['5%', '-5%', '5%'] }}
          transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-blob-orange/20 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl w-full">
        {/* Header */}
        <motion.div variants={itemFadeUp} className="flex items-center justify-between gap-3 mb-6 md:mb-10">
          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-gray-600 hover:text-gray-800 transition-colors bg-white/70 backdrop-blur-sm px-3 py-2 md:px-4 md:py-2 rounded-xl shadow-sm border border-white/40 shrink-0"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm font-medium whitespace-nowrap hidden sm:inline">
                Continue Shopping
              </span>
            </button>
            <h1 className="text-xl md:text-3xl font-bold text-gray-800 truncate">My Cart</h1>
          </div>
          <button
            onClick={handleClearCart}
            className="flex items-center gap-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 md:px-4 md:py-2 rounded-xl transition-all bg-white/70 backdrop-blur-sm shadow-sm border border-white/40 shrink-0"
          >
            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline text-xs md:text-sm font-medium">Clear All</span>
          </button>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10 w-full">
          {/* Left: Cart Items */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {cartItems.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  variants={itemFadeUp}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  className="group bg-white/80 backdrop-blur-md rounded-2xl shadow-md border border-gray-100 p-4 md:p-5 hover:shadow-xl transition-shadow w-full flex flex-col sm:flex-row items-start sm:items-center gap-4"
                >
                  {/* Image */}
                  <motion.img
                    whileHover={{ scale: 1.05 }}
                    src={item.image || 'https://via.placeholder.com/100'}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover border border-gray-200 group-hover:border-leaf-green/30 transition-colors shrink-0"
                  />
                  {/* Info */}
                  <div className="flex-1 min-w-0 w-full sm:w-auto">
                    <h3 className="font-bold text-base md:text-lg text-gray-800 group-hover:text-leaf-green transition-colors truncate">
                      {item.name}
                    </h3>
                    <p className="text-leaf-green font-semibold text-base md:text-lg mt-1">
                      ₦{item.price.toLocaleString()}
                    </p>
                    {/* Quantity & Remove */}
                    <div className="flex items-center justify-between mt-3 sm:mt-0 sm:ml-auto sm:w-auto">
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleQty(item._id, item.qty, -1, item.stock)}
                          disabled={item.qty <= 1}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </motion.button>
                        <span className="font-semibold w-6 text-center text-sm">{item.qty}</span>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleQty(item._id, item.qty, 1, item.stock)}
                          disabled={item.qty >= item.stock}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => dispatch(removeFromCart(item._id))}
                        className="ml-3 flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-xs font-medium hidden sm:inline">Remove</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Right: Order Summary */}
          <motion.div variants={itemFadeUp} className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6 md:p-8 sticky top-6 w-full">
              <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-4">
                Order Summary
              </h2>
              <div className="space-y-3 mb-6 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>₦{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="text-leaf-green font-medium">Free</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
                  <span>Tax included</span>
                  <span>₦0.00</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-xl text-gray-800 mt-4 pt-4 border-t border-gray-200">
                <span>Total</span>
                <span className="text-blob-orange">₦{totalPrice.toLocaleString()}</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 10px 25px rgba(74, 143, 41, 0.3)' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckout}
                className="w-full mt-6 bg-leaf-green text-white py-4 rounded-xl font-bold shadow-lg shadow-leaf-green/30 transition-all flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                Proceed to Checkout
              </motion.button>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                <AlertCircle className="w-3 h-3" />
                <span>Secure checkout via Paystack</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Clear Cart Modal */}
      <AnimatePresence>
        {showClearModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowClearModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-white/50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 text-red-600 mb-2">
                  <Trash2 className="w-6 h-6" />
                  <h3 className="text-xl font-bold text-gray-800">Clear Cart?</h3>
                </div>
                <p className="text-gray-600 text-sm mb-6 pl-9">
                  Are you sure you want to remove all items from your cart? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowClearModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={confirmClearCart}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 shadow-md transition"
                  >
                    Clear Cart
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Cart;