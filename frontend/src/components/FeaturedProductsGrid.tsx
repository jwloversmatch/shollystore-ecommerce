import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetProductsQuery } from "../features/api/apiSlice";
import ProductCard from "./ProductCard";
import ProductQuickViewModal from "./ProductQuickViewModal";
import { PLACEHOLDER } from "../types/home";
import type { ProductItem } from "../types/home";

const FeaturedProductsGrid = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetProductsQuery({ featured: true, limit: 8 });
  const products = data?.products ?? [];

  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-2xl animate-pulse bg-gray-100 dark:bg-[#141414]"
              />
            ))
          : products.map((product, i) => (
              <ProductCard
                key={product._id}
                index={i}
                _id={product._id}
                name={product.name}
                price={product.price}
                image={product.images?.[0] || PLACEHOLDER}
                category={
                  typeof product.category === "string"
                    ? product.category
                    : product.category?.name ?? "General"
                }
                stock={product.stock}
                compareAtPrice={product.compareAtPrice}
                discountPercent={product.discount?.percentage}
                onClick={() =>
                  navigate(`/products/${product.slug || product._id}`)
                }
                averageRating={product.averageRating}
                numberOfReviews={product.numberOfReviews}
                onQuickView={setQuickViewProduct}
                fullProduct={product}
              />
            ))}
      </div>

      <ProductQuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </>
  );
};

export default FeaturedProductsGrid;