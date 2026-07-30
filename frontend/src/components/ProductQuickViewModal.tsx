import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { addToCart } from '../features/cart/cartSlice';
import toast from 'react-hot-toast';
import { ShoppingCart, X, Minus, Plus, ImageOff } from 'lucide-react';
import { getCloudinaryUrl } from '../utils/cloudinary';
import type { IVariant } from '../types/home';

const ACCENT = '#e8622a';
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

// ─── Color mapping ──────────────────────────────────────────────────────────
const colorMap: Record<string, string> = {
  black:  '#0f0f0f',
  white:  '#f5f5f5',
  red:    '#dc2626',
  blue:   '#2563eb',
  green:  '#16a34a',
  pink:   '#ec4899',
  purple: '#9333ea',
  orange: '#f97316',
  yellow: '#eab308',
  gray:   '#6b7280',
  brown:  '#78350f',
  navy:   '#1e3a8a',
  beige:  '#d4c5a9',
  gold:   '#f59e0b',
  silver: '#c0c0c0',
};

const getColorHex = (name: string): string | null => {
  const lower = name.trim().toLowerCase();
  return colorMap[lower] || null;
};

// ─── Local variant type that includes compareAtPrice ────────────────────────
interface LocalVariant extends IVariant {
  compareAtPrice?: number;
}

interface ProductModalProps {
  product: {
    _id: string;
    name: string;
    price: number;
    images?: string[];
    description?: string;
    stock?: number;
    category?: string | { _id: string; name: string; slug?: string; parent?: string | null };
    slug?: string;
    compareAtPrice?: number;
    discount?: { percentage: number; validUntil?: Date };
    variants?: IVariant[];
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductQuickViewModal = ({ product, isOpen, onClose }: ProductModalProps) => {
  const dispatch = useDispatch();
  const [qty, setQty] = useState(1);
  const [imageError, setImageError] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // ── Variant state: size + color ────────────────────────────────────────
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Stabilise variants with proper typing
  const variants: LocalVariant[] = useMemo(() => product?.variants || [], [product?.variants]);
  const hasVariants = variants.length > 0;

  // PATCH 1: sizes from variants with size (no color required)
  const variantSizes = useMemo(() => {
    const sizes = new Set<string>();
    variants.forEach(v => {
      if (v.size?.trim()) sizes.add(v.size.trim());
    });
    return Array.from(sizes);
  }, [variants]);

  // Colors for the selected size
  const availableColors = useMemo(() => {
    if (!selectedSize) return [];
    return variants
      .filter(v => v.size?.trim() === selectedSize && v.color?.trim())
      .map(v => v.color!.trim())
      .filter((v, i, a) => a.indexOf(v) === i);
  }, [selectedSize, variants]);

  // PATCH 2: color-only variants (no size)
  const colorOnlyList = useMemo(() => {
    return variants
      .filter(v => !v.size?.trim() && v.color?.trim())
      .map(v => v.color!.trim())
      .filter((v, i, a) => a.indexOf(v) === i);
  }, [variants]);

  // Which color list to show
  const colorsToShow = selectedSize ? availableColors : colorOnlyList;

  // PATCH 3: active variant – match size+color or color-only
  const activeVariant = useMemo(() => {
    if (!hasVariants || !selectedColor) return null;
    if (selectedSize) {
      const match = variants.find(
        v => v.size?.trim() === selectedSize &&
             v.color?.trim().toLowerCase() === selectedColor.toLowerCase()
      );
      if (match) return match;
    }
    return variants.find(
      v => !v.size?.trim() &&
           v.color?.trim().toLowerCase() === selectedColor.toLowerCase()
    ) || null;
  }, [hasVariants, selectedSize, selectedColor, variants]);

  // Derive price & stock from active variant
  const displayPrice = activeVariant?.price ?? product?.price ?? 0;
  const displayStock = activeVariant?.stock ?? product?.stock ?? 0;
  const isOutOfStock = displayStock === 0;

  // Variant-specific compare-at price (falls back to product-level)
  const displayCompareAtPrice: number | undefined = activeVariant?.compareAtPrice ?? product?.compareAtPrice ?? undefined;
  const hasSalePrice = !!(displayCompareAtPrice && displayCompareAtPrice > displayPrice);

  // Focus trap: moves focus into the dialog on open, cycles Tab within it,
  // closes on Escape, restores focus to whatever opened it (e.g. the
  // product card) on close.
  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const focusable = dialog
      ? Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      : [];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && focusable.length > 0) {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  // ══════ EARLY RETURN (after all hooks) ════════════════════════════════
  if (!product) return null;

  const categoryName =
    typeof product.category === 'string'
      ? product.category
      : product.category?.name ?? 'General';

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error('Sorry, this item is out of stock!');
      return;
    }
    const variantInfo = activeVariant
      ? { sku: activeVariant.sku, color: activeVariant.color, size: activeVariant.size, compareAtPrice: activeVariant.compareAtPrice }
      : undefined;
    dispatch(addToCart({
      _id: product._id,
      name: product.name,
      image: product.images?.[0] || 'https://via.placeholder.com/600',
      price: displayPrice,
      qty,
      stock: displayStock,
      variant: variantInfo,
    }));
    toast.success(`Added ${product.name} to cart!`);
  };

