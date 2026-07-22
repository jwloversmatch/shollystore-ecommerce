import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { addToCart } from '../features/cart/cartSlice';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';
import { ShoppingCart, ArrowLeft, ImageOff, Minus, Plus, Check, Flame } from 'lucide-react';
import { useGetProductsQuery } from '../features/api/apiSlice';

// ─── Constants ─────────────────────────────────────────────────────────────────
const ACCENT      = '#e8622a';
const PLACEHOLDER = 'https://via.placeholder.com/600';

interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock: number;
  // ✅ Updated to match the new populated object
  category?: string | { _id: string; name: string; slug?: string; parent?: string | null };
  images?: string[];
}

// Helper: safely get the category name
const getCategoryName = (cat: Product['category']): string => {
  if (!cat) return 'General';
  return typeof cat === 'string' ? cat : cat.name ?? 'General';
};

// ═══════════════════════════════════════════════════════════════════════════════
const ProductDetail = () => {
  const { slug }    = useParams<{ slug: string }>();
  const dispatch    = useDispatch();
  const navigate    = useNavigate();

  const [qty,        setQty]        = useState(1);
  const [imgError,   setImgError]   = useState(false);
  const [added,      setAdded]      = useState(false);

  const { data: products = [], isLoading } = useGetProductsQuery({});
  const product = products.find((p: Product) => p.slug === slug);

  const handleAddToCart = () => {
    if (!product || product.stock === 0) { toast.error('Out of stock!'); return; }
    dispatch(addToCart({
      _id: product._id,
      name: product.name,
      image: product.images?.[0] || PLACEHOLDER,
      price: product.price,
      qty,
      stock: product.stock,
    }));
    toast.success(`${product.name} added to cart! 🛒`);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // ══════ LOADING SKELETON ══════════════════════════════════════════════════════
  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 md:pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto" style={{ background:'#0A0A0B' }}>
        <div className="h-9 w-20 rounded-xl animate-pulse mb-8" style={{ background:'#141414' }} />
        <div className="grid md:grid-cols-2 gap-10">
          {/* Image skeleton */}
          <div className="h-[400px] md:h-[500px] rounded-3xl animate-pulse" style={{ background:'#141414' }} />
          {/* Info skeleton */}
          <div className="space-y-5 pt-2">
            <div className="h-4 w-20 rounded-full animate-pulse" style={{ background:'#141414' }} />
            <div className="h-12 w-3/4 rounded-xl animate-pulse" style={{ background:'#141414' }} />
            <div className="h-14 w-40 rounded-xl animate-pulse" style={{ background:'#141414' }} />
            <div className="space-y-2.5">
              {[1, 0.9, 0.7].map((w, i) => (
                <div key={i} className="h-4 rounded animate-pulse" style={{ background:'#141414', width:`${w * 100}%` }} />
              ))}
            </div>
            <div className="h-12 w-48 rounded-xl animate-pulse" style={{ background:'#141414' }} />
            <div className="flex gap-3 pt-2">
              <div className="h-14 w-36 rounded-xl animate-pulse" style={{ background:'#141414' }} />
              <div className="h-14 flex-1 rounded-xl animate-pulse" style={{ background:'#141414' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════ NOT FOUND ══════════════════════════════════════════════════════════════
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background:'#0A0A0B' }}>
        <motion.div initial={{ opacity:0, scale:0.92 }} animate={{ opacity:1, scale:1 }}
          transition={{ duration:0.5 }}
          className="relative w-full max-w-sm text-center rounded-3xl p-10"
          style={{ background:'#141414', border:'1px solid rgba(255,255,255,0.07)', boxShadow:'0 40px 90px rgba(0,0,0,0.6)' }}>
          <div className="absolute top-0 inset-x-0 h-px rounded-t-3xl"
            style={{ background:`linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }} />
          <div className="flex justify-center mb-5">
            <div className="relative">
              <motion.div animate={{ rotate:360 }} transition={{ duration:18, repeat:Infinity, ease:'linear' }}
                className="absolute -inset-4 rounded-full border-2 border-dashed pointer-events-none"
                style={{ borderColor:`${ACCENT}28` }} />
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background:`${ACCENT}12`, boxShadow:`0 0 0 3px ${ACCENT}` }}>
                <ImageOff className="w-9 h-9" style={{ color:ACCENT }} />
              </div>
            </div>
          </div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] mb-2" style={{ color:ACCENT }}>404</p>
          <h2 className="text-2xl font-black text-white mb-2">Product Not Found</h2>
          <p className="text-gray-600 text-sm mb-7">This product doesn't exist or may have been removed.</p>
          <motion.button whileHover={{ scale:1.04, boxShadow:`0 16px 40px ${ACCENT}55` }} whileTap={{ scale:0.96 }}
            onClick={() => navigate('/')}
            className="w-full py-4 rounded-xl font-black text-white flex items-center justify-center gap-2"
            style={{ background:ACCENT, boxShadow:`0 8px 24px ${ACCENT}44` }}>
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;
  const categoryName = getCategoryName(product.category);

  // ══════ MAIN PAGE ═════════════════════════════════════════════════════════════
  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
      className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-16 px-4 md:px-8 max-w-7xl mx-auto relative"
      style={{ background:'#0A0A0B' }}>

      <SEO title={product.name}
        description={`Buy ${product.name} from LotceWieth. ${product.description || ''}`}
        ogImage={product.images?.[0]} ogType="product" />

      {/* Ambient orb */}
      <div className="fixed pointer-events-none rounded-full blur-[130px] -z-10"
        style={{ width:500, height:500, top:-100, right:-100, background:ACCENT, opacity:0.05 }} />

      {/* ── Back button ── */}
      <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-8 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:text-white transition-colors"
        style={{ background:'#141414', border:'1px solid rgba(255,255,255,0.08)' }}>
        <ArrowLeft className="w-4 h-4" /> Back
      </motion.button>

      {/* ── Two-column layout ── */}
      <div className="grid md:grid-cols-2 gap-8 lg:gap-14 items-start">

        {/* ─── Image panel ─── */}
        <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.1, duration:0.5 }}
          className="relative rounded-3xl overflow-hidden sticky top-24"
          style={{ background:'#141414', border:'1px solid rgba(255,255,255,0.07)', boxShadow:'0 24px 60px rgba(0,0,0,0.5)' }}>
          {/* Top accent hairline */}
          <div className="absolute top-0 inset-x-0 h-px"
            style={{ background:`linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }} />

          <div className="p-8 flex items-center justify-center" style={{ minHeight:380 }}>
            {product.images?.[0] && !imgError ? (
              <motion.img
                src={product.images[0]} alt={product.name}
                onError={() => setImgError(true)}
                className="max-h-80 md:max-h-96 w-full object-contain drop-shadow-2xl"
                whileHover={{ scale:1.04 }}
                transition={{ type:'spring', stiffness:280, damping:22 }} />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 h-80 w-full text-gray-700">
                <ImageOff className="w-16 h-16" />
                <p className="text-sm font-semibold">No image available</p>
              </div>
            )}
          </div>

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 rounded-3xl flex items-center justify-center"
              style={{ background:'rgba(0,0,0,0.55)' }}>
              <div className="px-6 py-2.5 rounded-full font-black text-sm"
                style={{ background:'rgba(239,68,68,0.9)', color:'#fff' }}>
                Out of Stock
              </div>
            </div>
          )}
        </motion.div>

        {/* ─── Product info ─── */}
        <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.15, duration:0.5 }}
          className="space-y-6 pt-2">

          {/* Category + Name */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background:`${ACCENT}18` }}>
                <Flame className="w-3 h-3" style={{ color:ACCENT }} />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.22em]"
                style={{ color:ACCENT }}>
                {categoryName}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white leading-[1.05]">
              {product.name}
            </h1>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-gray-600 text-xl font-bold">₦</span>
            <motion.span key={product.price}
              initial={{ scale:1.1, opacity:0 }} animate={{ scale:1, opacity:1 }}
              className="text-4xl md:text-5xl font-black leading-none" style={{ color:ACCENT }}>
              {product.price.toLocaleString()}
            </motion.span>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-gray-500 leading-relaxed text-sm md:text-base">
              {product.description}
            </p>
          )}

          {/* Stock status */}
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
            style={{ background:'#1c1c1c', border:'1px solid rgba(255,255,255,0.07)' }}>
            <motion.div
              animate={!isOutOfStock ? { scale:[1, 1.4, 1], opacity:[1, 0.5, 1] } : {}}
              transition={{ duration:2.5, repeat:Infinity }}
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: isOutOfStock ? '#ef4444' : '#10b981' }} />
            <span className="text-sm font-bold text-white">
              {isOutOfStock ? 'Out of Stock' : `In Stock — ${product.stock} available`}
            </span>
          </div>

          {/* Qty selector + Add to Cart */}
          <AnimatePresence>
            {!isOutOfStock && (
              <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">

                {/* Quantity pill */}
                <div className="flex items-center rounded-xl overflow-hidden shrink-0"
                  style={{ background:'#1c1c1c', border:'1px solid rgba(255,255,255,0.09)' }}>
                  <motion.button whileTap={{ scale:0.85 }} onClick={() => qty > 1 && setQty(q => q - 1)}
                    disabled={qty <= 1}
                    className="w-12 h-14 flex items-center justify-center text-red-400 hover:bg-red-500/10 disabled:opacity-30 transition-colors">
                    <Minus className="w-4 h-4" />
                  </motion.button>
                  <motion.span key={qty}
                    initial={{ scale:1.3, opacity:0.6 }} animate={{ scale:1, opacity:1 }}
                    transition={{ type:'spring', stiffness:400, damping:20 }}
                    className="w-12 text-center text-xl font-black text-white select-none">
                    {qty}
                  </motion.span>
                  <motion.button whileTap={{ scale:0.85 }} onClick={() => qty < product.stock && setQty(q => q + 1)}
                    disabled={qty >= product.stock}
                    className="w-12 h-14 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-30 transition-colors">
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Add to Cart button */}
                <motion.button
                  onClick={handleAddToCart}
                  whileHover={{ scale:1.03, boxShadow: added ? '0 14px 36px rgba(16,185,129,0.45)' : `0 14px 36px ${ACCENT}55` }}
                  whileTap={{ scale:0.97 }}
                  className="flex-1 h-14 rounded-xl font-black text-white text-base flex items-center justify-center gap-2.5 group transition-all"
                  style={{
                    background:   added ? '#10b981' : ACCENT,
                    boxShadow:    added ? '0 8px 24px rgba(16,185,129,0.35)' : `0 8px 24px ${ACCENT}44`,
                  }}>
                  <motion.span animate={added ? { rotate:[0,-15,15,0], scale:[1,1.3,1] } : {}} transition={{ duration:0.4 }}>
                    {added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                  </motion.span>
                  {added ? 'Added to Cart!' : 'Add to Cart'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Out of stock CTA */}
          {isOutOfStock && (
            <div className="flex items-center gap-3 px-5 py-4 rounded-xl border"
              style={{ background:'rgba(239,68,68,0.06)', borderColor:'rgba(239,68,68,0.2)' }}>
              <span className="text-sm text-red-400 font-semibold">
                This product is currently unavailable. Check back later.
              </span>
            </div>
          )}

          {/* Divider + meta */}
          <div className="pt-2 border-t" style={{ borderColor:'rgba(255,255,255,0.06)' }}>
            <div className="flex flex-wrap gap-3 mt-4">
              {[
                { label:'Category', value: categoryName },
                { label:'Unit price', value: `₦${product.price.toLocaleString()}` },
              ].map(item => (
                <div key={item.label} className="px-4 py-2.5 rounded-xl"
                  style={{ background:'#1c1c1c', border:'1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-gray-600 mb-0.5">{item.label}</p>
                  <p className="text-white font-bold text-sm">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProductDetail;