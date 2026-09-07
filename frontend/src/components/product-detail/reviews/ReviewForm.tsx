import { StarRating } from "../../StarRating";
import ReviewImageUploader from "./ReviewImageUploader";

interface ReviewFormProps {
  formClassName: string;
  commentInputId: string;
  rating: number;
  onRatingChange: (rating: number) => void;
  comment: string;
  onCommentChange: (comment: string) => void;
  commentPlaceholder: string;
  maxLength: number;
  images: string[];
  maxImages: number;
  onImageUpload: (files: FileList | null) => void;
  onImageRemove: (index: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  submitLabel: string;
  submittingLabel: string;
  dense?: boolean;
  onCancel?: () => void;
}

const ReviewForm = ({
  formClassName,
  commentInputId,
  rating,
  onRatingChange,
  comment,
  onCommentChange,
  commentPlaceholder,
  maxLength,
  images,
  maxImages,
  onImageUpload,
  onImageRemove,
  onSubmit,
  isSubmitting,
  submitLabel,
  submittingLabel,
  dense = false,
  onCancel,
}: ReviewFormProps) => (
  <form onSubmit={onSubmit} className={formClassName}>
    <div>
      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
        Your Rating
      </label>
      <StarRating rating={rating} interactive onChange={onRatingChange} size={24} />
    </div>
    <div>
      <label
        htmlFor={commentInputId}
        className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1"
      >
        Your Review
      </label>
      <textarea
        id={commentInputId}
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
        placeholder={commentPlaceholder}
        required
        rows={4}
        maxLength={maxLength}
        className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-[#1c1c1c] text-gray-900 dark:text-white resize-none"
      />
      <p className="text-xs text-gray-400 mt-1">
        {comment.length}/{maxLength}
      </p>
    </div>

    <ReviewImageUploader
      images={images}
      maxImages={maxImages}
      onUpload={onImageUpload}
      onRemove={onImageRemove}
    />

    <div className="flex gap-3">
      <button
        type="submit"
        disabled={isSubmitting}
        className={`px-6 rounded-xl font-bold text-white bg-[#e8622a] disabled:opacity-50 ${dense ? "py-2.5" : "py-3"}`}
      >
        {isSubmitting ? submittingLabel : submitLabel}
      </button>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/[0.08]"
        >
          Cancel
        </button>
      )}
    </div>
  </form>
);

export default ReviewForm;
