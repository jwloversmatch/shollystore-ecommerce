import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import ConfirmationModal from "../../ConfirmationModal";
import { StarRating } from "../../StarRating";
import ReviewItem from "./ReviewItem";
import ReviewForm from "./ReviewForm";
import ImageLightbox from "../ImageLightbox";
import {
  useGetProductReviewsQuery,
  useAddReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useUploadReviewImageMutation,
} from "../../../features/api/apiSlice";

const MAX_REVIEW_LENGTH = 500;
const MAX_REVIEW_IMAGES = 3;
const EDIT_WINDOW_MS = 15 * 60 * 1000;

interface ProductReviewsProps {
  productId: string;
  userId?: string;
  isLoggedIn: boolean;
  averageRating?: number;
  numberOfReviews?: number;
}

const ProductReviews = ({
  productId,
  userId,
  isLoggedIn,
  averageRating,
  numberOfReviews,
}: ProductReviewsProps) => {
  const [addReview, { isLoading: addingReview }] = useAddReviewMutation();
  const [updateReview, { isLoading: updatingReview }] = useUpdateReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();
  const [uploadReviewImage] = useUploadReviewImageMutation();

  // Add review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewImages, setReviewImages] = useState<string[]>([]);

  // Edit review state
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [editImages, setEditImages] = useState<string[]>([]);

  const [deleteTarget, setDeleteTarget] = useState<{
    reviewId: string;
    productId: string;
  } | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const [currentTime] = useState(() => Date.now());

  const { data: reviewsData, isLoading: reviewsLoading } = useGetProductReviewsQuery(
    { productId, page: 1, limit: 10 },
    { skip: !productId },
  );

  const handleImageUpload = async (files: FileList | null, isEditMode = false) => {
    if (!files || files.length === 0) return;

    const currentImages = isEditMode ? editImages : reviewImages;
    const remaining = MAX_REVIEW_IMAGES - currentImages.length;
    if (remaining <= 0) return;

    const filesArray = Array.from(files).slice(0, remaining);
    const uploadedUrls: string[] = [];

    for (const file of filesArray) {
      const formData = new FormData();
      formData.append("image", file);
      try {
        const res = await uploadReviewImage(formData).unwrap();
        if (res.url) uploadedUrls.push(res.url);
      } catch {
        toast.error("Image upload failed");
      }
    }

    if (isEditMode) {
      setEditImages((prev) => [...prev, ...uploadedUrls].slice(0, MAX_REVIEW_IMAGES));
    } else {
      setReviewImages((prev) => [...prev, ...uploadedUrls].slice(0, MAX_REVIEW_IMAGES));
    }
  };

  const removeImage = (index: number, isEditMode = false) => {
    if (isEditMode) {
      setEditImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setReviewImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error("Please login to write a review");
      return;
    }
    if (!reviewComment.trim()) {
      toast.error("Please enter a review comment");
      return;
    }
    try {
      await addReview({
        productId,
        rating: reviewRating,
        comment: reviewComment,
        images: reviewImages,
      }).unwrap();
      toast.success("Review submitted!");
      setReviewComment("");
      setReviewRating(5);
      setReviewImages([]);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : "Failed to submit review";
      toast.error(message || "Failed to submit review");
    }
  };

  const handleStartEdit = (review: {
    _id: string;
    rating: number;
    comment: string;
    images?: string[];
  }) => {
    setEditingReviewId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setEditImages(review.images || []);
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditRating(5);
    setEditComment("");
    setEditImages([]);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReviewId) return;
    if (!editComment.trim()) {
      toast.error("Please enter a review comment");
      return;
    }
    try {
      await updateReview({
        productId,
        reviewId: editingReviewId,
        rating: editRating,
        comment: editComment,
        images: editImages,
      }).unwrap();
      toast.success("Review updated");
      setEditingReviewId(null);
      setEditRating(5);
      setEditComment("");
      setEditImages([]);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : "Failed to update review";
      toast.error(message || "Failed to update review");
    }
  };

  const handleDeleteClick = (reviewId: string) => {
    setDeleteTarget({ reviewId, productId });
  };

  const confirmDeleteReview = async () => {
    if (!deleteTarget) return;
    try {
      await deleteReview({
        productId: deleteTarget.productId,
        reviewId: deleteTarget.reviewId,
      }).unwrap();
      toast.success("Review deleted");
      setDeleteTarget(null);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : "Failed to delete review";
      toast.error(message || "Failed to delete review");
      setDeleteTarget(null);
    }
  };

  return (
    <section aria-label="Customer reviews" className="mt-10">
      <div className="border-t border-gray-200 dark:border-white/[0.06] pt-8">
        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">
          Customer Reviews
        </h2>

        <div className="flex items-center gap-3 mb-6">
          <StarRating rating={averageRating || 0} />
          <span className="font-bold text-gray-900 dark:text-white">
            {averageRating?.toFixed(1) || "0.0"}
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            ({numberOfReviews || 0} reviews)
          </span>
        </div>

        {reviewsLoading ? (
          <p className="text-gray-500">Loading reviews...</p>
        ) : reviewsData?.reviews?.length ? (
          <div className="space-y-4">
            {reviewsData.reviews.map((review) => {
              const isOwner = !!userId && review.user._id === userId;
              const isEditing = editingReviewId === review._id;
              const canEdit =
                isOwner &&
                currentTime - new Date(review.createdAt).getTime() < EDIT_WINDOW_MS;
              const canDelete = canEdit;

              return (
                <ReviewItem
                  key={review._id}
                  review={review}
                  isOwner={isOwner}
                  canEdit={canEdit}
                  canDelete={canDelete}
                  isEditing={isEditing}
                  onStartEdit={() => handleStartEdit(review)}
                  onDeleteClick={() => handleDeleteClick(review._id)}
                  onImageClick={setLightboxImage}
                  editRating={editRating}
                  onEditRatingChange={setEditRating}
                  editComment={editComment}
                  onEditCommentChange={setEditComment}
                  editImages={editImages}
                  onEditImageUpload={(files) => handleImageUpload(files, true)}
                  onEditImageRemove={(idx) => removeImage(idx, true)}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={handleCancelEdit}
                  isSavingEdit={updatingReview}
                  maxReviewLength={MAX_REVIEW_LENGTH}
                  maxReviewImages={MAX_REVIEW_IMAGES}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">
            No reviews yet. Be the first to review this product!
          </p>
        )}

        {isLoggedIn ? (
          <ReviewForm
            formClassName="mt-8 space-y-4"
            commentInputId="review-comment"
            rating={reviewRating}
            onRatingChange={setReviewRating}
            comment={reviewComment}
            onCommentChange={setReviewComment}
            commentPlaceholder="Share your experience..."
            maxLength={MAX_REVIEW_LENGTH}
            images={reviewImages}
            maxImages={MAX_REVIEW_IMAGES}
            onImageUpload={(files) => handleImageUpload(files, false)}
            onImageRemove={(idx) => removeImage(idx, false)}
            onSubmit={handleSubmitReview}
            isSubmitting={addingReview}
            submitLabel="Submit Review"
            submittingLabel="Submitting..."
          />
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
            Please{" "}
            <Link to="/login" className="text-[#e8622a] font-bold">
              login
            </Link>{" "}
            to write a review.
          </p>
        )}
      </div>

      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteReview}
        title="Delete Review?"
        message="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      <ImageLightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
    </section>
  );
};

export default ProductReviews;
