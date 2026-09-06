import { useGetProductsQuery } from "../../features/api/apiSlice";
import ProductCard from "../../components/ProductCard";
import { useNavigate } from "react-router-dom";
import { PLACEHOLDER } from "../../types/home";

const HomeNewArrivals = () => {
  const { data, isLoading } = useGetProductsQuery({ limit: 8 });
  const navigate = useNavigate();

  if (isLoading || !data?.products?.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-10">
      <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">
        New Arrivals
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.products.map((product, i) => (
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
            onClick={() => navigate(`/products/${product.slug || product._id}`)}
            averageRating={product.averageRating}
            numberOfReviews={product.numberOfReviews}
          />
        ))}
      </div>
    </section>
  );
};

export default HomeNewArrivals;