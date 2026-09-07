import { ShoppingCart, Check, Heart } from "lucide-react";
import QuantityStepper from "./QuantityStepper";
import { ACCENT } from "./constants";

interface DesktopPurchaseBarProps {
  isOutOfStock: boolean;
  qty: number;
  displayStock: number;
  onDecreaseQty: () => void;
  onIncreaseQty: () => void;
  isWishlisted: boolean;
  onWishlistToggle: () => void;
  added: boolean;
  onAddToCart: () => void;
  productName: string;
}

const DesktopPurchaseBar = ({
  isOutOfStock,
  qty,
  displayStock,
  onDecreaseQty,
  onIncreaseQty,
  isWishlisted,
  onWishlistToggle,
  added,
  onAddToCart,
  productName,
}: DesktopPurchaseBarProps) => {
  if (isOutOfStock) {
    return (
      <div
        className="px-5 py-4 rounded-xl border text-sm text-red-400 font-semibold bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20"
        role="alert"
      >
        Currently unavailable. Check back later.
      </div>
    );
  }

  return (
    <div className="hidden sm:flex items-center gap-3">
      <QuantityStepper
        qty={qty}
        maxStock={displayStock}
        onDecrease={onDecreaseQty}
        onIncrease={onIncreaseQty}
        size="desktop"
      />

      <button
        onClick={onWishlistToggle}
        className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors ${
          isWishlisted
            ? "text-red-500 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20"
            : "text-gray-400 bg-gray-100 dark:bg-[#1c1c1c] border-gray-200 dark:border-white/[0.09] hover:text-red-400"
        }`}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart
          className="w-5 h-5"
          fill={isWishlisted ? "currentColor" : "none"}
          aria-hidden="true"
        />
      </button>

      <button
        onClick={onAddToCart}
        className="flex-1 h-12 rounded-xl font-black text-white text-[15px] flex items-center justify-center gap-2.5 transition-all"
        style={{
          background: added ? "#10b981" : ACCENT,
          boxShadow: added
            ? "0 8px 24px rgba(16,185,129,0.35)"
            : `0 8px 24px ${ACCENT}44`,
        }}
        aria-label={
          added ? `${productName} added to cart` : `Add ${productName} to cart`
        }
      >
        {added ? (
          <Check className="w-5 h-5" aria-hidden="true" />
        ) : (
          <ShoppingCart className="w-5 h-5" aria-hidden="true" />
        )}
        {added ? "Added to Cart!" : "Add to Cart"}
      </button>
    </div>
  );
};

export default DesktopPurchaseBar;
