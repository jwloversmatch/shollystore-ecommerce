import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { addToCart } from '../features/cart/cartSlice';
import toast from 'react-hot-toast';
import { ShoppingCart, X, Minus, Plus, ImageOff } from 'lucide-react';

const ACCENT = '#e8622a';

interface ProductModalProps {
  product: {
    _id: string;
    name: string;
    price: number;
    images?: string[];
    description?: string;
    stock?: number;
    category?: string;
    slug?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductQuickViewModal = ({ product, isOpen, onClose }: ProductModalProps) => {
  const dispatch = useDispatch();
  const [qty, setQty] = useState(1);
  const [imageError, setImageError] = useState(false);

  if (!product) return null;

  const stock = product.stock ?? 0;
  const isOutOfStock = stock === 0;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error('Sorry, this item is out of stock!');
      return;
    }
    dispatch(addToCart({
      _id: product._id,
      name: product.name,
      image: product.images?.[0] || 'https://via.placeholder.com/600',
      price: product.price,
      qty,
      stock,
    }));
    toast.success(`Added ${product.name} to cart!`);
  };

  const increment = () => {
    if (!isOutOfStock && qty < stock) setQty((prev) => prev + 1);
  };
  const decrement = () => {
    if (qty > 1) setQty((prev) => prev - 1);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div
              className="rounded-3xl shadow-2xl w-full max-w-2xl border relative max-h-[90vh] overflow-y-auto"
              style={{
                background: '#141414',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 40px 90px rgba(0,0,0,0.65)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 transition z-10 text-gray-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Top accent hairline */}
              <div
                className="absolute top-0 inset-x-0 h-px rounded-t-3xl"
                style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }}
              />

              <div className="grid md:grid-cols-2 gap-6 p-6 md:p-8">
                {/* Image */}
                <div
                  className="rounded-2xl flex items-center justify-center p-4"
                  style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  {product.images?.[0] && !imageError ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-64 md:h-72 object-contain rounded-xl"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-600">
                      <ImageOff className="w-16 h-16" />
                      <span className="text-xs mt-2">No image</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-5">
                  <div>
                    <span
                      className="inline-block px-3 py-1 text-xs font-extrabold uppercase tracking-wider rounded-full mb-2"
                      style={{ background: `${ACCENT}15`, color: ACCENT }}
                    >
                      {product.category || 'General'}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black text-white">{product.name}</h2>
                  </div>

                  <p className="font-black text-3xl" style={{ color: ACCENT }}>
                    ₦{product.price.toLocaleString()}
                  </p>

                  {product.description && (
                    <p className="text-gray-400 leading-relaxed text-sm">
                      {product.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-3 h-3 rounded-full ${
                        isOutOfStock ? 'bg-red-500' : 'bg-green-500'
                      }`}
                    />
                    <span className="text-sm font-bold text-gray-300">
                      {isOutOfStock ? 'Out of Stock' : `In Stock (${stock} available)`}
                    </span>
                  </div>

                  {!isOutOfStock && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
                      {/* Quantity pill */}
                      <div
                        className="flex items-center gap-3 rounded-xl p-1"
                        style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        <button
                          onClick={decrement}
                          disabled={qty <= 1}
                          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5 transition disabled:opacity-40 text-gray-400"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold w-8 text-center text-white">{qty}</span>
                        <button
                          onClick={increment}
                          disabled={qty >= stock}
                          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5 transition disabled:opacity-40 text-gray-400"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Add to Cart button */}
                      <button
                        onClick={handleAddToCart}
                        className="w-full sm:w-auto text-white px-8 py-3 rounded-xl font-black shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105"
                        style={{
                          background: ACCENT,
                          boxShadow: `0 8px 24px ${ACCENT}44`,
                        }}
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Add to Cart
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductQuickViewModal;