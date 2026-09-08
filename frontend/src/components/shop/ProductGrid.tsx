import { motion } from "framer-motion";
import ProductCard from "../ProductCard";
import { PLACEHOLDER } from "../../types/home";
import type { ProductItem } from "../../types/home";

const getCategoryName = (p: ProductItem): string =>
  typeof p.category === "string" ? p.category : (p.category?.name ?? "General");

interface ProductGridProps {
  products: ProductItem[];
  onProductClick: (product: ProductItem) => void;
  onQuickView: (product: ProductItem) => void;
  className: string;
  transitionDuration: number;
  motionKey?: string;
  ariaLabel?: string;
}

const ProductGrid = ({
  products,
  onProductClick,
  onQuickView,
  className,
  transitionDuration,
  motionKey,
  ariaLabel,
}: ProductGridProps) => (
  <motion.div
    key={motionKey}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: transitionDuration, ease: [0.16, 1, 0.3, 1] }}
    className={className}
    aria-label={ariaLabel}
  >
    {products.map((product, i) => (
      <ProductCard
        key={product._id}
        index={i}
        _id={product._id}
        name={product.name}
        price={product.price}
        image={product.images?.[0] || PLACEHOLDER}
        category={getCategoryName(product)}
        stock={product.stock}
        compareAtPrice={product.compareAtPrice}
        discountPercent={product.discount?.percentage}
        onClick={() => onProductClick(product)}
        averageRating={product.averageRating}
        numberOfReviews={product.numberOfReviews}
        onQuickView={onQuickView}
        fullProduct={product}
      />
    ))}
  </motion.div>
);

export default ProductGrid;
