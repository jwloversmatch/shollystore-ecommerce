import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { addToCart } from "../features/cart/cartSlice";
import { toggleWishlist } from "../features/wishlist/wishlistSlice";
import {
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} from "../features/api/apiSlice";
import type { RootState } from "../store";
import type { ProductItem } from "../types/home";
import { getCloudinaryUrl } from "../utils/cloudinary";
import { StarRating } from "./StarRating";
import { useFocusTrap } from "../hooks/useFocusTrap";
import {
  X,
  ShoppingCart,
  Heart,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

const ACCENT = "#e8622a";
const PLACEHOLDER = "https://via.placeholder.com/600";

interface QuickViewModalProps {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const QuickViewModal = ({ product, isOpen, onClose }: QuickViewModalProps) => {
  const dispatch = useDispatch();
  const wishlistIds = useSelector((s: RootState) => s.wishlist.ids);
  const user = useSelector((s: RootState) => s.auth.user);
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const variants = product?.variants || [];
  const images = product?.images?.length ? product.images : [product?.images?.[0] || PLACEHOLDER];

  const activeVariant = variants.find(
    (v) =>
      (selectedSize ? v.size === selectedSize : true) &&
      (selectedColor ? v.color === selectedColor : true)
  );

  const price = activeVariant?.price ?? product?.price ?? 0;
  const compareAtPrice = activeVariant?.compareAtPrice ?? product?.compareAtPrice;
  const stock = activeVariant?.stock ?? product?.stock ?? 0;
  const isOutOfStock = stock === 0;
  const isWishlisted = product ? wishlistIds.includes(product._id) : false;

  // Escape key to close
  useFocusTrap(modalRef, isOpen, onClose);

  const handleAddToCart = () => {
    if (!product || isOutOfStock) {
      toast.error("Out of stock!");
      return;
    }
    dispatch(
      addToCart({
        _id: product._id,
        name: product.name,
        image: images[0],
        price,
        qty,
        stock,
        variant: activeVariant
          ? {
              sku: activeVariant.sku,
              color: activeVariant.color,
              size: activeVariant.size,
            }
          : undefined,
      })
    );
    toast.success(`${product.name} added! 🛒`);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlistToggle = async () => {
    if (!product) return;
    if (!user) {
      toast.error("Please login to add items to your wishlist");
      return;
    }
    try {
      if (isWishlisted) {
        await removeFromWishlist(product._id).unwrap();
        dispatch(toggleWishlist(product._id));
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist(product._id).unwrap();
        dispatch(toggleWishlist(product._id));
        toast.success("Added to wishlist");
      }
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={onClose}
        >
          <motion.div
            ref={modalRef}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl bg-white dark:bg-[#141414]"
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Quick view of ${product.name}`}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center bg-white/80 dark:bg-black/40 text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="Close quick view"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="grid md:grid-cols-2 h-full overflow-y-auto">
              {/* Image gallery */}
              <div className="relative bg-gray-100 dark:bg-[#1a1a1a] p-4 flex flex-col">
                <div className="relative flex-1 flex items-center justify-center min-h-[200px] max-h-[350px]">
                  <img
                    src={getCloudinaryUrl(images[selectedImage] || PLACEHOLDER, 600)}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain rounded-xl"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setSelectedImage((prev) => (prev - 1 + images.length) % images.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 dark:bg-black/50 flex items-center justify-center text-gray-700 dark:text-white"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSelectedImage((prev) => (prev + 1) % images.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 dark:bg-black/50 flex items-center justify-center text-gray-700 dark:text-white"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto py-2">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${idx === selectedImage ? "border-[#e8622a] opacity-100" : "border-transparent opacity-50"}`}
                        aria-label={`Image ${idx + 1}`}
                      >
                        <img src={getCloudinaryUrl(img, 100)} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product details */}
              <div className="p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>
                    {typeof product.category === "string" ? product.category : product.category?.name}
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white leading-tight mb-2">
                  {product.name}
                </h2>

                {product.averageRating !== undefined && product.numberOfReviews !== undefined && product.numberOfReviews > 0 && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <StarRating rating={product.averageRating} size={14} />
                    <span className="text-xs text-gray-500">({product.numberOfReviews})</span>
                  </div>
                )}

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-black" style={{ color: ACCENT }}>₦{price.toLocaleString()}</span>
                  {compareAtPrice && compareAtPrice > price && (
                    <span className="text-gray-400 line-through text-sm">₦{compareAtPrice.toLocaleString()}</span>
                  )}
                </div>

                {variants.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {Array.from(new Set(variants.map(v => v.size).filter(Boolean))).length > 0 && (
                      <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1">Size</label>
                        <div className="flex gap-2 flex-wrap">
                          {Array.from(new Set(variants.map(v => v.size).filter(Boolean))).map((size, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedSize(size === selectedSize ? null : size as string)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedSize === size ? "bg-[#e8622a] text-white border-[#e8622a]" : "bg-gray-100 dark:bg-[#1c1c1c] border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300"}`}
                              aria-pressed={selectedSize === size}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {Array.from(new Set(variants.map(v => v.color).filter(Boolean))).length > 0 && (
                      <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1">Color</label>
                        <div className="flex gap-2 flex-wrap">
                          {Array.from(new Set(variants.map(v => v.color).filter(Boolean))).map((color, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedColor(color === selectedColor ? null : color as string)}
                              className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === color ? "border-[#e8622a]" : "border-gray-300 dark:border-white/20"}`}
                              style={{ background: (color as string).toLowerCase() }}
                              aria-label={`Color ${color}`}
                              aria-pressed={selectedColor === color}
                            >
                              {selectedColor === color && (
                                <Check className="w-4 h-4 text-white mx-auto" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mb-4">
                  <span className={`text-xs font-bold ${isOutOfStock ? "text-red-500" : "text-emerald-500"}`}>
                    {isOutOfStock ? "Out of Stock" : `In Stock (${stock} left)`}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center rounded-xl overflow-hidden border border-gray-200 dark:border-white/10">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      disabled={qty <= 1}
                      className="w-9 h-10 flex items-center justify-center text-gray-500 dark:text-gray-400 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-white/5"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="w-10 text-center text-sm font-bold">{qty}</span>
                    <button
                      onClick={() => setQty(Math.min(stock, qty + 1))}
                      disabled={qty >= stock}
                      className="w-9 h-10 flex items-center justify-center text-gray-500 dark:text-gray-400 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-white/5"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`flex-1 h-10 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${added ? "bg-emerald-500" : "bg-[#e8622a] hover:bg-[#c9511f]"} disabled:opacity-50`}
                  >
                    {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                    {added ? "Added!" : "Add to Cart"}
                  </button>

                  <button
                    onClick={handleWishlistToggle}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      isWishlisted
                        ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-500"
                        : "bg-gray-100 dark:bg-[#1c1c1c] border-gray-200 dark:border-white/10 text-gray-400"
                    }`}
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart className="w-4 h-4" fill={isWishlisted ? "currentColor" : "none"} />
                  </button>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    window.location.href = `/products/${product.slug || product._id}`;
                  }}
                  className="text-xs font-bold text-[#e8622a] hover:underline flex items-center gap-1"
                >
                  View full details <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuickViewModal;