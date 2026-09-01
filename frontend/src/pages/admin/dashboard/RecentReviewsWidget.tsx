import { Star, Trash2, MessageSquare } from "lucide-react";
import {
  useGetAdminReviewsQuery,
  useDeleteAdminReviewMutation,
} from "../../../features/api/apiSlice";
import toast from "react-hot-toast";

interface Props {
  isDark: boolean;
}

const RecentReviewsWidget = ({ isDark }: Props) => {
  const { data, isLoading } = useGetAdminReviewsQuery({ page: 1, limit: 5 });
  const [deleteReview] = useDeleteAdminReviewMutation();

  const bg = isDark ? "#141414" : "#fff";
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

  const reviews = data?.reviews ?? [];

  return (
    <div className="rounded-2xl p-5" style={{ background: bg, border: `1px solid ${border}` }}>
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5" style={{ color: accent }} />
        <h2 className="text-lg font-bold" style={{ color: textPrimary }}>Recent Reviews</h2>
        {!isLoading && reviews.length > 0 && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(232,98,42,0.12)", color: accent }}>
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
            <div key={review._id} className="border rounded-xl p-3" style={{ borderColor: border }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm" style={{ color: textPrimary }}>
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
              <p className="text-xs mt-1 line-clamp-2" style={{ color: textMuted }}>
                {review.comment}
              </p>
              <p className="text-[10px] mt-1" style={{ color: textMuted }}>
                {typeof review.product === "object" ? review.product.name : "Unknown product"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentReviewsWidget;