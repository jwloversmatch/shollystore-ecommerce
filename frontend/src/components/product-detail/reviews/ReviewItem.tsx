import { Pencil, Trash2 } from "lucide-react";
import { StarRating } from "../../StarRating";
import { getCloudinaryUrl } from "../../../utils/cloudinary";
import ReviewForm from "./ReviewForm";

interface ReviewUser {
  _id: string;
  name: string;
  avatar?: string;
}

interface ReviewData {
  _id: string;
  user: ReviewUser;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
}

interface ReviewItemProps {
  review: ReviewData;
  isOwner: boolean;
  canEdit: boolean;
  canDelete: boolean;
  isEditing: boolean;
  onStartEdit: () => void;
  onDeleteClick: () => void;
  onImageClick: (img: string) => void;

  editRating: number;
  onEditRatingChange: (r: number) => void;
  editComment: string;
  onEditCommentChange: (c: string) => void;
  editImages: string[];
  onEditImageUpload: (files: FileList | null) => void;
  onEditImageRemove: (index: number) => void;
  onSaveEdit: (e: React.FormEvent) => void;
  onCancelEdit: () => void;
  isSavingEdit: boolean;

  maxReviewLength: number;
  maxReviewImages: number;
}

const ReviewItem = ({
  review,
  isOwner,
  canEdit,
  canDelete,
  isEditing,
  onStartEdit,
  onDeleteClick,
  onImageClick,
  editRating,
  onEditRatingChange,
  editComment,
  onEditCommentChange,
  editImages,
  onEditImageUpload,
  onEditImageRemove,
  onSaveEdit,
  onCancelEdit,
  isSavingEdit,
  maxReviewLength,
  maxReviewImages,
}: ReviewItemProps) => {
  return (
    <div className="border-b border-gray-200 dark:border-white/[0.06] pb-4">
      {isEditing ? (
        <ReviewForm
          formClassName="space-y-4"
          commentInputId={`edit-comment-${review._id}`}
          rating={editRating}
          onRatingChange={onEditRatingChange}
          comment={editComment}
          onCommentChange={onEditCommentChange}
          commentPlaceholder="Update your review..."
          maxLength={maxReviewLength}
          images={editImages}
          maxImages={maxReviewImages}
          onImageUpload={onEditImageUpload}
          onImageRemove={onEditImageRemove}
          onSubmit={onSaveEdit}
          isSubmitting={isSavingEdit}
          submitLabel="Save Changes"
          submittingLabel="Saving..."
          dense
          onCancel={onCancelEdit}
        />
      ) : (
        <>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {review.user.avatar ? (
                <img
                  src={review.user.avatar}
                  alt={review.user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold">
                  {review.user.name.charAt(0)}
                </span>
              )}
            </div>
            <span className="font-bold text-gray-900 dark:text-white">
              {review.user.name}
            </span>
            <StarRating rating={review.rating} />
          </div>
          <p className="mt-2 text-gray-700 dark:text-gray-300">
            {review.comment}
          </p>

          {review.images && review.images.length > 0 && (
            <div className="flex gap-2 mt-2">
              {review.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => onImageClick(img)}
                  className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 hover:opacity-80 transition-opacity"
                  aria-label={`View review image ${idx + 1}`}
                >
                  <img
                    src={getCloudinaryUrl(img, 200)}
                    alt={`Review image ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
            {isOwner && (
              <div className="flex gap-2">
                {canEdit && (
                  <button
                    onClick={onStartEdit}
                    className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1"
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={onDeleteClick}
                    className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ReviewItem;
