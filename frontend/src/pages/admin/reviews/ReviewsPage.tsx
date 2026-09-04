import { useState } from "react";
import toast from "react-hot-toast";
import {
  useGetAdminReviewsQuery,
  useDeleteAdminReviewMutation,
} from "../../../features/api/apiSlice";
import { Search, Trash2, Star } from "lucide-react";
import ConfirmationModal from "../../../components/ConfirmationModal";

const ReviewsPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useGetAdminReviewsQuery({
    page,
    limit: 20,
    search,
  });
  const [deleteReview] = useDeleteAdminReviewMutation();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteReview(deleteId).unwrap();
      toast.success("Review deleted");
      setDeleteId(null);
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
  const pagination = data?.pagination;

  return (
    <main className="p-4 md:p-6 max-w-7xl mx-auto space-y-5 pb-28 md:pb-10 pt-[calc(80px+env(safe-area-inset-top,0px))] md:pt-[calc(96px+env(safe-area-inset-top,0px))]">
      <h1 className="text-2xl font-bold">Reviews</h1>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="search"
          placeholder="Search by comment, user, or product..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-[#1c1c1c] text-gray-900 dark:text-white"
        />
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{review.user.name}</span>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < review.rating ? "#f59e0b" : "none"}
                        color={i < review.rating ? "#f59e0b" : "#d1d5db"}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm mt-1">{review.comment}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Product: {review.product.name} •{" "}
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setDeleteId(review._id)}
                className="text-red-500 hover:text-red-600"
                aria-label="Delete review"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {reviews.length === 0 && <p>No reviews found.</p>}
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Previous
          </button>
          <span>
            Page {page} of {pagination.pages}
          </span>
          <button
            disabled={page === pagination.pages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Review?"
        message="This will permanently remove the review."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </main>
  );
};

export default ReviewsPage;
