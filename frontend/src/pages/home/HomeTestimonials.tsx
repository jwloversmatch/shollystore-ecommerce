import { useGetAdminReviewsQuery } from "../../features/api/apiSlice";
import { StarRating } from "../../components/StarRating";

const HomeTestimonials = () => {
  const { data, isLoading } = useGetAdminReviewsQuery({ page: 1, limit: 6 });
  const reviews = data?.reviews?.slice(0, 3);

  if (isLoading || !reviews?.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-10">
      <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">
        What Our Customers Say
      </h2>
      <div className="grid md:grid-cols-3 gap-4">
        {reviews.map((review) => (
          <div
            key={review._id}
            className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06]"
          >
            <div className="flex items-center gap-2 mb-2">
              <StarRating rating={review.rating} size={16} />
              <span className="font-bold text-sm text-gray-900 dark:text-white">
                {review.user.name}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              {review.comment}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {review.product.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HomeTestimonials;