import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { addToCart } from '../features/cart/cartSlice';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';
import {
  ShoppingCart, ArrowLeft, ImageOff, Minus, Plus,
  Check, Tag, Truck, RefreshCw, ChevronRight,
} from 'lucide-react';
import { useGetProductsQuery, useGetCategoryTreeQuery } from '../features/api/apiSlice';
import type { ProductItem } from '../types/home';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface CategoryNode { _id: string; name: string; slug: string; children?: CategoryNode[]; }

// ─── Constants ─────────────────────────────────────────────────────────────────
const ACCENT      = '#e8622a';
const PLACEHOLDER = 'https://via.placeholder.com/600';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getCategoryName = (cat: ProductItem['category']): string =>
  !cat ? 'General' : typeof cat === 'string' ? cat : cat.name ?? 'General';

const getCategoryId = (cat: ProductItem['category']): string | undefined =>
  !cat ? undefined : typeof cat === 'string' ? cat : cat._id;

const findCategoryById = (tree: CategoryNode[], id: string): CategoryNode | null => {
  for (const node of tree) {
    if (node._id === id) return node;
    if (node.children) { const found = findCategoryById(node.children, id); if (found) return found; }
  }
  return null;
};

// ═══════════════════════════════════════════════════════════════════════════════
const ProductDetail = () => {
  const { slug }  = useParams<{ slug: string }>();
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const [qty,           setQty]           = useState(1);
  const [imgError,      setImgError]      = useState(false);
  const [added,         setAdded]         = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: productsData, isLoading } = useGetProductsQuery({ limit: 9999 });
  const products: ProductItem[]           = productsData?.products ?? [];
  const product                           = products.find(p => p.slug === slug);

  const { data: categoryTree = [] } = useGetCategoryTreeQuery(undefined);
  const categoryId   = product ? getCategoryId(product.category) : undefined;
  const categoryNode = categoryId ? findCategoryById(categoryTree, categoryId) : null;

  const handleAddToCart = () => {
    if (!product || product.stock === 0) { toast.error('Out of stock!'); return; }
    dispatch(addToCart({ _id:product._id, name:product.name, image:product.images?.[0]||PLACEHOLDER, price:product.price, qty, stock:product.stock??0 }));
    toast.success(`${product.name} added! 🛒`);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // ══════ LOADING ══════════════════════════════════════════════════════════════
  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4 md:px-8 max-w-7xl mx-auto" style={{ background:'#0A0A0B' }}>
        <div className="h-8 w-24 rounded-xl animate-pulse mb-6 mt-4" style={{ background:'#141414' }} />
        <div className="grid md:grid-cols-2 gap-8">
          <div className="rounded-3xl animate-pulse aspect-[4/3]" style={{ background:'#141414' }} />
          <div className="space-y-4 pt-2">
            {[20,75,50,100,80,70].map((w,i)=>(
              <div key={i} className="h-4 rounded animate-pulse" style={{ background:'#141414', width:`${w}%` }} />
            ))}
            <div className="h-12 w-44 rounded-xl animate-pulse" style={{ background:'#141414' }} />
            <div className="flex gap-3 pt-2">
              <div className="h-14 w-36 rounded-xl animate-pulse" style={{ background:'#141414' }} />
              <div className="h-14 flex-1 rounded-xl animate-pulse" style={{ background:'#141414' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════ NOT FOUND ════════════════════════════════════════════════════════════
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background:'#0A0A0B' }}>
        <motion.div initial={{ opacity:0, scale:0.92 }} animate={{ opacity:1, scale:1 }}
          className="relative w-full max-w-sm text-center rounded-3xl p-10"
          style={{ background:'#141414', border:'1px solid rgba(255,255,255,0.07)', boxShadow:'0 40px 90px rgba(0,0,0,0.6)' }}>
          <div className="absolute top-0 inset-x-0 h-px rounded-t-3xl"
            style={{ background:`linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }} />
          <div className="flex justify-center mb-5">
            <div className="relative">
              <motion.div animate={{ rotate:360 }} transition={{ duration:18, repeat:Infinity, ease:'linear' }}
                className="absolute -inset-4 rounded-full border-2 border-dashed"
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
          <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }} onClick={() => navigate('/')}
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
  const images       = product.images?.length ? product.images : [PLACEHOLDER];

  // ══════ MAIN PAGE ═════════════════════════════════════════════════════════════
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.4 }}
      className="min-h-screen pt-20 md:pt-24 pb-36 md:pb-16 px-4 md:px-8 max-w-7xl mx-auto"
      style={{ background:'#0A0A0B' }}>

      <SEO title={product.name}
        description={`Buy ${product.name} from LotceWieth. ${product.description||''}`}
        ogImage={product.images?.[0]} ogType="product" />

      {/* Ambient orb */}
      <div className="fixed pointer-events-none rounded-full blur-[130px] -z-10"
        style={{ width:500, height:500, top:-100, right:-100, background:ACCENT, opacity:0.05 }} />

      {/* ── Breadcrumb nav ── */}
      <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}
        className="flex items-center gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
        <motion.button whileHover={{ scale:1.06 }} whileTap={{ scale:0.94 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-gray-500 hover:text-white transition-colors shrink-0"
          style={{ background:'#141414', border:'1px solid rgba(255,255,255,0.08)' }}>
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </motion.button>

        {categoryNode && (
          <div className="flex items-center gap-1.5 text-xs shrink-0">
            <ChevronRight className="w-3.5 h-3.5 text-gray-700" />
            <Link to="/shop" className="text-gray-600 hover:text-white font-semibold transition-colors">Shop</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-700" />
            <Link to={`/shop/${categoryNode.slug}`} className="font-semibold transition-colors" style={{ color:ACCENT }}>
              {categoryNode.name}
            </Link>
          </div>
        )}
      </motion.div>

      {/* ══════════ MAIN GRID ══════════════════════════════════════════════════ */}
      <div className="grid md:grid-cols-2 gap-6 md:gap-10 lg:gap-14 items-start">

        {/* ─── IMAGE PANEL ─── */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="md:sticky md:top-24 space-y-3">

          {/* Main image */}
          <div className="relative rounded-2xl md:rounded-3xl overflow-hidden"
            style={{ background:'#141414', border:'1px solid rgba(255,255,255,0.07)' }}>
            {/* top hairline */}
            <div className="absolute top-0 inset-x-0 h-px"
              style={{ background:`linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }} />

            <div className="flex items-center justify-center p-4 md:p-8"
              style={{ minHeight:260, maxHeight:420 }}>
              {images[selectedImage] && !imgError ? (
                <motion.img
                  key={selectedImage}
                  initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }}
                  transition={{ duration:0.25 }}
                  src={images[selectedImage]} alt={product.name}
                  onError={() => setImgError(true)}
                  className="w-full object-contain drop-shadow-2xl"
                  style={{ maxHeight:360 }}
                  whileHover={{ scale:1.03 }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-16 w-full text-gray-700">
                  <ImageOff className="w-12 h-12" />
                  <p className="text-sm font-semibold">No image</p>
                </div>
              )}
            </div>

            {/* Out-of-stock tint */}
            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center"
                style={{ background:'rgba(0,0,0,0.6)' }}>
                <span className="px-5 py-2 rounded-full font-black text-sm text-white"
                  style={{ background:'rgba(239,68,68,0.9)' }}>
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails — horizontal scroll on mobile */}
          {images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
              {images.map((img, idx) => (
                <motion.button key={idx} whileHover={{ scale:1.06 }} whileTap={{ scale:0.94 }}
                  onClick={() => setSelectedImage(idx)}
                  className="w-16 h-16 md:w-18 md:h-18 rounded-xl overflow-hidden shrink-0 border-2 transition-all"
                  style={{
                    borderColor:  idx === selectedImage ? ACCENT : 'rgba(255,255,255,0.1)',
                    boxShadow:    idx === selectedImage ? `0 0 0 1px ${ACCENT}` : 'none',
                    opacity:      idx === selectedImage ? 1 : 0.5,
                  }}>
                  <img src={img} alt={`View ${idx+1}`} className="w-full h-full object-cover" />
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>

        {/* ─── PRODUCT INFO ─── */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
          className="space-y-5">

          {/* Category + Name */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0"
                style={{ background:`${ACCENT}18` }}>
                <Tag className="w-3 h-3" style={{ color:ACCENT }} />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.22em]" style={{ color:ACCENT }}>
                {categoryName}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-[1.05]">
              {product.name}
            </h1>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1">
            <span className="text-gray-600 text-xl font-bold">₦</span>
            <span className="text-3xl sm:text-4xl font-black" style={{ color:ACCENT }}>
              {product.price.toLocaleString()}
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-gray-400 leading-relaxed text-sm md:text-[15px]">
              {product.description}
            </p>
          )}

          {/* Stock pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
            style={{ background:'#1c1c1c', border:'1px solid rgba(255,255,255,0.07)' }}>
            <motion.div
              animate={!isOutOfStock ? { scale:[1,1.5,1], opacity:[1,0.4,1] } : {}}
              transition={{ duration:2.5, repeat:Infinity }}
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: isOutOfStock ? '#ef4444' : '#10b981' }} />
            <span className="text-sm font-bold text-white">
              {isOutOfStock ? 'Out of Stock' : `In Stock — ${product.stock} units left`}
            </span>
          </div>

          {/* ─── Desktop qty + CTA (hidden on mobile) ─── */}
          {!isOutOfStock && (
            <div className="hidden sm:flex items-center gap-3">
              {/* Qty */}
              <div className="flex items-center rounded-xl overflow-hidden shrink-0"
                style={{ background:'#1c1c1c', border:'1px solid rgba(255,255,255,0.09)' }}>
                <motion.button whileTap={{ scale:0.85 }} onClick={() => qty > 1 && setQty(q=>q-1)}
                  disabled={qty<=1}
                  className="w-11 h-12 flex items-center justify-center text-red-400 hover:bg-red-500/10 disabled:opacity-30 transition-colors">
                  <Minus className="w-4 h-4" />
                </motion.button>
                <motion.span key={qty}
                  initial={{ scale:1.3, opacity:0.6 }} animate={{ scale:1, opacity:1 }}
                  transition={{ type:'spring', stiffness:400, damping:20 }}
                  className="w-10 text-center text-lg font-black text-white select-none">
                  {qty}
                </motion.span>
                <motion.button whileTap={{ scale:0.85 }} onClick={() => qty < (product.stock??0) && setQty(q=>q+1)}
                  disabled={qty>=(product.stock??0)}
                  className="w-11 h-12 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-30 transition-colors">
                  <Plus className="w-4 h-4" />
                </motion.button>
              </div>
              {/* Add to Cart */}
              <motion.button onClick={handleAddToCart}
                whileHover={{ scale:1.03, boxShadow: added ? '0 14px 36px rgba(16,185,129,0.45)' : `0 14px 36px ${ACCENT}55` }}
                whileTap={{ scale:0.97 }}
                className="flex-1 h-12 rounded-xl font-black text-white text-[15px] flex items-center justify-center gap-2.5 transition-all"
                style={{ background: added ? '#10b981' : ACCENT, boxShadow: added ? '0 8px 24px rgba(16,185,129,0.35)' : `0 8px 24px ${ACCENT}44` }}>
                <motion.span animate={added ? { rotate:[0,-15,15,0], scale:[1,1.3,1] } : {}} transition={{ duration:0.38 }}>
                  {added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                </motion.span>
                {added ? 'Added to Cart!' : 'Add to Cart'}
              </motion.button>
            </div>
          )}

          {/* Out of stock message */}
          {isOutOfStock && (
            <div className="px-5 py-4 rounded-xl border text-sm text-red-400 font-semibold"
              style={{ background:'rgba(239,68,68,0.06)', borderColor:'rgba(239,68,68,0.2)' }}>
              Currently unavailable. Check back later.
            </div>
          )}

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-2.5 pt-3 border-t" style={{ borderColor:'rgba(255,255,255,0.06)' }}>
            {[
              { label:'Category', value: categoryName },
              { label:'Unit Price', value: `₦${product.price.toLocaleString()}` },
              ...(product.brand ? [{ label:'Brand', value: product.brand }] : []),
              ...(product.sku   ? [{ label:'SKU',   value: product.sku   }] : []),
            ].map(item => (
              <div key={item.label} className="p-3 rounded-xl"
                style={{ background:'#1c1c1c', border:'1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-[9px] font-extrabold uppercase tracking-wider text-gray-600 mb-1">{item.label}</p>
                <p className="text-white font-bold text-xs truncate">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Shipping + returns — small text */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 shrink-0" />
              <span>Free shipping over ₦50,000</span>
            </div>
            <div className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 shrink-0" />
              <span>30-day easy returns</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ══ MOBILE STICKY CTA BAR (sm and below only) ═══════════════════════════
           Sits above the bottom nav bar (which is 72px tall).
           Contains a compact qty control + full-width Add to Cart button.
      ══════════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {!isOutOfStock && (
          <motion.div
            initial={{ y:120, opacity:0 }}
            animate={{ y:0,   opacity:1 }}
            exit={{ y:120, opacity:0 }}
            transition={{ type:'spring', stiffness:280, damping:28 }}
            className="fixed inset-x-0 z-40 sm:hidden"
            style={{ bottom:72 }}>  {/* 72px = bottom nav height */}
            {/* Fade gradient above the bar */}
            <div className="h-8 pointer-events-none"
              style={{ background:'linear-gradient(transparent, #0A0A0B)' }} />

            <div className="bg-[#0A0A0B] px-4 pb-3 pt-2 border-t border-white/[0.07]">
              <div className="flex gap-2.5">
                {/* Qty controls */}
                <div className="flex items-center rounded-xl overflow-hidden shrink-0"
                  style={{ background:'#141414', border:'1px solid rgba(255,255,255,0.1)' }}>
                  <motion.button whileTap={{ scale:0.85 }} onClick={() => qty > 1 && setQty(q=>q-1)}
                    disabled={qty<=1}
                    className="w-10 h-12 flex items-center justify-center text-red-400 disabled:opacity-30 active:bg-red-500/10 transition-colors">
                    <Minus className="w-3.5 h-3.5" />
                  </motion.button>
                  <motion.span key={qty}
                    initial={{ scale:1.2, opacity:0.6 }} animate={{ scale:1, opacity:1 }}
                    transition={{ type:'spring', stiffness:400, damping:20 }}
                    className="w-8 text-center text-base font-black text-white select-none">
                    {qty}
                  </motion.span>
                  <motion.button whileTap={{ scale:0.85 }} onClick={() => qty < (product.stock??0) && setQty(q=>q+1)}
                    disabled={qty>=(product.stock??0)}
                    className="w-10 h-12 flex items-center justify-center text-emerald-400 disabled:opacity-30 active:bg-emerald-500/10 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </motion.button>
                </div>

                {/* Add to Cart */}
                <motion.button onClick={handleAddToCart}
                  whileTap={{ scale:0.97 }}
                  className="flex-1 h-12 rounded-xl font-black text-white text-sm flex items-center justify-center gap-2 transition-all"
                  style={{
                    background:  added ? '#10b981' : ACCENT,
                    boxShadow:   added ? '0 6px 20px rgba(16,185,129,0.35)' : `0 6px 20px ${ACCENT}44`,
                  }}>
                  <motion.span animate={added ? { rotate:[0,-15,15,0], scale:[1,1.2,1] } : {}} transition={{ duration:0.38 }}>
                    {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                  </motion.span>
                  {added ? 'Added!' : `Add to Cart · ₦${product.price.toLocaleString()}`}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProductDetail;
