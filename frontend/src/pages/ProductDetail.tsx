import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../features/cart/cartSlice";
import { toggleWishlist } from "../features/wishlist/wishlistSlice";
import toast from "react-hot-toast";
import SEO from "../components/SEO";
import ConfirmationModal from "../components/ConfirmationModal";
import RelatedProducts from "../components/RelatedProducts";
import RecentlyViewed from "../components/RecentlyViewed";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import {
  ShoppingCart,
  ArrowLeft,
  ImageOff,
  Minus,
  Plus,
  Check,
  Tag,
  ChevronRight,
  Heart,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  useGetProductBySlugQuery,
  useGetCategoryTreeQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useGetProductReviewsQuery,
  useAddReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} from "../features/api/apiSlice";
import type { ProductItem } from "../types/home";
import type { RootState } from "../store";
import { getCloudinaryUrl } from "../utils/cloudinary";
import { StarRating } from "../components/StarRating";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CategoryNode {
  _id: string;
  name: string;
  slug: string;
  children?: CategoryNode[];
}
interface LocalVariant {
  sku?: string;
  color?: string;
  size?: string;
  price?: number;
  stock?: number;
  compareAtPrice?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const ACCENT = "#e8622a";
const PLACEHOLDER = "https://via.placeholder.com/600";
const MAX_REVIEW_LENGTH = 500;
const EDIT_WINDOW_MS = 15 * 60 * 1000;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getCategoryName = (cat: ProductItem["category"]): string =>
  !cat ? "General" : typeof cat === "string" ? cat : (cat.name ?? "General");

const getCategoryId = (cat: ProductItem["category"]): string | undefined =>
  !cat ? undefined : typeof cat === "string" ? cat : cat._id;

const findCategoryById = (
  tree: CategoryNode[],
  id: string,
): CategoryNode | null => {
  for (const node of tree) {
    if (node._id === id) return node;
    if (node.children) {
      const found = findCategoryById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

const colorMap: Record<string, string> = {
  black: "#0f0f0f",
  white: "#f5f5f5",
  red: "#dc2626",
  blue: "#2563eb",
  green: "#16a34a",
  pink: "#ec4899",
  purple: "#9333ea",
  orange: "#f97316",
  yellow: "#eab308",
  gray: "#6b7280",
  brown: "#78350f",
  navy: "#1e3a8a",
  beige: "#d4c5a9",
  gold: "#f59e0b",
  silver: "#c0c0c0",
};

const getColorHex = (name: string): string | null => {
  const lower = name.trim().toLowerCase();
  return colorMap[lower] || null;
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const wishlistIds = useSelector((s: RootState) => s.wishlist.ids);
  const user = useSelector((s: RootState) => s.auth.user);
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const [addReview, { isLoading: addingReview }] = useAddReviewMutation();
  const [updateReview, { isLoading: updatingReview }] = useUpdateReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();

  // Product state
  const [qty, setQty] = useState(1);
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Review form state (add)
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // Review editing state
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{
    reviewId: string;
    productId: string;
  } | null>(null);

  // Current time (lazy initializer avoids effect)
  const [currentTime] = useState(() => Date.now());

  // Recently viewed hook
  const { recentIds, addToRecentlyViewed } = useRecentlyViewed();

  const { data: product, isLoading, isError } = useGetProductBySlugQuery(slug || "");

  const { data: categoryTree = [] } = useGetCategoryTreeQuery(undefined);
  const categoryId = product ? getCategoryId(product.category) : undefined;
  const categoryNode = categoryId
    ? findCategoryById(categoryTree, categoryId)
    : null;

  const variants: LocalVariant[] = useMemo(
    () => product?.variants || [],
    [product?.variants],
  );
  const hasVariants = variants.length > 0;

  const variantSizes = useMemo(() => {
    const sizes = new Set<string>();
    variants.forEach((v) => {
      if (v.size?.trim()) sizes.add(v.size.trim());
    });
    return Array.from(sizes);
  }, [variants]);

  const availableColors = useMemo(() => {
    if (!selectedSize) return [];
    return variants
      .filter((v) => v.size?.trim() === selectedSize && v.color?.trim())
      .map((v) => v.color!.trim())
      .filter((v, i, a) => a.indexOf(v) === i);
  }, [selectedSize, variants]);

  const colorOnlyList = useMemo(() => {
    return variants
      .filter((v) => !v.size?.trim() && v.color?.trim())
      .map((v) => v.color!.trim())
      .filter((v, i, a) => a.indexOf(v) === i);
  }, [variants]);

  const colorsToShow = selectedSize ? availableColors : colorOnlyList;

  const activeVariant = useMemo(() => {
    if (!hasVariants || !selectedColor) return null;
    if (selectedSize) {
      const match = variants.find(
        (v) =>
          v.size?.trim() === selectedSize &&
          v.color?.trim().toLowerCase() === selectedColor.toLowerCase(),
      );
      if (match) return match;
    }
    return (
      variants.find(
        (v) =>
          !v.size?.trim() &&
          v.color?.trim().toLowerCase() === selectedColor.toLowerCase(),
      ) || null
    );
  }, [hasVariants, selectedSize, selectedColor, variants]);

  const displayPrice = activeVariant?.price ?? product?.price ?? 0;
  const displayStock = activeVariant?.stock ?? product?.stock ?? 0;
  const isOutOfStock = displayStock === 0;
  const displayCompareAtPrice: number | undefined =
    activeVariant?.compareAtPrice ?? product?.compareAtPrice ?? undefined;
  const hasSalePrice = !!(
    displayCompareAtPrice && displayCompareAtPrice > displayPrice
  );
  const hasDiscount =
    product?.discount?.percentage && product.discount.percentage > 0;
  const discountPercent = product?.discount?.percentage;

  const isWishlisted = product ? wishlistIds.includes(product._id) : false;

  const { data: reviewsData, isLoading: reviewsLoading } =
    useGetProductReviewsQuery(
      { productId: product?._id, page: 1, limit: 10 },
      { skip: !product },
    );

  // Add current product to recently viewed
  useEffect(() => {
    if (product?._id) addToRecentlyViewed(product._id);
  }, [product?._id, addToRecentlyViewed]);

  // SEO structured data
  const productSchema = useMemo(() => {
    if (!product) return undefined;
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description || product.name,
      image: product.images?.[0] || PLACEHOLDER,
      sku: product.sku,
      brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
      offers: {
        "@type": "Offer",
        price: displayPrice,
        priceCurrency: "NGN",
        availability: isOutOfStock
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
        url: window.location.href,
      },
      ...(product.numberOfReviews && product.numberOfReviews > 0
        ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: product.averageRating || 0,
              reviewCount: product.numberOfReviews,
            },
          }
        : {}),
    };
  }, [product, displayPrice, isOutOfStock]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleWishlistToggle = async () => {
    if (!product) return;
    if (!user) {
      toast.error("Please login to add items to your wishlist");
      return;
    }
    try {
      if (isWishlisted) {
        await removeFromWishlist(product._id).unwrap();
        dispatch(toggleWishlist(product._id));
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist(product._id).unwrap();
        dispatch(toggleWishlist(product._id));
        toast.success("Added to wishlist");
      }
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  const handleAddToCart = () => {
    if (!product || isOutOfStock) {
      toast.error("Out of stock!");
      return;
    }
    const variantInfo = activeVariant
      ? {
          sku: activeVariant.sku,
          color: activeVariant.color,
          size: activeVariant.size,
          compareAtPrice: activeVariant.compareAtPrice,
        }
      : undefined;
    dispatch(
      addToCart({
        _id: product._id,
        name: product.name,
        image: product.images?.[0] || PLACEHOLDER,
        price: displayPrice,
        qty,
        stock: displayStock,
        variant: variantInfo,
      }),
    );
    toast.success(`${product.name} added! 🛒`);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleGoBack = () => {
    if (location.key !== "default") {
      navigate(-1);
    } else {
      navigate("/shop");
    }
  };

  // ─── Review handlers ────────────────────────────────────────────────────────
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product) {
      toast.error("Please login to write a review");
      return;
    }
    if (!reviewComment.trim()) {
      toast.error("Please enter a review comment");
      return;
    }
    try {
      await addReview({
        productId: product._id,
        rating: reviewRating,
        comment: reviewComment,
      }).unwrap();
      toast.success("Review submitted!");
      setReviewComment("");
      setReviewRating(5);
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
  }) => {
    setEditingReviewId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditRating(5);
    setEditComment("");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReviewId || !product) return;
    if (!editComment.trim()) {
      toast.error("Please enter a review comment");
      return;
    }
    try {
      await updateReview({
        productId: product._id,
        reviewId: editingReviewId,
        rating: editRating,
        comment: editComment,
      }).unwrap();
      toast.success("Review updated");
      setEditingReviewId(null);
      setEditRating(5);
      setEditComment("");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : "Failed to update review";
      toast.error(message || "Failed to update review");
    }
  };

  const handleDeleteClick = (reviewId: string) => {
    if (!product) return;
    setDeleteTarget({ reviewId, productId: product._id });
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

  // ══════ LOADING ═══════════════════════════════
  if (isLoading) {
    return (
      <div
        className="min-h-screen px-4 md:px-8 max-w-7xl mx-auto bg-[#FCFAF5] dark:bg-[#0A0A0B]"
        role="status"
        aria-label="Loading product details"
        style={{
          paddingTop: "calc(64px + env(safe-area-inset-top, 0px))",
          paddingBottom: "calc(64px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <span className="sr-only">Loading...</span>
        <div className="h-8 w-24 rounded-xl animate-pulse mb-6 mt-4 bg-gray-200 dark:bg-[#141414]" />
        <div className="grid md:grid-cols-2 gap-8">
          <div className="rounded-3xl animate-pulse aspect-[4/3] bg-gray-200 dark:bg-[#141414]" />
          <div className="space-y-4 pt-2">
            {[20, 75, 50, 100, 80, 70].map((w, i) => (
              <div
                key={i}
                className="h-4 rounded animate-pulse bg-gray-200 dark:bg-[#141414]"
                style={{ width: `${w}%` }}
              />
            ))}
            <div className="h-12 w-44 rounded-xl animate-pulse bg-gray-200 dark:bg-[#141414]" />
            <div className="flex gap-3 pt-2">
              <div className="h-14 w-36 rounded-xl animate-pulse bg-gray-200 dark:bg-[#141414]" />
              <div className="h-14 flex-1 rounded-xl animate-pulse bg-gray-200 dark:bg-[#141414]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════ NOT FOUND ═══════════════════════════════
  if (!product || isError) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-[#FCFAF5] dark:bg-[#0A0A0B]">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-sm text-center rounded-3xl p-10
            bg-[#FCFAF5] dark:bg-[#141414]
            border border-gray-200 dark:border-white/[0.07]
            shadow-lg dark:shadow-[0_40px_90px_rgba(0,0,0,0.6)]"
        >
          <div
            className="absolute top-0 inset-x-0 h-px rounded-t-3xl"
            style={{
              background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
            }}
          />
          <div className="flex justify-center mb-5">
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-4 rounded-full border-2 border-dashed"
                style={{ borderColor: `${ACCENT}28` }}
              />
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: `${ACCENT}12`,
                  boxShadow: `0 0 0 3px ${ACCENT}`,
                }}
              >
                <ImageOff
                  className="w-9 h-9"
                  style={{ color: ACCENT }}
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
          <p
            className="text-[10px] font-extrabold uppercase tracking-[0.22em] mb-2"
            style={{ color: ACCENT }}
          >
            404
          </p>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
            Product Not Found
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-7">
            This product doesn't exist or may have been removed.
          </p>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/")}
            className="w-full py-4 rounded-xl font-black text-white flex items-center justify-center gap-2"
            style={{ background: ACCENT, boxShadow: `0 8px 24px ${ACCENT}44` }}
            aria-label="Go back to store homepage"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to Store
          </motion.button>
        </motion.div>
      </main>
    );
  }

  const categoryName = getCategoryName(product.category);
  const images = product.images?.length ? product.images : [PLACEHOLDER];

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen px-4 md:px-8 max-w-7xl mx-auto bg-[#FCFAF5] dark:bg-[#0A0A0B] focus:outline-none pt-[calc(80px+env(safe-area-inset-top,0px))] md:pt-[calc(96px+env(safe-area-inset-top,0px))] pb-[calc(64px+env(safe-area-inset-bottom,0px))]"
    >
      <SEO
        title={product.name}
        description={`Buy ${product.name} from Sholex. ${product.description || ""}`}
        ogImage={product.images?.[0]}
        ogType="product"
        jsonLd={productSchema}
      />

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 mb-5 overflow-x-auto no-scrollbar pb-1 sm:mt-4 md:mt-6"
      >
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={handleGoBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold
            text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors shrink-0
            bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.08]"
          aria-label="Go back to previous page"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Back</span>
        </motion.button>

        {categoryNode && (
          <div className="flex items-center gap-1.5 text-xs shrink-0">
            <ChevronRight
              className="w-3.5 h-3.5 text-gray-400 dark:text-gray-600"
              aria-hidden="true"
            />
            <Link
              to="/shop"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-semibold transition-colors"
            >
              Shop
            </Link>
            <ChevronRight
              className="w-3.5 h-3.5 text-gray-400 dark:text-gray-600"
              aria-hidden="true"
            />
            <Link
              to={`/shop/${categoryNode.slug}`}
              className="font-semibold transition-colors"
              style={{ color: ACCENT }}
              aria-current="page"
            >
              {categoryNode.name}
            </Link>
          </div>
        )}
      </nav>

      {/* Main grid */}
      <div className="grid md:grid-cols-2 gap-6 md:gap-10 lg:gap-14 items-start">
        {/* Image panel */}
        <section
          aria-label="Product images"
          className="md:sticky md:top-24 space-y-3"
        >
          <div
            className="relative rounded-2xl md:rounded-3xl overflow-hidden
            bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.07]"
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
                  alt={product.name}
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

          {/* Thumbnails */}
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

        {/* Product info */}
        <section aria-label="Product details" className="space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <div
                className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${ACCENT}18` }}
              >
                <Tag
                  className="w-3 h-3"
                  style={{ color: ACCENT }}
                  aria-hidden="true"
                />
              </div>
              <span
                className="text-[10px] font-extrabold uppercase tracking-[0.22em]"
                style={{ color: ACCENT }}
              >
                {categoryName}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white leading-[1.05]">
              {product.name}
            </h1>
          </div>

          {/* Size + Color picker */}
          {hasVariants && (
            <div className="space-y-4">
              {variantSizes.length > 0 && (
                <fieldset className="border-0 m-0 p-0">
                  <legend className="text-xs font-bold text-gray-500 mb-2">
                    Size
                  </legend>
                  <div className="flex gap-2 flex-wrap">
                    {variantSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          setSelectedSize(size === selectedSize ? null : size);
                          setSelectedColor((prev) => {
                            if (size !== selectedSize) {
                              return prev &&
                                variants.some(
                                  (v) =>
                                    v.size?.trim() === size &&
                                    v.color?.trim().toLowerCase() ===
                                      prev.toLowerCase(),
                                )
                                ? prev
                                : null;
                            }
                            return prev;
                          });
                        }}
                        aria-pressed={selectedSize === size}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                          selectedSize === size
                            ? "bg-[#e8622a] text-white border-[#e8622a]"
                            : "bg-gray-100 dark:bg-[#1c1c1c] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/[0.08]"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              {colorsToShow.length > 0 && (
                <fieldset className="border-0 m-0 p-0">
                  <legend className="text-xs font-bold text-gray-500 mb-2">
                    Color: {selectedColor || "None selected"}
                  </legend>
                  <div className="flex gap-3 flex-wrap">
                    {colorsToShow.map((color) => {
                      const hex = getColorHex(color);
                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          aria-label={`Select color ${color}${selectedColor === color ? ", currently selected" : ""}`}
                          aria-pressed={selectedColor === color}
                          className="relative w-10 h-10 rounded-full border-2 transition-all hover:scale-110 focus:outline-none flex items-center justify-center"
                          style={{
                            backgroundColor: hex || "#e5e7eb",
                            borderColor:
                              selectedColor === color
                                ? ACCENT
                                : "rgba(255,255,255,0.15)",
                            boxShadow:
                              selectedColor === color
                                ? `0 0 0 3px ${ACCENT}40`
                                : "none",
                            color:
                              hex &&
                              [
                                "white",
                                "#f5f5f5",
                                "#c0c0c0",
                                "#d4c5a9",
                              ].includes(hex)
                                ? "#111"
                                : "#fff",
                          }}
                        >
                          {!hex && (
                            <span className="text-xs font-black uppercase text-gray-800 dark:text-white">
                              {color.charAt(0)}
                            </span>
                          )}
                          {selectedColor === color && (
                            <span
                              className="absolute inset-0 flex items-center justify-center"
                              aria-hidden="true"
                            >
                              <span className="w-4 h-4 rounded-full bg-white/90 flex items-center justify-center">
                                <Check className="w-3 h-3 text-[#e8622a]" />
                              </span>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              )}
            </div>
          )}

          {/* Price */}
          <div
            className="flex items-baseline gap-3 flex-wrap"
            aria-label="Product pricing"
          >
            <div className="flex items-baseline gap-1">
              <span className="text-gray-600 dark:text-gray-400 text-xl font-bold">
                ₦
              </span>
              <span
                className="text-3xl sm:text-4xl font-black"
                style={{ color: ACCENT }}
              >
                {displayPrice.toLocaleString()}
              </span>
            </div>

            {hasVariants && !activeVariant && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#e8622a]/10 text-[#e8622a] border border-[#e8622a]/25">
                Starting Price
              </span>
            )}

            {activeVariant && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#e8622a]/15 text-[#e8622a] border border-[#e8622a]/30">
                {[activeVariant.size, activeVariant.color]
                  .filter(Boolean)
                  .join(" / ")}{" "}
                Price
              </span>
            )}

            {hasSalePrice && displayCompareAtPrice && (
              <span
                className="text-gray-400 dark:text-gray-500 line-through text-xl font-medium"
                aria-label={`Original price ₦${displayCompareAtPrice.toLocaleString()}`}
              >
                ₦{displayCompareAtPrice.toLocaleString()}
              </span>
            )}
            {hasDiscount && (
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-red-500/20 text-red-400 border border-red-500/30"
                aria-label={`${discountPercent}% discount`}
              >
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2" aria-label="Product tags">
              {product.tags.map((tag: string, idx: number) => (
                <span
                  key={idx}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/5 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {product.description && (
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm md:text-[15px]">
              {product.description}
            </p>
          )}

          {/* Stock status */}
          <div
            className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/[0.07]"
            role="status"
            aria-label={
              isOutOfStock
                ? "Out of stock"
                : `In stock, ${displayStock} units available`
            }
          >
            <div
              className={`w-2 h-2 rounded-full shrink-0 ${isOutOfStock ? "bg-red-500" : "bg-emerald-500"}`}
              aria-hidden="true"
            />
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {isOutOfStock
                ? "Out of Stock"
                : `In Stock — ${displayStock} units left`}
            </span>
          </div>

          {/* Desktop CTA */}
          {!isOutOfStock && (
            <div className="hidden sm:flex items-center gap-3">
              <div
                className="flex items-center rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/[0.09]"
                aria-label="Quantity selector"
              >
                <button
                  onClick={() => qty > 1 && setQty((q) => q - 1)}
                  disabled={qty <= 1}
                  className="w-11 h-12 flex items-center justify-center text-red-400 hover:bg-red-500/10 disabled:opacity-30 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" aria-hidden="true" />
                </button>
                <span
                  className="w-10 text-center text-lg font-black text-gray-900 dark:text-white select-none"
                  aria-live="polite"
                >
                  {qty}
                </span>
                <button
                  onClick={() => qty < displayStock && setQty((q) => q + 1)}
                  disabled={qty >= displayStock}
                  className="w-11 h-12 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-30 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              {/* Wishlist heart button (desktop) */}
              <button
                onClick={handleWishlistToggle}
                className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors ${
                  isWishlisted
                    ? "text-red-500 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20"
                    : "text-gray-400 bg-gray-100 dark:bg-[#1c1c1c] border-gray-200 dark:border-white/[0.09] hover:text-red-400"
                }`}
                aria-label={
                  isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                }
              >
                <Heart
                  className="w-5 h-5"
                  fill={isWishlisted ? "currentColor" : "none"}
                  aria-hidden="true"
                />
              </button>

              <button
                onClick={handleAddToCart}
                className="flex-1 h-12 rounded-xl font-black text-white text-[15px] flex items-center justify-center gap-2.5 transition-all"
                style={{
                  background: added ? "#10b981" : ACCENT,
                  boxShadow: added
                    ? "0 8px 24px rgba(16,185,129,0.35)"
                    : `0 8px 24px ${ACCENT}44`,
                }}
                aria-label={
                  added
                    ? `${product.name} added to cart`
                    : `Add ${product.name} to cart`
                }
              >
                {added ? (
                  <Check className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <ShoppingCart className="w-5 h-5" aria-hidden="true" />
                )}
                {added ? "Added to Cart!" : "Add to Cart"}
              </button>
            </div>
          )}

          {/* Out of stock message */}
          {isOutOfStock && (
            <div
              className="px-5 py-4 rounded-xl border text-sm text-red-400 font-semibold bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20"
              role="alert"
            >
              Currently unavailable. Check back later.
            </div>
          )}

          {/* Meta grid */}
          <div
            className="grid grid-cols-2 gap-2.5 pt-3 border-t border-gray-200 dark:border-white/[0.06]"
            role="list"
            aria-label="Product details"
          >
            {[
              { label: "Category", value: categoryName },
              {
                label: "Unit Price",
                value: `₦${displayPrice.toLocaleString()}`,
              },
              ...(product.brand
                ? [{ label: "Brand", value: product.brand }]
                : []),
              ...(product.sku ? [{ label: "SKU", value: product.sku }] : []),
              ...(hasSalePrice && displayCompareAtPrice
                ? [
                    {
                      label: "Original Price",
                      value: `₦${displayCompareAtPrice.toLocaleString()}`,
                    },
                  ]
                : []),
            ].map((item) => (
              <div
                key={item.label}
                className="p-3 rounded-xl bg-gray-100 dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/[0.07]"
                role="listitem"
              >
                <p className="text-[9px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  {item.label}
                </p>
                <p className="font-bold text-xs truncate text-gray-900 dark:text-white">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Related Products */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <RelatedProducts products={product.relatedProducts as ProductItem[]} />
      )}

      {/* Recently Viewed */}
      <RecentlyViewed recentIds={recentIds} />

      {/* Reviews Section */}
      <section aria-label="Customer reviews" className="mt-10">
        <div className="border-t border-gray-200 dark:border-white/[0.06] pt-8">
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">
            Customer Reviews
          </h2>

          {/* Rating summary */}
          <div className="flex items-center gap-3 mb-6">
            <StarRating rating={product.averageRating || 0} />
            <span className="font-bold text-gray-900 dark:text-white">
              {product.averageRating?.toFixed(1) || "0.0"}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              ({product.numberOfReviews || 0} reviews)
            </span>
          </div>

          {/* Review list */}
          {reviewsLoading ? (
            <p className="text-gray-500">Loading reviews...</p>
          ) : reviewsData?.reviews?.length ? (
            <div className="space-y-4">
              {reviewsData.reviews.map((review) => {
                const isOwner = user && review.user._id === user._id;
                const isEditing = editingReviewId === review._id;
                const canEdit =
                  isOwner &&
                  currentTime - new Date(review.createdAt).getTime() <
                    EDIT_WINDOW_MS;
                return (
                  <div
                    key={review._id}
                    className="border-b border-gray-200 dark:border-white/[0.06] pb-4"
                  >
                    {isEditing ? (
                      <form onSubmit={handleSaveEdit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                            Your Rating
                          </label>
                          <StarRating
                            rating={editRating}
                            interactive
                            onChange={setEditRating}
                            size={24}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`edit-comment-${review._id}`}
                            className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1"
                          >
                            Your Review
                          </label>
                          <textarea
                            id={`edit-comment-${review._id}`}
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            placeholder="Update your review..."
                            required
                            rows={4}
                            maxLength={MAX_REVIEW_LENGTH}
                            className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-[#1c1c1c] text-gray-900 dark:text-white resize-none"
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            {editComment.length}/{MAX_REVIEW_LENGTH}
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            type="submit"
                            disabled={updatingReview}
                            className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#e8622a] disabled:opacity-50"
                          >
                            {updatingReview ? "Saving..." : "Save Changes"}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-6 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/[0.08]"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
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
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                          {isOwner && (
                            <div className="flex gap-2">
                              {canEdit && (
                                <button
                                  onClick={() => handleStartEdit(review)}
                                  className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1"
                                >
                                  <Pencil className="w-3 h-3" /> Edit
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteClick(review._id)}
                                className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">
              No reviews yet. Be the first to review this product!
            </p>
          )}

          {/* Add review form */}
          {user ? (
            <form onSubmit={handleSubmitReview} className="mt-8 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Your Rating
                </label>
                <StarRating
                  rating={reviewRating}
                  interactive
                  onChange={setReviewRating}
                  size={24}
                />
              </div>
              <div>
                <label
                  htmlFor="review-comment"
                  className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1"
                >
                  Your Review
                </label>
                <textarea
                  id="review-comment"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience..."
                  required
                  rows={4}
                  maxLength={MAX_REVIEW_LENGTH}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-[#1c1c1c] text-gray-900 dark:text-white resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {reviewComment.length}/{MAX_REVIEW_LENGTH}
                </p>
              </div>
              <button
                type="submit"
                disabled={addingReview}
                className="px-6 py-3 rounded-xl font-bold text-white bg-[#e8622a] disabled:opacity-50"
              >
                {addingReview ? "Submitting..." : "Submit Review"}
              </button>
            </form>
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
      </section>

      {/* Mobile sticky CTA */}
      <AnimatePresence>
        {!isOutOfStock && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="fixed inset-x-0 z-40 sm:hidden"
            style={{
              bottom: "calc(64px + env(safe-area-inset-bottom, 0px))",
            }}
          >
            <div className="bg-[#FCFAF5] dark:bg-[#0A0A0B] px-4 pb-3 pt-2 border-t border-gray-200 dark:border-white/[0.07]">
              <div className="flex gap-2.5">
                {/* Wishlist heart button (mobile) */}
                <button
                  onClick={handleWishlistToggle}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                    isWishlisted
                      ? "text-red-500 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20"
                      : "text-gray-400 bg-white dark:bg-[#141414] border-gray-200 dark:border-white/[0.1]"
                  }`}
                  aria-label={
                    isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                  }
                >
                  <Heart
                    className="w-5 h-5"
                    fill={isWishlisted ? "currentColor" : "none"}
                    aria-hidden="true"
                  />
                </button>

                <div
                  className="flex items-center rounded-xl overflow-hidden shrink-0 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.1]"
                  aria-label="Quantity selector"
                >
                  <button
                    onClick={() => qty > 1 && setQty((q) => q - 1)}
                    disabled={qty <= 1}
                    className="w-10 h-12 flex items-center justify-center text-red-400 disabled:opacity-30 active:bg-red-500/10 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <span
                    className="w-8 text-center text-base font-black text-gray-900 dark:text-white select-none"
                    aria-live="polite"
                  >
                    {qty}
                  </span>
                  <button
                    onClick={() => qty < displayStock && setQty((q) => q + 1)}
                    disabled={qty >= displayStock}
                    className="w-10 h-12 flex items-center justify-center text-emerald-400 disabled:opacity-30 active:bg-emerald-500/10 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 h-12 rounded-xl font-black text-white text-sm flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: added ? "#10b981" : ACCENT,
                    boxShadow: added
                      ? "0 6px 20px rgba(16,185,129,0.35)"
                      : `0 6px 20px ${ACCENT}44`,
                  }}
                  aria-label={
                    added
                      ? `${product.name} added to cart`
                      : `Add ${product.name} to cart for ₦${displayPrice.toLocaleString()}`
                  }
                >
                  {added ? (
                    <Check className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <ShoppingCart className="w-4 h-4" aria-hidden="true" />
                  )}
                  {added
                    ? "Added!"
                    : `Add to Cart · ₦${displayPrice.toLocaleString()}`}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation modal */}
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
    </main>
  );
};

export default ProductDetail;