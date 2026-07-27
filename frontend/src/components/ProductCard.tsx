import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Check } from "lucide-react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { addToCart } from "../features/cart/cartSlice";
import { getCloudinaryUrl } from "../utils/cloudinary";
import type { IVariant } from "../types/home";   // ✅ added

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
  variants?: IVariant[];   // ✅ new
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
}: ProductProps) => {
  const dispatch = useDispatch();
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);

  const isOutOfStock = stock !== undefined && stock === 0;
  const accent = isOutOfStock ? "#ef4444" : "#e8622a";
  const hasSale = (compareAtPrice && compareAtPrice > price) || (discountPercent && discountPercent > 0);

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

  const imgSrc = getCloudinaryUrl(imgError ? FALLBACK : image, 400);
  const srcSet = !imgError
    ? `${getCloudinaryUrl(image, 400)} 400w, ${getCloudinaryUrl(image, 800)} 800w`
    : undefined;
  const sizes = "(max-width: 640px) 100vw, 50vw";

  return (
    <motion.div
      className="flex flex-col rounded-2xl overflow-hidden border cursor-pointer group
        bg-white dark:bg-[#141414]
        border-gray-200 dark:border-white/[0.06]
        shadow-sm dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      whileHover="hover"
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      onClick={onClick}
    >
      {/* Image area */}
      <div className="relative w-full h-48 bg-gray-100 dark:bg-[#1a1a1a] flex items-center justify-center p-4">
        <motion.img
          src={imgSrc}
          srcSet={srcSet}
          sizes={sizes}
          alt={name}
          loading="lazy"
          onError={() => setImgError(true)}
          className="max-w-full max-h-full object-contain"
          variants={{ hover: { scale: 1.06 } }}
          transition={{ duration: 0.35 }}
        />

        {/* Stock badge */}
        {stock !== undefined && (
          <div
            className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
              isOutOfStock
                ? "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"
                : "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
            }`}
          >
            {isOutOfStock ? "Sold Out" : `${stock} left`}
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-sm bg-black/60 px-4 py-2 rounded-full">
              Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="flex flex-col flex-1 p-4">
        <span
          className="text-[10px] font-extrabold uppercase tracking-[0.2em] mb-1.5"
          style={{ color: accent }}
        >
          {category}
        </span>

        <h3 className="font-bold text-sm leading-snug line-clamp-2 mb-1 text-gray-900 dark:text-white">
          {name}
        </h3>

        {/* Variant pills (just visual hint) */}
        {variants && variants.length > 0 && (
          <div className="flex gap-1 mb-2 flex-wrap">
            {variants.map((v, idx) => {
              const label = v.size || v.color || v.sku;
              if (!label) return null;
              return (
                <span key={idx} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  {label}
                </span>
              );
            })}
          </div>
        )}

        <div className="mt-auto space-y-1.5">
          {/* Sale price + discount badge */}
          {hasSale && (
            <div className="flex items-center gap-2 flex-wrap">
              {compareAtPrice && compareAtPrice > price && (
                <span className="text-xs text-gray-500 line-through">
                  ₦{compareAtPrice.toLocaleString()}
                </span>
              )}
              {discountPercent && discountPercent > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-extrabold rounded-full bg-red-500/20 text-red-500 border border-red-500/30">
                  -{discountPercent}%
                </span>
              )}
            </div>
          )}

          <div className="flex items-end justify-between gap-2">
            <div className="flex items-baseline gap-0.5">
              <span className="text-gray-500 dark:text-gray-400 text-xs pb-0.5">₦</span>
              <span className="font-black text-xl leading-none text-gray-900 dark:text-white">
                {price.toLocaleString()}
              </span>
            </div>

            <motion.button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              whileTap={{ scale: 0.9 }}
              className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${
                isOutOfStock
                  ? "bg-gray-200 dark:bg-[#1e1e1e] text-gray-500 dark:text-gray-600 cursor-not-allowed"
                  : added
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-white/20"
              }`}
              title={isOutOfStock ? "Unavailable" : "Add to cart"}
            >
              {isOutOfStock ? (
                <span className="text-xs font-bold">✕</span>
              ) : added ? (
                <Check className="w-4 h-4" />
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;