import { useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetAdminReviewsQuery,
  useDeleteAdminReviewMutation,
} from "../../../features/api/apiSlice";
import { Search, Trash2, Star, X } from "lucide-react";
import ConfirmationModal from "../../../components/ConfirmationModal";
import { getCloudinaryUrl } from "../../../utils/cloudinary";

const ReviewsPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

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

  const openLightbox = (img: string) => setLightboxImage(img);
  const closeLightbox = () => setLightboxImage(null);

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

                {/* Display review images (clickable) */}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {review.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => openLightbox(img)}
                        className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 hover:opacity-80 transition-opacity"
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

      {/* Lightbox for review images */}
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
    </main>
  );
};

export default ReviewsPage;