import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Check, Heart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { addToCart } from "../features/cart/cartSlice";
import { toggleWishlist } from "../features/wishlist/wishlistSlice";
import {
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} from "../features/api/apiSlice";
import { getCloudinaryUrl } from "../utils/cloudinary";
import { formatPrice } from "../utils/format";
import type { RootState } from "../store";
import type { IVariant } from "../types/home";
import { StarRating } from "./StarRating";

interface ProductProps {
  _id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  stock?: number;
  onClick?: () => void;
  compareAtPrice?: number;
  discountPercent?: number;
  variants?: IVariant[];
  index?: number;
  averageRating?: number;
  numberOfReviews?: number;
}

const FALLBACK = "https://via.placeholder.com/300x300?text=No+Image";

const ProductCard = ({
  _id,
  name,
  price,
  image,
  category = "General",
  stock,
  onClick,
  compareAtPrice,
  discountPercent,
  variants,
  index,
  averageRating,
  numberOfReviews,
}: ProductProps) => {
  const dispatch = useDispatch();
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);

  // Wishlist state and mutations
  const wishlistIds = useSelector((s: RootState) => s.wishlist.ids);
  const user = useSelector((s: RootState) => s.auth.user);
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  const isOutOfStock = stock !== undefined && stock === 0;
  const accent = isOutOfStock ? "#ef4444" : "#e8622a";
  const hasSale =
    (compareAtPrice && compareAtPrice > price) ||
    (discountPercent && discountPercent > 0);

  const isWishlisted = wishlistIds.includes(_id);

  const priceDisplay = formatPrice(price, { compact: true });
  const compareAtPriceDisplay = compareAtPrice
    ? formatPrice(compareAtPrice, { compact: true })
    : null;

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isOutOfStock) {
        toast.error("Out of stock!");
        return;
      }
      dispatch(
        addToCart({ _id, name, image, price, qty: 1, stock: stock ?? 999 }),
      );
      toast.success(`${name} added!`, { icon: "🛒" });
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    },
    [dispatch, _id, name, image, price, stock, isOutOfStock],
  );

  const handleWishlistToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();

      // Guest guard
      if (!user) {
        toast.error("Please login to add items to your wishlist");
        return;
      }

      try {
        if (isWishlisted) {
          await removeFromWishlist(_id).unwrap();
          dispatch(toggleWishlist(_id));
          toast.success("Removed from wishlist");
        } else {
          await addToWishlist(_id).unwrap();
          dispatch(toggleWishlist(_id));
          toast.success("Added to wishlist");
        }
      } catch {
        toast.error("Failed to update wishlist");
      }
    },
    [dispatch, isWishlisted, _id, addToWishlist, removeFromWishlist, user],
  );

  const imgSrc = getCloudinaryUrl(imgError ? FALLBACK : image, 400);
  const srcSet = !imgError
    ? `${getCloudinaryUrl(image, 400)} 400w, ${getCloudinaryUrl(image, 800)} 800w`
    : undefined;
  const sizes = "(max-width: 640px) 100vw, 50vw";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{
        duration: 0.5,
        delay: index !== undefined ? (index % 4) * 0.06 : 0,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="h-full"
    >
      <article
        className="group relative flex flex-col h-full rounded-2xl overflow-hidden border
          bg-white dark:bg-[#141414]
          border-gray-200 dark:border-white/[0.06]
          shadow-sm dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)]
          transition-all duration-300 ease-out
          motion-safe:hover:-translate-y-1.5 motion-safe:focus-within:-translate-y-1.5
          hover:shadow-[0_0_0_1.5px_rgba(232,98,42,0.35),0_20px_45px_-15px_rgba(232,98,42,0.35)]
          focus-within:shadow-[0_0_0_1.5px_rgba(232,98,42,0.35),0_20px_45px_-15px_rgba(232,98,42,0.35)]
          dark:hover:shadow-[0_0_0_1.5px_rgba(232,98,42,0.5),0_24px_50px_-15px_rgba(232,98,42,0.5)]
          dark:focus-within:shadow-[0_0_0_1.5px_rgba(232,98,42,0.5),0_24px_50px_-15px_rgba(232,98,42,0.5)]"
      >
        {/* Full-card button for navigation */}
        <button
          type="button"
          onClick={onClick}
          aria-label={`View ${name} — ${priceDisplay.full}${isOutOfStock ? ' (Out of stock)' : ''}`}
          className="absolute inset-0 z-0 rounded-2xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8622a] focus-visible:ring-offset-2"
        />

        {/* Visual content */}
        <div className="relative z-[1] flex flex-col flex-1 pointer-events-none">
          {/* Image area */}
          <div className="relative w-full h-48 bg-gray-100 dark:bg-[#1a1a1a] flex items-center justify-center p-4 overflow-hidden">
            <img
              src={imgSrc}
              srcSet={srcSet}
              sizes={sizes}
              alt={name}
              loading="lazy"
              onError={() => setImgError(true)}
              className="max-w-full max-h-full object-contain transition-transform duration-500 ease-out motion-safe:group-hover:scale-105 motion-safe:group-focus-within:scale-105"
            />

            {/* Stock badge */}
            {stock !== undefined && (
              <div
                className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  isOutOfStock
                    ? "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"
                    : "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                }`}
                role="status"
                aria-label={isOutOfStock ? "Sold out" : `${stock} items in stock`}
              >
                {isOutOfStock ? "Sold Out" : `${stock} left`}
              </div>
            )}

            {/* Wishlist heart button (top right) */}
            <button
              onClick={handleWishlistToggle}
              className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors pointer-events-auto ${
                isWishlisted
                  ? "bg-red-50 dark:bg-red-500/20 text-red-500"
                  : "bg-white/80 dark:bg-black/40 text-gray-400 hover:text-red-400"
              }`}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className="w-4 h-4"
                fill={isWishlisted ? "currentColor" : "none"}
                aria-hidden="true"
              />
            </button>

            {/* Out of stock overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center" aria-hidden="true">
                <span className="text-white font-bold text-sm bg-black/60 px-4 py-2 rounded-full">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Info section */}
          <div className="flex flex-col flex-1 p-4">
            <span
              className="text-[10px] font-extrabold uppercase tracking-[0.2em] mb-1.5 truncate"
              style={{ color: accent }}
            >
              {category}
            </span>

            <h3 className="font-bold text-sm leading-snug truncate mb-1 text-gray-900 dark:text-white">
              {name}
            </h3>

            {/* Rating display */}
            {averageRating !== undefined && numberOfReviews !== undefined && (
              <div className="flex items-center gap-1.5 mb-2">
                <StarRating rating={averageRating} size={12} />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({numberOfReviews})
                </span>
              </div>
            )}

            {/* Variant pills */}
            {variants && variants.length > 0 && (
              <div className="flex items-center gap-1 mb-2 flex-nowrap overflow-hidden" aria-label="Available variants">
                {variants.slice(0, 3).map((v, idx) => {
                  const label = v.size || v.color || v.sku;
                  if (!label) return null;
                  return (
                    <span
                      key={idx}
                      className="shrink-0 max-w-[56px] truncate text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    >
                      {label}
                    </span>
                  );
                })}
                {variants.length > 3 && (
                  <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    +{variants.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Bottom aligned price row */}
            <div className="mt-auto space-y-1.5">
              {hasSale && (
                <div className="flex items-center gap-1.5 flex-nowrap">
                  {compareAtPrice && compareAtPrice > price && (
                    <span
                      className="text-xs text-gray-500 line-through truncate min-w-0"
                      aria-label={`Original price: ${compareAtPriceDisplay?.full ?? ''}`}
                    >
                      {/* Mobile: compact */}
                      <span className="sm:hidden">
                        {compareAtPriceDisplay?.short}
                      </span>
                      {/* Desktop: full */}
                      <span className="hidden sm:inline">
                        {compareAtPriceDisplay?.full}
                      </span>
                    </span>
                  )}
                  {discountPercent && discountPercent > 0 && (
                    <span
                      className="shrink-0 px-1.5 py-0.5 text-[10px] font-extrabold rounded-full bg-red-500/20 text-red-500 border border-red-500/30"
                      aria-label={`${discountPercent}% discount`}
                    >
                      -{discountPercent}%
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-end justify-between gap-2">
                <div
                  className="flex items-baseline gap-0.5"
                  aria-label={`Price: ${priceDisplay.full}`}
                >
                  <span className="text-gray-500 dark:text-gray-400 text-xs pb-0.5">₦</span>
                  <span className="font-black text-xl leading-none text-gray-900 dark:text-white">
                    {/* Mobile: compact */}
                    <span className="sm:hidden">
                      {priceDisplay.short.replace('₦', '')}
                    </span>
                    {/* Desktop: full */}
                    <span className="hidden sm:inline">
                      {price.toLocaleString()}
                    </span>
                  </span>
                </div>

                <motion.button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  whileTap={{ scale: 0.9 }}
                  className={`relative z-[2] pointer-events-auto flex items-center justify-center w-9 h-9 rounded-full transition-colors ${
                    isOutOfStock
                      ? "bg-gray-200 dark:bg-[#1e1e1e] text-gray-500 dark:text-gray-600 cursor-not-allowed"
                      : added
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-white/20"
                  }`}
                  aria-label={
                    isOutOfStock
                      ? `${name} is out of stock`
                      : added
                        ? `${name} added to cart`
                        : `Add ${name} to cart for ${priceDisplay.full}`
                  }
                >
                  <AnimatePresence>
                    {added && (
                      <motion.span
                        key="ping"
                        initial={{ scale: 1, opacity: 0.6 }}
                        animate={{ scale: 1.9, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="absolute inset-0 rounded-full bg-emerald-400"
                        aria-hidden="true"
                      />
                    )}
                  </AnimatePresence>

                  <AnimatePresence initial={false}>
                    {isOutOfStock ? (
                      <motion.span
                        key="out"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.15 }}
                        className="text-xs font-bold"
                        aria-hidden="true"
                      >
                        ✕
                      </motion.span>
                    ) : added ? (
                      <motion.span
                        key="added"
                        initial={{ opacity: 0, scale: 0.4, rotate: -45 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.4 }}
                        transition={{ type: "spring", stiffness: 500, damping: 22 }}
                        aria-hidden="true"
                      >
                        <Check className="w-4 h-4" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="cart"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.15 }}
                        aria-hidden="true"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </motion.div>
  );
};

export default ProductCard;