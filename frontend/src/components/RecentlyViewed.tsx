import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGetProductsByIdsQuery } from "../features/api/apiSlice";
import ProductCard from "./ProductCard";
import type { ProductItem } from "../types/home";
import { PLACEHOLDER } from "../types/home";

interface RecentlyViewedProps {
  recentIds: string[];
  currentProductId: string;
}

const RecentlyViewed = ({
  recentIds,
  currentProductId,
}: RecentlyViewedProps) => {
  const navigate = useNavigate();

  const filteredIds = useMemo(
    () =>
      Array.from(new Set(recentIds)).filter((id) => id !== currentProductId),
    [recentIds, currentProductId],
  );

  const { data, isLoading } = useGetProductsByIdsQuery(filteredIds, {
    skip: filteredIds.length === 0,
  });

  // Keep original order of recentIds
  const products = useMemo(() => {
    const byId = new Map<string, ProductItem>();
    data?.products?.forEach((p) => byId.set(p._id, p));
    return filteredIds
      .map((id) => byId.get(id))
      .filter(Boolean) as ProductItem[];
  }, [data, filteredIds]);

  if (isLoading) {
    return null;
  }

  if (filteredIds.length === 0 || products.length === 0) return null;

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
                : (product.category?.name ?? "General")
            }
            stock={product.stock}
            compareAtPrice={product.compareAtPrice}
            discountPercent={product.discount?.percentage}
            onClick={() => navigate(`/products/${product.slug || product._id}`)}
            averageRating={product.averageRating}
            numberOfReviews={product.numberOfReviews}
          />
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewed;
