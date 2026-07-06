import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { RootState } from '../store';
import { removeFromCart, updateQuantity, clearCart } from '../features/cart/cartSlice';
import {
  Trash2, ShoppingBag, Minus, Plus, ArrowLeft,
  AlertCircle, CreditCard, Sparkles, Flame,
} from 'lucide-react';
import SEO from '../components/SEO';

// ─── Constants ─────────────────────────────────────────────────────────────────
const ACCENT = '#e8622a';

// ─── Rehydration type ─────────────────────────────────────────────────────────
interface PersistState { _persist: { version: number; rehydrated: boolean } }

// ─── Shared dark skeleton card ──────────────────────────────────────────────────
const DarkCartSkeleton = () => (
  <div className="animate-pulse flex items-center gap-4 p-5 rounded-2xl" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)' }}>
    <div className="w-20 h-20 rounded-xl shrink-0" style={{ background: '#1c1c1c' }} />
    <div className="flex-1 space-y-3">
      <div className="h-4 w-2/3 rounded-lg" style={{ background: '#1c1c1c' }} />
      <div className="h-3 w-1/3 rounded-lg" style={{ background: '#1c1c1c' }} />
    </div>
    <div className="h-9 w-24 rounded-xl shrink-0" style={{ background: '#1c1c1c' }} />
  </div>
);

// ─── Shared ambient background (moved outside Cart to avoid recreation) ────────
const AmbientBg = () => (
  <>
    <motion.div animate={{ x:['-12%','12%','-12%'], y:['-8%','8%','-8%'] }} transition={{ repeat:Infinity, duration:30, ease:'linear' }}
      className="fixed pointer-events-none rounded-full blur-[130px] -z-10"
      style={{ width:600, height:600, top:-200, left:-200, background:ACCENT, opacity:0.06 }} />
    <motion.div animate={{ x:['12%','-12%','12%'], y:['10%','-10%','10%'] }} transition={{ repeat:Infinity, duration:38, ease:'linear' }}
      className="fixed pointer-events-none rounded-full blur-[130px] -z-10"
      style={{ width:560, height:560, bottom:-200, right:-200, background:'#10b981', opacity:0.04 }} />
  </>
);

