import { useGetProductReviewsQuery } from "../../features/api/apiSlice";
import { StarRating } from "../../components/StarRating";

interface Props {
  productId: string;
}

const HomeTestimonials = ({ productId }: Props) => {
  const { data, isLoading, isError } = useGetProductReviewsQuery(
    { productId, limit: 3 },
    { skip: !productId },
  );

  if (isLoading || isError || !data?.reviews?.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-10">
      <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">
        What Our Customers Say
      </h2>
      <div className="grid md:grid-cols-3 gap-4">
        {data.reviews.map((review) => (
          <div key={review._id} className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06]">
            <div className="flex items-center gap-2 mb-2">
              <StarRating rating={review.rating} size={16} />
              <span className="font-bold text-sm text-gray-900 dark:text-white">
                {review.user.name}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              {review.comment}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HomeTestimonials;