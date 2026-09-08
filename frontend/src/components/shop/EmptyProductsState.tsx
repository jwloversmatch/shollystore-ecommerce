import { Package } from "lucide-react";
import ProductGrid from "./ProductGrid";
import { ACCENT } from "../../types/home";
import type { ProductItem } from "../../types/home";

interface EmptyProductsStateProps {
  onClearFilters: () => void;
  isFallbackLoading: boolean;
  fallbackCategoryName?: string;
  parentFallbackProducts: ProductItem[];
  globalFallbackProducts: ProductItem[];
  onProductClick: (product: ProductItem) => void;
  onQuickView: (product: ProductItem) => void;
}

const EmptyProductsState = ({
  onClearFilters,
  isFallbackLoading,
  fallbackCategoryName,
  parentFallbackProducts,
  globalFallbackProducts,
  onProductClick,
  onQuickView,
}: EmptyProductsStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div
      className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
      style={{ background: `${ACCENT}10` }}
    >
      <Package className="w-10 h-10" style={{ color: ACCENT }} aria-hidden="true" />
    </div>
    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">
      No products found
    </h2>
    <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
      We couldn't find any products in this category. But here are some other
      items you might like.
    </p>
    <button
      onClick={onClearFilters}
      className="px-6 py-3 rounded-xl font-bold text-white text-sm"
      style={{ background: ACCENT, boxShadow: `0 6px 18px ${ACCENT}44` }}
    >
      Clear all filters
    </button>

    {isFallbackLoading ? (
      <div className="mt-12 w-full grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-48 rounded-2xl bg-gray-200 dark:bg-[#1c1c1c] animate-pulse"
          />
        ))}
      </div>
    ) : (
      <>
        {parentFallbackProducts.length > 0 ? (
          <div className="mt-12 w-full">
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">
              More in {fallbackCategoryName}
            </h3>
            <ProductGrid
              products={parentFallbackProducts}
              onProductClick={onProductClick}
              onQuickView={onQuickView}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
              transitionDuration={0.4}
            />
          </div>
        ) : globalFallbackProducts.length > 0 ? (
          <div className="mt-12 w-full">
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">
              Popular Products
            </h3>
            <ProductGrid
              products={globalFallbackProducts}
              onProductClick={onProductClick}
              onQuickView={onQuickView}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
              transitionDuration={0.4}
            />
          </div>
        ) : null}
      </>
    )}
  </div>
);

export default EmptyProductsState;
