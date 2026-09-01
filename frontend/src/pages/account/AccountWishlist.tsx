import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import {
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
  WishlistProduct,
} from "../../features/api/apiSlice";
import { toggleWishlist } from "../../features/wishlist/wishlistSlice";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { getCloudinaryUrl } from "../../utils/cloudinary";

const PLACEHOLDER = "https://via.placeholder.com/300x300?text=No+Image";

const AccountWishlist = () => {
  const dispatch = useDispatch();
  const { data: wishlistData, isLoading } = useGetWishlistQuery();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  const wishlist = wishlistData?.wishlist ?? [];

  const handleRemove = async (productId: string) => {
    try {
      await removeFromWishlist(productId).unwrap();
      dispatch(toggleWishlist(productId));
      toast.success("Removed from wishlist");
    } catch {
      toast.error("Failed to remove");
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl h-48 bg-gray-200 dark:bg-[#141414] animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 rounded-full bg-[#e8622a]/10 flex items-center justify-center mx-auto mb-4">
          <Heart className="w-10 h-10 text-[#e8622a]" />
        </div>
        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">
          Your wishlist is empty
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
          Tap the heart on any product to save it here for later.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white"
          style={{ background: "#e8622a", boxShadow: "0 6px 18px rgba(232,98,42,0.4)" }}
        >
          <ShoppingBag className="w-4 h-4" /> Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {wishlist.map((product: WishlistProduct) => (
        <motion.div
          key={product._id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden border bg-white dark:bg-[#141414] border-gray-200 dark:border-white/[0.06] shadow-sm"
        >
          <Link
            to={`/products/${product.slug || product._id}`}
            className="block relative"
          >
            <img
              src={getCloudinaryUrl(product.images?.[0] || PLACEHOLDER, 400)}
              alt={product.name}
              className="w-full h-40 object-contain p-3"
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                handleRemove(product._id);
              }}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 dark:bg-black/40 text-red-500 hover:text-red-600 transition-colors"
              aria-label={`Remove ${product.name} from wishlist`}
            >
              <Heart className="w-4 h-4 fill-current" />
            </button>
          </Link>
          <div className="p-3">
            <h3 className="font-semibold text-sm truncate text-gray-900 dark:text-white">
              {product.name}
            </h3>
            <p className="text-[#e8622a] font-bold mt-1">
              ₦{product.price.toLocaleString()}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default AccountWishlist;