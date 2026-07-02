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
} from 'lucide-react';

const Cart = () => {
  const [showClearModal, setShowClearModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);

  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please login to checkout');
      // ✅ Pass the current path so login can redirect back
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

  // Empty state
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-pastel-pink via-pastel-green to-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-lg p-10 rounded-3xl shadow-xl border border-white/40 max-w-md"
        >
          <ShoppingBag className="w-16 h-16 text-gray-300 mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">
            Looks like you haven't added anything to your cart yet.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blob-orange text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            Start Shopping
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-pink via-pastel-green to-white pt-16 md:pt-20 pb-16 px-4 md:px-8 flex flex-col items-center relative">
      <div className="max-w-7xl w-full">
        
        {/* Header – mobile-friendly */}
        <div className="flex items-center justify-between w-full gap-3 mb-6 md:mb-10">
          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-gray-600 hover:text-gray-800 transition-colors bg-white/70 backdrop-blur-sm px-2.5 py-1.5 md:px-4 md:py-2 rounded-xl shadow-sm border border-white/40 shrink-0"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm font-medium whitespace-nowrap hidden sm:inline">Continue Shopping</span>
            </button>
            <h1 className="text-xl md:text-3xl font-bold text-gray-800 truncate">My Cart</h1>
          </div>

          <button
            onClick={handleClearCart}
            className="flex items-center gap-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 md:px-4 md:py-2 rounded-xl transition-all bg-white/70 backdrop-blur-sm shadow-sm border border-white/40 shrink-0"
          >
            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline text-xs md:text-sm font-medium">Clear All</span>
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10 w-full">
          
          {/* Left: Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence initial={false} mode="popLayout">
              {cartItems.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="group bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 p-4 md:p-6 hover:shadow-xl transition-shadow w-full flex flex-row items-center gap-4"
                >
                  {/* Left side: item details */}
                  <div className="flex flex-1 flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0">
                    <img
                      src={item.image || 'https://via.placeholder.com/100'}
                      alt={item.name}
                      className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover border border-gray-200 group-hover:border-leaf-green/30 transition-colors shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <h3 className="font-bold text-base md:text-lg text-gray-800 group-hover:text-leaf-green transition-colors truncate">
                        {item.name}
                      </h3>
                      <p className="text-leaf-green font-semibold text-base md:text-lg">
                        ₦{item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Right side: quantity controls + delete */}
                  <div className="flex flex-row items-center gap-2 sm:gap-3 shrink-0">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button
                        onClick={() => handleQty(item._id, item.qty, -1, item.stock)}
                        disabled={item.qty <= 1}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-semibold w-5 sm:w-6 text-center text-sm sm:text-base">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => handleQty(item._id, item.qty, 1, item.stock)}
                        disabled={item.qty >= item.stock}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => dispatch(removeFromCart(item._id))}
                      className="flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 rounded-lg transition-colors ml-1 sm:ml-2 group-hover:scale-105 transition-transform"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline text-xs sm:text-sm font-medium">Remove</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/40 p-6 md:p-8 sticky top-6 w-full h-fit">
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

              <button
                onClick={handleCheckout}
                className="w-full mt-6 bg-leaf-green text-white py-4 rounded-xl font-bold shadow-lg shadow-leaf-green/30 hover:shadow-leaf-green/50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                Proceed to Checkout
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                <AlertCircle className="w-3 h-3" />
                <span>Secure checkout via Paystack</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Custom "Clear Cart" Modal Overlay --- */}
      <AnimatePresence>
        {showClearModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowClearModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-gray-100"
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
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmClearCart}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 shadow-md transition hover:scale-105 active:scale-95"
                >
                  Clear Cart
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cart;