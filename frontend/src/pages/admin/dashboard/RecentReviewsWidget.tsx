import { useState } from "react";
import { Star, Trash2, MessageSquare, X } from "lucide-react";
import {
  useGetAdminReviewsQuery,
  useDeleteAdminReviewMutation,
} from "../../../features/api/apiSlice";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { getCloudinaryUrl } from "../../../utils/cloudinary";

interface Props {
  isDark: boolean;
}

const RecentReviewsWidget = ({ isDark }: Props) => {
  const { data, isLoading } = useGetAdminReviewsQuery({ page: 1, limit: 5 });
  const [deleteReview] = useDeleteAdminReviewMutation();
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const textPrimary = isDark ? "#fff" : "#111827";
  const textMuted = isDark ? "#6b7280" : "#9ca3af";
  const accent = "#e8622a";

  const handleDelete = async (reviewId: string) => {
    try {
      await deleteReview(reviewId).unwrap();
      toast.success("Review deleted");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "data" in err) {
        const errorData = (err as { data?: { message?: string } }).data;
        toast.error(errorData?.message || "Failed to delete");
      } else {
        toast.error("Failed to delete");
      }
    }
  };

  const openLightbox = (img: string) => setLightboxImage(img);
  const closeLightbox = () => setLightboxImage(null);
  const bg = isDark ? "#141414" : "#fff";
  const reviews = data?.reviews ?? [];

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: bg, border: `1px solid ${border}` }}
    >
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5" style={{ color: accent }} />
        <h2 className="text-lg font-bold" style={{ color: textPrimary }}>
          Recent Reviews
        </h2>
        {!isLoading && reviews.length > 0 && (
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(232,98,42,0.12)", color: accent }}
          >
            {reviews.length} new
          </span>
        )}
      </div>

      {isLoading ? (
        <p style={{ color: textMuted }}>Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p style={{ color: textMuted }}>No reviews yet.</p>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="border rounded-xl p-3"
              style={{ borderColor: border }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="font-semibold text-sm"
                    style={{ color: textPrimary }}
                  >
                    {review.user.name}
                  </span>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        fill={i < review.rating ? "#f59e0b" : "none"}
                        color={i < review.rating ? "#f59e0b" : "#d1d5db"}
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(review._id)}
                  className="text-red-400 hover:text-red-500 transition-colors"
                  aria-label="Delete review"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <p
                className="text-xs mt-1 line-clamp-2"
                style={{ color: textMuted }}
              >
                {review.comment}
              </p>

              {/* Review images */}
              {review.images && review.images.length > 0 && (
                <div className="flex gap-1.5 mt-2">
                  {review.images.slice(0, 3).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => openLightbox(img)}
                      className="w-10 h-10 rounded-md overflow-hidden border border-gray-200 hover:opacity-80 transition-opacity"
                      aria-label={`View review image ${idx + 1}`}
                    >
                      <img
                        src={getCloudinaryUrl(img, 100)}
                        alt={`Review image ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              <p className="text-[10px] mt-1" style={{ color: textMuted }}>
                {typeof review.product === "object"
                  ? review.product.name
                  : "Unknown product"}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label="Review image preview"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-3xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition"
                aria-label="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={getCloudinaryUrl(lightboxImage, 1200)}
                alt="Review full size"
                className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecentReviewsWidget;
