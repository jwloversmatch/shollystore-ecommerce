import { ACCENT } from "./constants";

interface ActiveVariantLabel {
  size?: string;
  color?: string;
}

interface ProductPriceBlockProps {
  displayPrice: number;
  hasVariants: boolean;
  activeVariant: ActiveVariantLabel | null;
  hasSalePrice: boolean;
  displayCompareAtPrice?: number;
  hasDiscount?: boolean;
  discountPercent?: number;
}

const ProductPriceBlock = ({
  displayPrice,
  hasVariants,
  activeVariant,
  hasSalePrice,
  displayCompareAtPrice,
  hasDiscount,
  discountPercent,
}: ProductPriceBlockProps) => {
  return (
    <div
      className="flex items-baseline gap-3 flex-wrap"
      aria-label="Product pricing"
    >
      <div className="flex items-baseline gap-1">
        <span className="text-gray-600 dark:text-gray-400 text-xl font-bold">
          ₦
        </span>
        <span
          className="text-3xl sm:text-4xl font-black"
          style={{ color: ACCENT }}
        >
          {displayPrice.toLocaleString()}
        </span>
      </div>

      {hasVariants && !activeVariant && (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#e8622a]/10 text-[#e8622a] border border-[#e8622a]/25">
          Starting Price
        </span>
      )}

      {activeVariant && (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#e8622a]/15 text-[#e8622a] border border-[#e8622a]/30">
          {[activeVariant.size, activeVariant.color]
            .filter(Boolean)
            .join(" / ")}{" "}
          Price
        </span>
      )}

      {hasSalePrice && displayCompareAtPrice && (
        <span
          className="text-gray-400 dark:text-gray-500 line-through text-xl font-medium"
          aria-label={`Original price ₦${displayCompareAtPrice.toLocaleString()}`}
        >
          ₦{displayCompareAtPrice.toLocaleString()}
        </span>
      )}
      {hasDiscount && (
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-red-500/20 text-red-400 border border-red-500/30"
          aria-label={`${discountPercent}% discount`}
        >
          -{discountPercent}%
        </span>
      )}
    </div>
  );
};

export default ProductPriceBlock;