// ═══════════════════════════════════════════════════════════════════════════════
const Cart = () => {
  const [showClearModal, setShowClearModal] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch();
  const { cartItems } = useSelector((s: RootState) => s.cart);
  const { user }      = useSelector((s: RootState) => s.auth);
  const isRehydrated  = useSelector((s: RootState & PersistState) => s._persist?.rehydrated);

  const totalItems = cartItems.reduce((a, i) => a + i.qty, 0);
  const totalPrice = cartItems.reduce((a, i) => a + i.price * i.qty, 0);

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please login to checkout');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    navigate('/checkout');
  };

  const handleQty = (id: string, qty: number, delta: number, stock: number) => {
    const next = qty + delta;
    if (next >= 1 && next <= stock) dispatch(updateQuantity({ _id: id, qty: next }));
  };

  // ══════ LOADING ══════════════════════════════════════════════════════════════
  if (isRehydrated === false) {
    return (
      <div className="min-h-screen pt-20 pb-24 px-4 md:px-8" style={{ background:'#0A0A0B' }}>
        <SEO title="Your Cart" description="Review your items and proceed to secure checkout." />
        <div className="max-w-4xl mx-auto space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <DarkCartSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  // ══════ EMPTY CART ════════════════════════════════════════════════════════════
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden" style={{ background:'#0A0A0B' }}>
        <SEO title="Your Cart" description="Review your items and proceed to secure checkout." />
        <AmbientBg />

        <motion.div initial={{ opacity:0, scale:0.93, y:20 }} animate={{ opacity:1, scale:1, y:0 }}
          transition={{ duration:0.55, ease:'easeOut' }}
          className="relative z-10 w-full max-w-sm text-center rounded-3xl p-10"
          style={{ background:'#141414', border:'1px solid rgba(255,255,255,0.07)', boxShadow:'0 40px 90px rgba(0,0,0,0.6)' }}>

          {/* Accent top line */}
          <div className="absolute top-0 inset-x-0 h-px rounded-t-3xl"
            style={{ background:`linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }} />

          {/* Animated bag in plate ring */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <motion.div animate={{ rotate:360 }} transition={{ duration:20, repeat:Infinity, ease:'linear' }}
                className="absolute -inset-4 rounded-full border-2 border-dashed pointer-events-none"
                style={{ borderColor:`${ACCENT}30` }} />
              <div className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{ background:`${ACCENT}12`, boxShadow:`0 0 0 3px ${ACCENT}` }}>
                <ShoppingBag className="w-10 h-10" style={{ color:ACCENT }} />
              </div>
            </div>
          </div>

          <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] mb-3" style={{ color:ACCENT }}>
            Empty
          </p>
          <h2 className="text-3xl font-black text-white mb-3 leading-tight">Your cart<br />is empty</h2>
          <p className="text-gray-600 text-sm mb-8 leading-relaxed">
            Looks like you haven't added anything yet. Browse our menu and pick something delicious!
          </p>

          <motion.button
            whileHover={{ scale:1.04, boxShadow:`0 16px 40px ${ACCENT}55` }}
            whileTap={{ scale:0.97 }}
            onClick={() => navigate('/')}
            className="w-full py-4 rounded-xl font-black text-white text-[15px] flex items-center justify-center gap-2.5 group"
            style={{ background:ACCENT, boxShadow:`0 8px 24px ${ACCENT}44` }}>
            <Sparkles className="w-5 h-5" />
            Start Shopping
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ══════ CART WITH ITEMS ════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen pt-4 pb-28 md:pb-16 px-4 md:px-6 relative overflow-x-hidden" style={{ background:'#0A0A0B' }}>
      <SEO title="Your Cart" description="Review your items and proceed to secure checkout." />
      <AmbientBg />

      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.45 }}
          className="flex items-center justify-between gap-3 mb-6 md:mb-8 pt-2">

          <div className="flex items-center gap-3 min-w-0">
            <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl shrink-0 text-gray-500 hover:text-white transition-colors"
              style={{ background:'#141414', border:'1px solid rgba(255,255,255,0.07)' }}>
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-bold hidden sm:inline">Continue Shopping</span>
            </motion.button>
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em]" style={{ color:ACCENT }}>My Cart</p>
              <h1 className="text-xl md:text-3xl font-black text-white leading-none truncate">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </h1>
            </div>
          </div>

          <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
            onClick={() => cartItems.length > 0 && setShowClearModal(true)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl shrink-0 text-red-400 hover:text-red-300 transition-colors"
            style={{ background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.18)' }}>
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline text-xs font-bold">Clear All</span>
          </motion.button>
        </motion.div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-8">

          {/* ─── Cart items list ─── */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence mode="popLayout">
              {cartItems.map((item, idx) => (
                <motion.div key={item._id} layout
                  initial={{ opacity:0, y:20, scale:0.98 }}
                  animate={{ opacity:1, y:0, scale:1 }}
                  exit={{ opacity:0, scale:0.95, transition:{ duration:0.18 } }}
                  transition={{ type:'spring', stiffness:300, damping:26, delay: idx * 0.05 }}
                  className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 md:p-5 rounded-2xl transition-all"
                  style={{ background:'#141414', border:'1px solid rgba(255,255,255,0.07)' }}
                  whileHover={{ borderColor:'rgba(255,255,255,0.12)' }}>

                  {/* Image */}
                  <motion.div whileHover={{ scale:1.06 }} transition={{ type:'spring', stiffness:300, damping:20 }}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden shrink-0"
                    style={{ boxShadow:`0 0 0 2px transparent` }}>
                    <img src={item.image || 'https://via.placeholder.com/100'}
                      alt={item.name}
                      className="w-full h-full object-cover" />
                  </motion.div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 w-full">
                    <h3 className="font-bold text-base md:text-lg text-white truncate leading-tight transition-colors"
                      style={{}}>
                      {item.name}
                    </h3>
                    <p className="text-sm font-semibold mt-0.5" style={{ color:ACCENT }}>
                      ₦{item.price.toLocaleString()} / unit
                    </p>

                    {/* Controls row */}
                    <div className="flex items-center justify-between mt-3 gap-3 flex-wrap">
                      {/* Qty pill */}
                      <div className="flex items-center rounded-xl overflow-hidden"
                        style={{ background:'#1c1c1c', border:'1px solid rgba(255,255,255,0.08)' }}>
                        <motion.button whileTap={{ scale:0.88 }}
                          onClick={() => handleQty(item._id, item.qty, -1, item.stock)}
                          disabled={item.qty <= 1}
                          className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                          <Minus className="w-3.5 h-3.5" />
                        </motion.button>

                        <motion.span
                          key={item.qty}
                          initial={{ scale:1.4, opacity:0 }}
                          animate={{ scale:1, opacity:1 }}
                          transition={{ type:'spring', stiffness:400, damping:20 }}
                          className="w-9 text-center font-black text-white text-sm select-none">
                          {item.qty}
                        </motion.span>

                        <motion.button whileTap={{ scale:0.88 }}
                          onClick={() => handleQty(item._id, item.qty, 1, item.stock)}
                          disabled={item.qty >= item.stock}
                          className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                          <Plus className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>

                      {/* Subtotal + remove */}
                      <div className="flex items-center gap-3 ml-auto">
                        <div className="text-right">
                          <p className="font-black text-white text-lg leading-none">
                            ₦{(item.price * item.qty).toLocaleString()}
                          </p>
                          <p className="text-gray-600 text-[10px] mt-0.5">
                            {item.qty} × ₦{item.price.toLocaleString()}
                          </p>
                        </div>
                        <motion.button whileHover={{ scale:1.06 }} whileTap={{ scale:0.93 }}
                          onClick={() => dispatch(removeFromCart(item._id))}
                          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0"
                          style={{ background:'rgba(239,68,68,0.09)', border:'1px solid rgba(239,68,68,0.2)', color:'#f87171' }}>
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ─── Order summary ─── */}
          <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.15, duration:0.5 }}
            className="lg:col-span-1">
            <div className="relative rounded-2xl p-6 md:p-7 lg:sticky lg:top-24"
              style={{ background:'#141414', border:'1px solid rgba(255,255,255,0.07)', boxShadow:'0 20px 60px rgba(0,0,0,0.4)' }}>

              {/* Top orange hairline */}
              <div className="absolute top-0 inset-x-0 h-px rounded-t-2xl"
                style={{ background:`linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }} />

              {/* Header */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:`${ACCENT}18` }}>
                  <Flame className="w-4 h-4" style={{ color:ACCENT }} />
                </div>
                <h2 className="text-lg font-black text-white">Order Summary</h2>
              </div>

              {/* Line items */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Subtotal</span>
                  <span className="text-white font-bold">₦{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Items</span>
                  <span className="text-white font-bold">{totalItems}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Delivery</span>
                  <span className="font-bold" style={{ color:'#10b981' }}>Free</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Tax</span>
                  <span className="text-gray-600 font-medium">Included</span>
                </div>
              </div>

              {/* Divider */}
              <div className="my-5 h-px" style={{ background:'rgba(255,255,255,0.06)' }} />

              {/* Total */}
              <div className="flex justify-between items-end">
                <span className="text-gray-400 font-bold text-sm uppercase tracking-wider">Total</span>
                <div className="text-right">
                  <motion.span key={totalPrice}
                    initial={{ scale:1.15, opacity:0.7 }} animate={{ scale:1, opacity:1 }}
                    transition={{ type:'spring', stiffness:400, damping:20 }}
                    className="block text-3xl font-black" style={{ color:ACCENT }}>
                    ₦{totalPrice.toLocaleString()}
                  </motion.span>
                </div>
              </div>

              {/* Checkout button */}
              <motion.button
                whileHover={{ scale:1.02, boxShadow:`0 16px 40px ${ACCENT}55` }}
                whileTap={{ scale:0.98 }}
                onClick={handleCheckout}
                className="w-full mt-6 py-4 rounded-xl font-black text-white text-[15px] flex items-center justify-center gap-2.5 group"
                style={{ background:ACCENT, boxShadow:`0 8px 24px ${ACCENT}44` }}>
                <CreditCard className="w-5 h-5" />
                Proceed to Checkout
              </motion.button>

              {/* Security note */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <AlertCircle className="w-3 h-3 text-gray-700 shrink-0" />
                <span className="text-[11px] text-gray-700">Secure checkout via Paystack</span>
              </div>

              {/* Payment logos hint */}
              <div className="mt-4 flex items-center justify-center gap-3">
                {['💳', '🏦', '💬'].map((icon, i) => (
                  <div key={i} className="w-9 h-6 rounded-md flex items-center justify-center text-sm"
                    style={{ background:'#1c1c1c', border:'1px solid rgba(255,255,255,0.06)' }}>
                    {icon}
                  </div>
                ))}
                <span className="text-[10px] text-gray-700">Card · Bank · WhatsApp</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ══ Clear Cart Modal ════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showClearModal && (
          <>
            <motion.div key="scrim"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 z-50"
              style={{ background:'rgba(0,0,0,0.72)', backdropFilter:'blur(8px)' }}
              onClick={() => setShowClearModal(false)} />

            <motion.div key="modal"
              initial={{ scale:0.9, y:24, opacity:0 }} animate={{ scale:1, y:0, opacity:1 }} exit={{ scale:0.93, y:16, opacity:0 }}
              transition={{ type:'spring', stiffness:320, damping:28 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="relative w-full max-w-sm rounded-2xl p-7"
                style={{ background:'#141414', border:'1px solid rgba(255,255,255,0.08)', boxShadow:'0 40px 90px rgba(0,0,0,0.6)' }}
                onClick={e => e.stopPropagation()}>

                {/* Red hairline */}
                <div className="absolute top-0 inset-x-0 h-px rounded-t-2xl"
                  style={{ background:'linear-gradient(90deg, transparent, rgba(239,68,68,0.6), transparent)' }} />

                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)' }}>
                  <Trash2 className="w-6 h-6 text-red-400" />
                </div>

                <h3 className="text-2xl font-black text-white mb-2">Clear your cart?</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-7">
                  All {totalItems} {totalItems === 1 ? 'item' : 'items'} will be removed. This action cannot be undone.
                </p>

                <div className="flex gap-3">
                  <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                    onClick={() => setShowClearModal(false)}
                    className="flex-1 py-3.5 rounded-xl text-sm font-bold text-gray-400 hover:text-white transition-colors"
                    style={{ background:'#1c1c1c', border:'1px solid rgba(255,255,255,0.08)' }}>
                    Cancel
                  </motion.button>
                  <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                    onClick={() => { dispatch(clearCart()); setShowClearModal(false); }}
                    className="flex-1 py-3.5 rounded-xl text-sm font-bold text-white"
                    style={{ background:'rgba(239,68,68,0.9)', boxShadow:'0 6px 18px rgba(239,68,68,0.3)' }}>
                    Clear Cart
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cart;