import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { addToCart } from '../features/cart/cartSlice';
import toast from 'react-hot-toast';
import { ShoppingCart, X, Minus, Plus, ImageOff } from 'lucide-react';

interface ProductModalProps {
  product: {
    _id: string;
    name: string;
    price: number;
    images?: string[];
    description?: string;
    stock?: number;          // ✅ now optional
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

  const stock = product.stock ?? 0;   // fallback to 0
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
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
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-2xl border border-white/40 relative max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white transition z-10"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              <div className="grid md:grid-cols-2 gap-6 p-6 md:p-8">
                {/* Image */}
                <div className="bg-gray-100 rounded-2xl flex items-center justify-center p-4">
                  {product.images?.[0] && !imageError ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-64 md:h-72 object-contain rounded-xl"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <ImageOff className="w-16 h-16" />
                      <span className="text-xs mt-2">No image</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-5">
                  <div>
                    <span className="inline-block px-3 py-1 bg-pastel-green text-leaf-green text-xs font-bold uppercase rounded-full mb-2">
                      {product.category || 'General'}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{product.name}</h2>
                  </div>

                  <p className="text-leaf-green font-bold text-3xl">
                    ₦{product.price.toLocaleString()}
                  </p>

                  {product.description && (
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {product.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <span className={`inline-block w-3 h-3 rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-green-500'}`} />
                    <span className="text-sm font-medium text-gray-700">
                      {isOutOfStock ? 'Out of Stock' : `In Stock (${stock} available)`}
                    </span>
                  </div>

                  {!isOutOfStock && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
                      <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-1">
                        <button
                          onClick={decrement}
                          disabled={qty <= 1}
                          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white transition disabled:opacity-40"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-semibold w-8 text-center">{qty}</span>
                        <button
                          onClick={increment}
                          disabled={qty >= stock}
                          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white transition disabled:opacity-40"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={handleAddToCart}
                        className="w-full sm:w-auto bg-leaf-green text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
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