  const increment = () => {
    if (!isOutOfStock && qty < displayStock) setQty((prev) => prev + 1);
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
            className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="quickview-product-name"
              className="rounded-3xl shadow-2xl w-full max-w-2xl border relative max-h-[90vh] overflow-y-auto
                bg-[#FCFAF5] dark:bg-[#141414]
                border-gray-200 dark:border-white/[0.08]
                shadow-lg dark:shadow-[0_40px_90px_rgba(0,0,0,0.65)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full transition z-10
                  text-gray-500 hover:text-gray-900 dark:hover:text-white
                  hover:bg-gray-100 dark:hover:bg-white/10"
                aria-label="Close quick view"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>

              <div
                className="absolute top-0 inset-x-0 h-px rounded-t-3xl"
                style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }}
                aria-hidden="true"
              />

              <div className="grid md:grid-cols-2 gap-6 p-6 md:p-8">
                {/* Image area */}
                <div
                  className="rounded-2xl flex items-center justify-center p-4
                    bg-gray-100 dark:bg-[#1c1c1c]
                    border border-gray-200 dark:border-white/[0.06]"
                >
                  {product.images?.[0] && !imageError ? (
                    <img
                      src={getCloudinaryUrl(product.images[0], 600)}
                      srcSet={`${getCloudinaryUrl(product.images[0], 300)} 300w, ${getCloudinaryUrl(product.images[0], 600)} 600w`}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      alt={product.name}
                      className="w-full h-64 md:h-72 object-contain rounded-xl"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-500 dark:text-gray-600">
                      <ImageOff className="w-16 h-16" aria-hidden="true" />
                      <span className="text-xs mt-2">No image</span>
                    </div>
                  )}
                </div>

                {/* Product info */}
                <div className="space-y-5">
                  <div>
                    <span
                      className="inline-block px-3 py-1 text-xs font-extrabold uppercase tracking-wider rounded-full mb-2"
                      style={{ background: `${ACCENT}15`, color: ACCENT }}
                    >
                      {categoryName}
                    </span>
                    <h2 id="quickview-product-name" className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                      {product.name}
                    </h2>
                  </div>

                  {/* ───── Size + Color picker ───── */}
                  {hasVariants && (
                    <div className="space-y-3">
                      {variantSizes.length > 0 && (
                        <fieldset className="border-0 m-0 p-0">
                          <legend className="text-xs font-bold text-gray-500 mb-1">Size</legend>
                          <div className="flex gap-2 flex-wrap">
                            {variantSizes.map(size => (
                              <button
                                key={size}
                                onClick={() => {
                                  setSelectedSize(size === selectedSize ? null : size);
                                  setSelectedColor(prev => {
                                    if (size !== selectedSize) {
                                      return prev && variants.some(v => v.size?.trim() === size && v.color?.trim().toLowerCase() === prev.toLowerCase()) ? prev : null;
                                    }
                                    return prev;
                                  });
                                }}
                                aria-pressed={selectedSize === size}
                                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                                  selectedSize === size
                                    ? 'bg-[#e8622a] text-white border-[#e8622a]'
                                    : 'bg-gray-100 dark:bg-[#1c1c1c] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/[0.08]'
                                }`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </fieldset>
                      )}

                      {/* PATCH 4: show colorsToShow directly */}
                      {colorsToShow.length > 0 && (
                        <fieldset className="border-0 m-0 p-0">
                          <legend className="text-xs font-bold text-gray-500 mb-1">
                            Color{selectedColor ? `: ${selectedColor}` : ''}
                          </legend>
                          <div className="flex gap-2.5 flex-wrap">
                            {colorsToShow.map(color => {
                              const hex = getColorHex(color);
                              return (
                                <button
                                  key={color}
                                  onClick={() => setSelectedColor(color)}
                                  title={color}
                                  aria-label={`Color: ${color}`}
                                  aria-pressed={selectedColor === color}
                                  className="relative w-9 h-9 rounded-full border-2 transition-all hover:scale-110"
                                  style={{
                                    backgroundColor: hex || '#e5e7eb',
                                    borderColor:
                                      selectedColor === color
                                        ? ACCENT
                                        : 'rgba(255,255,255,0.15)',
                                    boxShadow:
                                      selectedColor === color
                                        ? `0 0 0 2px ${ACCENT}40`
                                        : 'none',
                                  }}
                                >
                                  {!hex && (
                                    <span className="text-[10px] font-black uppercase text-gray-800 dark:text-white" aria-hidden="true">
                                      {color.charAt(0)}
                                    </span>
                                  )}
                                  {selectedColor === color && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center" aria-hidden="true">
                                      <svg
                                        className="w-2.5 h-2.5 text-[#e8622a]"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </fieldset>
                      )}
                    </div>
                  )}

                  {/* Price + sale badge */}
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <p className="font-black text-3xl" style={{ color: ACCENT }}>
                      ₦{displayPrice.toLocaleString()}
                    </p>

                    {hasVariants && !activeVariant && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-extrabold bg-[#e8622a]/10 text-[#e8622a] border border-[#e8622a]/25">
                        Starting Price
                      </span>
                    )}

                    {activeVariant && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-extrabold bg-[#e8622a]/15 text-[#e8622a] border border-[#e8622a]/30">
                        {[activeVariant.size, activeVariant.color].filter(Boolean).join(' / ')} Price
                      </span>
                    )}

                    {hasSalePrice && displayCompareAtPrice && (
                      <span className="text-gray-400 dark:text-gray-500 line-through text-xl font-medium">
                        ₦{displayCompareAtPrice.toLocaleString()}
                      </span>
                    )}
                    {product.discount?.percentage && product.discount.percentage > 0 && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-red-500/20 text-red-400 border border-red-500/30">
                        -{product.discount.percentage}%
                      </span>
                    )}
                  </div>

                  {product.description && (
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
                      {product.description}
                    </p>
                  )}

                  {/* Stock indicator */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-3 h-3 rounded-full ${
                        isOutOfStock ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                      {isOutOfStock
                        ? 'Out of Stock'
                        : `In Stock (${displayStock} available)`}
                    </span>
                  </div>

                  {!isOutOfStock && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
                      {/* Quantity selector */}
                      <div
                        className="flex items-center gap-3 rounded-xl p-1
                          bg-gray-100 dark:bg-[#1c1c1c]
                          border border-gray-200 dark:border-white/[0.08]"
                      >
                        <button
                          onClick={decrement}
                          disabled={qty <= 1}
                          aria-label="Decrease quantity"
                          className="w-10 h-10 flex items-center justify-center rounded-lg
                            text-gray-500 hover:text-gray-900 dark:hover:text-white
                            hover:bg-gray-200 dark:hover:bg-white/5 transition disabled:opacity-40"
                        >
                          <Minus className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <span className="font-bold w-8 text-center text-gray-900 dark:text-white" aria-live="polite">
                          {qty}
                        </span>
                        <button
                          onClick={increment}
                          disabled={qty >= displayStock}
                          aria-label="Increase quantity"
                          className="w-10 h-10 flex items-center justify-center rounded-lg
                            text-gray-500 hover:text-gray-900 dark:hover:text-white
                            hover:bg-gray-200 dark:hover:bg-white/5 transition disabled:opacity-40"
                        >
                          <Plus className="w-4 h-4" aria-hidden="true" />
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
                        <ShoppingCart className="w-5 h-5" aria-hidden="true" />
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