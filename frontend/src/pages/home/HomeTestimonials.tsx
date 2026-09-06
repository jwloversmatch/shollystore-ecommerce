import { motion } from "framer-motion";
import { useGetFeaturedReviewsQuery } from "../../features/api/apiSlice";
import { StarRating } from "../../components/StarRating";
import { Quote } from "lucide-react";

const HomeTestimonials = () => {
  const { data, isLoading, isError } = useGetFeaturedReviewsQuery({ limit: 3 });

  if (isLoading || isError || !data?.reviews?.length) return null;

  const reviews = data.reviews;

  return (
    <section className="relative py-16 md:py-20 bg-gradient-to-b from-[#FCFAF5] to-[#f7f5f0] dark:from-[#0A0A0B] dark:to-[#141414]">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Section header */}
        <div className="text-center mb-10 md:mb-14">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-[#e8622a] mb-2">
            Testimonials
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white leading-tight">
            What Our Customers Say
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-lg mx-auto">
            Real feedback from real people who love shopping with us.
          </p>
        </div>

        {/* Testimonial cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((review, idx) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.45, delay: idx * 0.1 }}
              className="relative rounded-2xl p-6 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/[0.08] shadow-md dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] hover:shadow-lg transition-shadow"
            >
              <Quote
                className="w-8 h-8 text-[#e8622a] opacity-20 absolute top-5 right-5"
                aria-hidden="true"
              />

              <div className="flex items-center gap-3 mb-3">
                {review.user.avatar ? (
                  <img
                    src={review.user.avatar}
                    alt={review.user.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#e8622a]/20"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#e8622a]/10 flex items-center justify-center text-[#e8622a] font-bold text-lg">
                    {review.user.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white leading-tight">
                    {review.user.name}
                  </h3>
                  <StarRating rating={review.rating} size={14} />
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-4">
                “{review.comment}”
              </p>

              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/[0.06]">
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                  {review.product.name}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeTestimonials;