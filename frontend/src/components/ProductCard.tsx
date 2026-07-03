import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, ImageOff, Check } from 'lucide-react';
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
  // slug removed
  onClick?: () => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 },
  },
};

const badgeSpring = {
  rest: { scale: 1 },
  hover: {
    scale: 1.1,
    transition: { type: 'spring' as const, stiffness: 400 },
  },
};

const ProductCard = ({
  _id,
  name,
  price,
  image,
  category = 'General',
  stock,
  onClick,
}: ProductProps) => {
  const dispatch = useDispatch();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [added, setAdded] = useState(false);

  const isOutOfStock = stock !== undefined && stock === 0;

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isOutOfStock) {
        toast.error('Sorry, this item is out of stock!');
        return;
      }
      dispatch(addToCart({ _id, name, image, price, qty: 1, stock: stock ?? 999 }));
      toast.success(`Added ${name} to cart!`);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    },
    [dispatch, _id, name, image, price, stock, isOutOfStock]
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      className="cursor-pointer group"
    >
      <motion.div
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-20px' }}
        whileHover={isOutOfStock ? {} : { y: -4 }}
        className="relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden border border-gray-100"
      >
        {/* Image container */}
        <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden shrink-0">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]" />
          )}
          {imageError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
              <ImageOff className="w-8 h-8 mb-1" />
              <span className="text-xs">No image</span>
            </div>
          ) : (
            <motion.img
              src={image}
              alt={name}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={`w-full h-full object-contain p-3 md:p-4 transition-all duration-500 ${
                imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
              whileHover={{ scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            />
          )}

          <motion.span
            variants={badgeSpring}
            initial="rest"
            whileHover="hover"
            className="absolute top-3 left-3 bg-white/90 backdrop-blur-md border border-white/40 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-800 shadow-sm"
          >
            {category}
          </motion.span>

          {stock !== undefined && (
            <motion.span
              variants={badgeSpring}
              initial="rest"
              whileHover="hover"
              className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border border-white/40 backdrop-blur-md ${
                isOutOfStock ? 'bg-red-500 text-white' : 'bg-gray-900/80 text-white'
              }`}
            >
              {isOutOfStock ? 'Out of Stock' : `${stock} in stock`}
            </motion.span>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="text-red-500 font-bold text-lg opacity-80">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 md:p-5 flex flex-col flex-1 justify-between">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } },
            }}
          >
            <motion.h3
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
              }}
              className="text-gray-800 font-bold text-base md:text-lg truncate group-hover:text-leaf-green transition-colors duration-300"
            >
              {name}
            </motion.h3>
            <motion.p
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
              }}
              className="text-leaf-green font-bold text-xl md:text-2xl mt-1"
            >
              ₦{price.toLocaleString()}
            </motion.p>
          </motion.div>

          <div className="mt-3 md:mt-4">
            {isOutOfStock ? (
              <div className="w-full bg-red-50 text-red-600 py-2.5 md:py-3 rounded-xl text-center text-sm font-medium">
                Unavailable
              </div>
            ) : (
              <motion.button
                onClick={handleAddToCart}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                className="w-full relative overflow-hidden bg-black text-white py-2.5 md:py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 ease-in-out" />
                <motion.span
                  animate={added ? { rotate: [0, -10, 10, -10, 0] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {added ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />}
                </motion.span>
                <span className="text-sm md:text-base">
                  {added ? 'Added ✓' : 'Add to Cart'}
                </span>
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductCard;