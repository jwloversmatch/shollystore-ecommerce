import { X } from "lucide-react";
import { getCloudinaryUrl } from "../../../utils/cloudinary";

interface ReviewImageUploaderProps {
  images: string[];
  maxImages: number;
  onUpload: (files: FileList | null) => void;
  onRemove: (index: number) => void;
}

const ReviewImageUploader = ({
  images,
  maxImages,
  onUpload,
  onRemove,
}: ReviewImageUploaderProps) => (
  <div>
    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
      Photos (up to {maxImages})
    </label>
    <div className="flex flex-wrap gap-2">
      {images.map((img, idx) => (
        <div
          key={idx}
          className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200"
        >
          <img
            src={getCloudinaryUrl(img, 200)}
            alt={`Preview ${idx + 1}`}
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => onRemove(idx)}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
            aria-label="Remove image"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
      {images.length < maxImages && (
        <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer text-gray-400 hover:border-[#e8622a]">
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => onUpload(e.target.files)}
          />
          <span className="text-2xl">+</span>
        </label>
      )}
    </div>
  </div>
);

export default ReviewImageUploader;
