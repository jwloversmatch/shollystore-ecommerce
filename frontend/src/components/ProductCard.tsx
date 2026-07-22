  import { useState, useCallback } from 'react';
  import { motion } from 'framer-motion';
  import { ShoppingCart, Check } from 'lucide-react';
  import { useDispatch } from 'react-redux';
  import toast from 'react-hot-toast';
  import { addToCart } from '../features/cart/cartSlice';

  interface ProductProps {
    _id: string;
    name: string;
    price: number;
    image: string;
    category?: string;
    stock?: number;
    onClick?: () => void;
  }

  const FALLBACK = 'https://via.placeholder.com/200x200?text=🍽';

  // ── CSS keyframes (place in your global CSS file) ─────────────────────────────
  /*
  @keyframes spin-ring {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  .animate-spin-ring {
    animation: spin-ring 14s linear infinite;
  }

  @keyframes pulse-dot {
    0%, 100% { transform: scale(1);   opacity: 1; }
    50%      { transform: scale(1.35); opacity: 0.6; }
  }
  .animate-pulse-dot {
    animation: pulse-dot 2.2s ease-in-out infinite;
  }
  */

  const ProductCard = ({
    _id, name, price, image, category = 'General', stock, onClick,
  }: ProductProps) => {
    const dispatch = useDispatch();
    const [imgError, setImgError]   = useState(false);
    const [added,    setAdded]      = useState(false);

    const isOutOfStock = stock !== undefined && stock === 0;
    const accent       = isOutOfStock ? '#ef4444' : '#e8622a';

    const handleAddToCart = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      if (isOutOfStock) { toast.error('Out of stock!'); return; }
      dispatch(addToCart({ _id, name, image, price, qty: 1, stock: stock ?? 999 }));
      toast.success(`${name} added!`, { icon: '🛒' });
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    }, [dispatch, _id, name, image, price, stock, isOutOfStock]);

    return (
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-20px' }}
        whileHover="hover"
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}  // slightly lighter for mobile
      >
        {/* ── Floating plate ── */}
        <motion.div
          className="relative z-10 w-28 h-28 md:w-32 md:h-32"
          variants={{ hover: { y: -12, scale: 1.06, rotate: 7 } }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        >
          {/* Slow-spinning dashed outer ring – now pure CSS */}
          <div
            className="absolute -inset-3 rounded-full border-[1.5px] border-dashed pointer-events-none animate-spin-ring"
            style={{ borderColor: `${accent}55` }}
          />

          {/* Static inner accent ring */}
          <div
            className="absolute -inset-1 rounded-full pointer-events-none"
            style={{ boxShadow: `0 0 0 1.5px ${accent}44` }}
          />

          {/* Image circle */}
          <div
            className="relative w-full h-full rounded-full overflow-hidden bg-[#1a1a1a]"
            style={{ boxShadow: `0 0 0 3px ${accent}, 0 16px 40px rgba(0,0,0,0.6)` }}
          >
            <img
              src={imgError ? FALLBACK : image}
              alt={name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                <span className="text-red-400 text-[10px] font-extrabold uppercase tracking-wider">Sold Out</span>
              </div>
            )}
          </div>

          {/* Stock pulse dot – now pure CSS */}
          <div
            className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#111] ${
              isOutOfStock ? '' : 'animate-pulse-dot'
            }`}
            style={{ background: isOutOfStock ? '#ef4444' : '#10b981' }}
          />
        </motion.div>

        {/* ── Card body (overlaps circle by -mt) ── */}
        <motion.div
          onClick={onClick}
          className="w-full -mt-14 pt-16 pb-5 px-4 md:px-5 rounded-[26px] cursor-pointer relative overflow-hidden"
          style={{ background: 'linear-gradient(160deg,#1c1c1e 0%,#111111 100%)', willChange: 'transform' }}
          variants={{
            hover: { boxShadow: `0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px ${accent}22` },
          }}
          transition={{ duration: 0.25 }}
        >
          {/* Subtle top glow matching accent */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-10 rounded-full blur-2xl pointer-events-none opacity-40"
            style={{ background: accent }}
          />

          <div className="text-center relative z-10 space-y-1.5">
            {/* Category */}
            <p className="text-[9px] font-black uppercase tracking-[0.22em]" style={{ color: accent }}>
              {category}
            </p>

            {/* Name */}
            <h3 className="text-white font-bold text-sm md:text-[15px] leading-snug line-clamp-2">
              {name}
            </h3>

            {/* Price */}
            <div className="flex items-baseline justify-center gap-0.5 pt-1">
              <span className="text-gray-500 text-xs pb-0.5">₦</span>
              <motion.span
                className="font-black text-[22px] md:text-[26px] tracking-tight text-white"
                variants={{ hover: { color: accent } }}
                transition={{ duration: 0.2 }}
              >
                {price.toLocaleString()}
              </motion.span>
            </div>

            {/* Stock tag */}
            {stock !== undefined && (
              <span
                className="inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full"
                style={{
                  background: isOutOfStock ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
                  color:      isOutOfStock ? '#f87171' : '#34d399',
                }}
              >
                {isOutOfStock ? '✕ Out of stock' : `✓ ${stock} left`}
              </span>
            )}
          </div>
        </motion.div>

        {/* ── Add to Cart — fully outside the card ── */}
        <motion.button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          whileTap={!isOutOfStock ? { scale: 0.91 } : {}}
          variants={{
            hover: !isOutOfStock
              ? { y: -3, boxShadow: `0 14px 32px ${added ? 'rgba(16,185,129,0.4)' : `${accent}55`}` }
              : {},
          }}
          className="mt-3.5 flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-bold tracking-wide transition-colors duration-300"
          style={{
            background: isOutOfStock ? '#1e1e1e' : added ? '#10b981' : accent,
            color:      isOutOfStock ? '#4b4b4b' : 'white',
            boxShadow:  isOutOfStock ? 'none' : added
              ? '0 8px 22px rgba(16,185,129,0.32)'
              : `0 8px 22px ${accent}44`,
            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
          }}
        >
          <motion.span
            animate={added ? { rotate: [0, -14, 14, 0], scale: [1, 1.25, 1] } : {}}
            transition={{ duration: 0.38 }}
          >
            {isOutOfStock ? '✕' : added ? <Check size={13} /> : <ShoppingCart size={13} />}
          </motion.span>
          {isOutOfStock ? 'Unavailable' : added ? 'Added!' : 'Add to Cart'}
        </motion.button>
      </motion.div>
    );
  };

  export default ProductCard;