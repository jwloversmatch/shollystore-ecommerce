import { motion } from "framer-motion";
import { useGetProductsQuery } from "../features/api/apiSlice";
import ProductCard from "./ProductCard";
import { PLACEHOLDER } from "../types/home";

const FeaturedProductsGrid = () => {
  const { data, isLoading } = useGetProductsQuery({ featured: true, limit: 8 });
  const products = data?.products ?? [];

  return (
    <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {isLoading
        ? Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl animate-pulse bg-[#141414]" />
          ))
        : products.map((product) => (
            <motion.div key={product._id} layout>
              <ProductCard
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
                onClick={() => window.location.href = `/products/${product.slug || product._id}`}
              />
            </motion.div>
          ))}
    </motion.div>
  );
};

export default FeaturedProductsGrid;