import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Check, Heart, Eye } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { addToCart } from "../features/cart/cartSlice";
import { toggleWishlist } from "../features/wishlist/wishlistSlice";
import {
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} from "../features/api/apiSlice";
import { getCloudinaryUrl } from "../utils/cloudinary";
import { formatPrice } from "../utils/format";
import type { RootState } from "../store";
import type { IVariant, ProductItem } from "../types/home";
import { StarRating } from "./StarRating";
import { PLACEHOLDER_IMAGE } from "../utils/placeholder";

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
  onQuickView?: (product: ProductItem) => void;
  fullProduct?: ProductItem;
}


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
  onQuickView,
  fullProduct,
}: ProductProps) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);

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

  const modalProduct: ProductItem = fullProduct || {
    _id,
    name,
    price,
    images: [image],
    category,
    stock,
    compareAtPrice,
    discount: discountPercent ? { percentage: discountPercent } : undefined,
    variants,
    averageRating,
    numberOfReviews,
    slug: undefined,
    description: undefined,
    brand: undefined,
    sku: undefined,
    tags: undefined,
    isFeatured: undefined,
    attributes: undefined,
    barcode: undefined,
    taxClass: undefined,
    isActive: true,
  };

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isOutOfStock) {
        toast.error(t("product.outOfStockToast"));
        return;
      }
      dispatch(
        addToCart({ _id, name, image, price, qty: 1, stock: stock ?? 999 }),
      );
      toast.success(t("product.addedToCart", { name }), { icon: "🛒" });
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    },
    [dispatch, _id, name, image, price, stock, isOutOfStock, t],
  );

  const handleWishlistToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!user) {
        toast.error(t("product.loginForWishlist"));
        return;
      }
      try {
        if (isWishlisted) {
          await removeFromWishlist(_id).unwrap();
          dispatch(toggleWishlist(_id));
          toast.success(t("product.removedFromWishlist"));
        } else {
          await addToWishlist(_id).unwrap();
          dispatch(toggleWishlist(_id));
          toast.success(t("product.addedToWishlist"));
        }
      } catch {
        toast.error(t("product.wishlistUpdateError"));
      }
    },
    [dispatch, isWishlisted, _id, addToWishlist, removeFromWishlist, user, t],
  );

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(modalProduct);
    }
  };

  // When image fails, use the local fallback (getCloudinaryUrl returns it unchanged
  // because it isn't a Cloudinary URL).
  const imgSrc = getCloudinaryUrl(imgError ? PLACEHOLDER_IMAGE : image, 400);
  const srcSet = !imgError
    ? `${getCloudinaryUrl(image, 400)} 400w, ${getCloudinaryUrl(image, 800)} 800w`
    : undefined;

  const sizes = "(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw";
  const isAboveFold = index !== undefined && index < 4;

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
          border-gray-300 dark:border-white/[0.06]
          shadow-md dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)]
          transition-all duration-300 ease-out
          motion-safe:hover:-translate-y-1.5 motion-safe:focus-within:-translate-y-1.5
          hover:shadow-[0_0_0_1.5px_rgba(232,98,42,0.35),0_20px_45px_-15px_rgba(232,98,42,0.35)]
          focus-within:shadow-[0_0_0_1.5px_rgba(232,98,42,0.35),0_20px_45px_-15px_rgba(232,98,42,0.35)]
          dark:hover:shadow-[0_0_0_1.5px_rgba(232,98,42,0.5),0_24px_50px_-15px_rgba(232,98,42,0.5)]
          dark:focus-within:shadow-[0_0_0_1.5px_rgba(232,98,42,0.5),0_24px_50px_-15px_rgba(232,98,42,0.5)]"
      >
        <button
          type="button"
          onClick={onClick}
          aria-label={t("product.viewProduct", {
            name,
            price: priceDisplay.full,
            stockStatus: isOutOfStock ? t("product.soldOut") : "",
          })}
          className="absolute inset-0 z-0 rounded-2xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8622a] focus-visible:ring-offset-2"
        />

        <div className="relative z-[1] flex flex-col flex-1 pointer-events-none">
          <div className="relative w-full h-48 bg-[#fafafa] dark:bg-[#2a2a2a] flex items-center justify-center p-4 overflow-hidden">
            <img
              src={imgSrc}
              srcSet={srcSet}
              sizes={sizes}
              alt={name}
              loading={isAboveFold ? "eager" : "lazy"}
              fetchPriority={isAboveFold ? "high" : "auto"}
              decoding="async"
              onError={() => setImgError(true)}
              className="max-w-full max-h-full object-contain transition-transform duration-500 ease-out motion-safe:group-hover:scale-105 motion-safe:group-focus-within:scale-105"
            />

            {stock !== undefined && (
              <div
                className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  isOutOfStock
                    ? "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"
                    : "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                }`}
                role="status"
                aria-label={isOutOfStock ? t("product.soldOut") : t("product.itemsInStock", { count: stock })}
              >
                {isOutOfStock ? t("product.soldOut") : t("product.itemsLeft", { count: stock })}
              </div>
            )}

            {onQuickView && (
              <button
                onClick={handleQuickView}
                className={`absolute top-3 left-3 z-10 w-8 h-8 rounded-full flex items-center justify-center pointer-events-auto transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 ${
                  isOutOfStock ? "bg-black/40 text-white" : "bg-white/80 dark:bg-black/40 text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
                aria-label={t("product.quickView")}
              >
                <Eye className="w-4 h-4" aria-hidden="true" />
              </button>
            )}

            <button
              onClick={handleWishlistToggle}
              className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors pointer-events-auto ${
                isWishlisted
                  ? "bg-red-50 dark:bg-red-500/20 text-red-500"
                  : "bg-white/80 dark:bg-black/40 text-gray-400 hover:text-red-400"
              }`}
              aria-label={isWishlisted ? t("product.removeFromWishlist") : t("product.addToWishlist")}
            >
              <Heart
                className="w-4 h-4"
                fill={isWishlisted ? "currentColor" : "none"}
                aria-hidden="true"
              />
            </button>

            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center" aria-hidden="true">
                <span className="text-white font-bold text-sm bg-black/60 px-4 py-2 rounded-full">
                  {t("product.outOfStockOverlay")}
                </span>
              </div>
            )}
          </div>

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

            {averageRating !== undefined && numberOfReviews !== undefined && (
              <div className="flex items-center gap-1.5 mb-2">
                <StarRating rating={averageRating} size={12} />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({numberOfReviews})
                </span>
              </div>
            )}

            {variants && variants.length > 0 && (
              <div className="flex items-center gap-1 mb-2 flex-nowrap overflow-hidden" aria-label={t("product.availableVariants")}>
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

            <div className="mt-auto space-y-1.5">
              {hasSale && (
                <div className="flex items-center gap-1.5 flex-nowrap">
                  {compareAtPrice && compareAtPrice > price && (
                    <span
                      className="text-xs text-gray-500 line-through truncate min-w-0"
                      aria-label={t("product.originalPrice", { price: compareAtPriceDisplay?.full ?? '' })}
                    >
                      <span className="sm:hidden">
                        {compareAtPriceDisplay?.short}
                      </span>
                      <span className="hidden sm:inline">
                        {compareAtPriceDisplay?.full}
                      </span>
                    </span>
                  )}
                  {discountPercent && discountPercent > 0 && (
                    <span
                      className="shrink-0 px-1.5 py-0.5 text-[10px] font-extrabold rounded-full bg-red-500/20 text-red-500 border border-red-500/30"
                      aria-label={t("product.discount", { percent: discountPercent })}
                    >
                      -{discountPercent}%
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-end justify-between gap-2">
                <div
                  className="flex items-baseline gap-0.5"
                  aria-label={t("product.price", { price: priceDisplay.full })}
                >
                  <span className="text-gray-500 dark:text-gray-400 text-xs pb-0.5">₦</span>
                  <span className="font-black text-xl leading-none text-gray-900 dark:text-white">
                    <span className="sm:hidden">
                      {priceDisplay.short.replace('₦', '')}
                    </span>
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
                      ? t("product.isOutOfStock", { name })
                      : added
                        ? t("product.addedToCartAria", { name })
                        : t("product.addToCartAria", { name, price: priceDisplay.full })
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