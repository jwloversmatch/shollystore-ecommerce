import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ProductQuickViewModal from "../components/ProductQuickViewModal";
import type { ProductItem } from "../types/home";
import { PLACEHOLDER } from "../types/home";

interface RelatedProductsProps {
  products: ProductItem[];
}

const RelatedProducts = ({ products }: RelatedProductsProps) => {
  const navigate = useNavigate();
  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(
    null,
  );

  if (!products || products.length === 0) return null;

  return (
    <section className="mt-16" aria-labelledby="related-heading">
      <div className="mb-6">
        <h2
          id="related-heading"
          className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white"
        >
          Related Products
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
            variants={product.variants}
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
    </section>
  );
};

export default RelatedProducts;