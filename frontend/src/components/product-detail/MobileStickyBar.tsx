import { AnimatePresence, motion } from "framer-motion";
import { ShoppingCart, Check, Heart } from "lucide-react";
import QuantityStepper from "./QuantityStepper";
import { ACCENT } from "./constants";

interface MobileStickyBarProps {
  isOutOfStock: boolean;
  qty: number;
  displayStock: number;
  displayPrice: number;
  onDecreaseQty: () => void;
  onIncreaseQty: () => void;
  isWishlisted: boolean;
  onWishlistToggle: () => void;
  added: boolean;
  onAddToCart: () => void;
  productName: string;
}

const MobileStickyBar = ({
  isOutOfStock,
  qty,
  displayStock,
  displayPrice,
  onDecreaseQty,
  onIncreaseQty,
  isWishlisted,
  onWishlistToggle,
  added,
  onAddToCart,
  productName,
}: MobileStickyBarProps) => (
  <AnimatePresence>
    {!isOutOfStock && (
      <motion.div
        initial={{ y: 120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 120, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        className="fixed inset-x-0 z-40 sm:hidden"
        style={{
          bottom: "calc(64px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div className="bg-[#FCFAF5] dark:bg-[#0A0A0B] px-4 pb-3 pt-2 border-t border-gray-200 dark:border-white/[0.07]">
          <div className="flex gap-2.5">
            <button
              onClick={onWishlistToggle}
              className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                isWishlisted
                  ? "text-red-500 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20"
                  : "text-gray-400 bg-white dark:bg-[#141414] border-gray-200 dark:border-white/[0.1]"
              }`}
              aria-label={
                isWishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
            >
              <Heart
                className="w-5 h-5"
                fill={isWishlisted ? "currentColor" : "none"}
                aria-hidden="true"
              />
            </button>

            <QuantityStepper
              qty={qty}
              maxStock={displayStock}
              onDecrease={onDecreaseQty}
              onIncrease={onIncreaseQty}
              size="mobile"
            />

            <button
              onClick={onAddToCart}
              className="flex-1 h-12 rounded-xl font-black text-white text-sm flex items-center justify-center gap-2 transition-all"
              style={{
                background: added ? "#10b981" : ACCENT,
                boxShadow: added
                  ? "0 6px 20px rgba(16,185,129,0.35)"
                  : `0 6px 20px ${ACCENT}44`,
              }}
              aria-label={
                added
                  ? `${productName} added to cart`
                  : `Add ${productName} to cart for ₦${displayPrice.toLocaleString()}`
              }
            >
              {added ? (
                <Check className="w-4 h-4" aria-hidden="true" />
              ) : (
                <ShoppingCart className="w-4 h-4" aria-hidden="true" />
              )}
              {added
                ? "Added!"
                : `Add to Cart · ₦${displayPrice.toLocaleString()}`}
            </button>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default MobileStickyBar;
