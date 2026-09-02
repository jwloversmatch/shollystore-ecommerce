import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGetProductsQuery } from "../features/api/apiSlice";
import ProductCard from "./ProductCard";
import type { ProductItem } from "../types/home";
import { PLACEHOLDER } from "../types/home";

interface RecentlyViewedProps {
  recentIds: string[];
}

const RecentlyViewed = ({ recentIds }: RecentlyViewedProps) => {
  const navigate = useNavigate();

  // Fetch all products once (may be heavy, but works for demo)
  const { data, isLoading } = useGetProductsQuery({ limit: 9999 });

  // Derive recently viewed products during render, no effect needed
  const products = useMemo(() => {
    const allProducts = data?.products as ProductItem[] | undefined;
    if (!allProducts) return [];

    return recentIds
      .map((id) => allProducts.find((p) => p._id === id))
      .filter(Boolean) as ProductItem[];
  }, [data, recentIds]);

  if (isLoading) {
    return null; // or a small skeleton
  }

  if (recentIds.length === 0 || products.length === 0) return null;

  return (
    <section className="mt-16" aria-labelledby="recent-heading">
      <div className="mb-6">
        <h2
          id="recent-heading"
          className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white"
        >
          Recently Viewed
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.slice(0, 4).map((product, i) => (
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
          />
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewed;