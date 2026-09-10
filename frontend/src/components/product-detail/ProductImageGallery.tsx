import { useState } from "react";
import { motion } from "framer-motion";
import { ImageOff } from "lucide-react";
import { getCloudinaryUrl } from "../../utils/cloudinary";
import { ACCENT } from "./constants";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  isOutOfStock: boolean;
}

const ProductImageGallery = ({
  images,
  productName,
  isOutOfStock,
}: ProductImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [imgError, setImgError] = useState(false);

  return (
    <section
      aria-label="Product images"
      className="md:sticky md:top-24 space-y-3"
    >
      <div
        className="relative rounded-2xl md:rounded-3xl overflow-hidden
        bg-white dark:bg-[#17181A] border border-gray-200 dark:border-white/[0.07]"
      >
        <div
          className="flex items-center justify-center p-4 md:p-8"
          style={{ minHeight: 200, maxHeight: 320 }}
        >
          {images[selectedImage] && !imgError ? (
            <motion.img
              key={selectedImage}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              src={getCloudinaryUrl(images[selectedImage], 800)}
              srcSet={`${getCloudinaryUrl(images[selectedImage], 400)} 400w, ${getCloudinaryUrl(images[selectedImage], 800)} 800w, ${getCloudinaryUrl(images[selectedImage], 1200)} 1200w`}
              sizes="(max-width: 768px) 100vw, 50vw"
              alt={productName}
              onError={() => setImgError(true)}
              className="w-full object-contain drop-shadow-2xl"
              style={{ maxHeight: 280 }}
              whileHover={{ scale: 1.03 }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-16 w-full text-gray-400 dark:text-gray-700">
              <ImageOff className="w-12 h-12" aria-hidden="true" />
              <p className="text-sm font-semibold">No image available</p>
            </div>
          )}
        </div>

        {isOutOfStock && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/60"
            aria-hidden="true"
          >
            <span className="px-5 py-2 rounded-full font-black text-sm text-white bg-red-500/90">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div
          className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar"
          role="group"
          aria-label="Product image thumbnails"
        >
          {images.map((img: string, idx: number) => (
            <motion.button
              key={idx}
              aria-pressed={idx === selectedImage}
              aria-label={`View product image ${idx + 1} of ${images.length}`}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setSelectedImage(idx)}
              className="w-16 h-16 md:w-18 md:h-18 rounded-xl overflow-hidden shrink-0 border-2 transition-all"
              style={{
                borderColor:
                  idx === selectedImage ? ACCENT : "rgba(255,255,255,0.1)",
                boxShadow:
                  idx === selectedImage ? `0 0 0 1px ${ACCENT}` : "none",
                opacity: idx === selectedImage ? 1 : 0.5,
              }}
            >
              <img
                src={getCloudinaryUrl(img, 100)}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </motion.button>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductImageGallery;
