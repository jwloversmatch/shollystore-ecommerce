import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { getCloudinaryUrl } from "../../utils/cloudinary";

interface ImageLightboxProps {
  image: string | null;
  onClose: () => void;
}

const ImageLightbox = ({ image, onClose }: ImageLightboxProps) => (
  <AnimatePresence>
    {image && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
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
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition"
            aria-label="Close preview"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={getCloudinaryUrl(image, 1200)}
            alt="Review full size"
            className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
          />
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default ImageLightbox;
