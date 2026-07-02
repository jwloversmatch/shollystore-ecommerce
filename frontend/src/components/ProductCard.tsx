import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, ImageOff } from 'lucide-react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { addToCart } from '../features/cart/cartSlice';

interface ProductProps {
  _id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  stock?: number;
}

const ProductCard = ({
  _id,
  name,
  price,
  image,
  category = 'General',
  stock,
}: ProductProps) => {
  const dispatch = useDispatch();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = () => {
    if (stock !== undefined && stock === 0) {
      toast.error('Sorry, this item is out of stock!');
      return;
    }
    dispatch(
      addToCart({
        _id,
        name,
        image,
        price,
        qty: 1,
        stock: stock ?? 999,
      })
    );
    toast.success(`Added ${name} to cart!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden border border-gray-100 hover:border-gray-300"
    >
      {/* Image container with fixed aspect ratio to prevent layout shift */}
      <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden shrink-0">
        {/* Loading shimmer / placeholder */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
        )}

        {/* Fallback if image fails to load */}
        {imageError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <ImageOff className="w-8 h-8 mb-1" />
            <span className="text-xs">No image</span>
          </div>
        ) : (
          <img
            src={image}
            alt={name}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-contain p-3 md:p-4 group-hover:scale-105 transition-transform duration-500 ease-out ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Category badge */}
        <span className="absolute top-3 left-3 bg-white/80 backdrop-blur-md border border-white/40 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-800 shadow-sm">
          {category}
        </span>

        {/* Stock badge */}
        {stock !== undefined && (
          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border border-white/40 backdrop-blur-md bg-gray-900/80 text-white">
            {stock === 0 ? 'Out of Stock' : `${stock} Available`}
          </span>
        )}
      </div>

      {/* Content area */}
      <div className="p-4 md:p-5 flex flex-col flex-1 justify-between relative z-10">
        <div>
          <h3 className="text-gray-800 font-bold text-base md:text-lg truncate group-hover:text-leaf-green transition-colors duration-300">
            {name}
          </h3>
          <p className="text-leaf-green font-bold text-xl md:text-2xl mt-1">
            ₦{price.toLocaleString()}
          </p>
        </div>

        <motion.button
          onClick={handleAddToCart}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          disabled={stock !== undefined && stock === 0}
          className="mt-3 md:mt-4 w-full relative overflow-hidden bg-black text-white py-2.5 md:py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 ease-in-out" />
          <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 group-hover/btn:-rotate-12 transition-transform duration-300" />
          <span className="text-sm md:text-base">
            {stock !== undefined && stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCard;