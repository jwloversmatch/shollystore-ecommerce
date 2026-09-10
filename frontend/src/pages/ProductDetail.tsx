import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../features/cart/cartSlice";
import { toggleWishlist } from "../features/wishlist/wishlistSlice";
import toast from "react-hot-toast";
import SEO from "../components/SEO";
import RelatedProducts from "../components/RelatedProducts";
import RecentlyViewed from "../components/RecentlyViewed";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import { useProductVariants } from "../hooks/useProductVariants";
import { Tag } from "lucide-react";
import {
  useGetProductBySlugQuery,
  useGetCategoryTreeQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} from "../features/api/apiSlice";
import type { ProductItem } from "../types/home";
import type { RootState } from "../store";

import ProductDetailSkeleton from "../components/product-detail/ProductDetailSkeleton";
import ProductNotFound from "../components/product-detail/ProductNotFound";
import ProductBreadcrumb from "../components/product-detail/ProductBreadcrumb";
import ProductImageGallery from "../components/product-detail/ProductImageGallery";
import ProductVariantPicker from "../components/product-detail/ProductVariantPicker";
import ProductPriceBlock from "../components/product-detail/ProductPriceBlock";
import ProductMetaGrid from "../components/product-detail/ProductMetaGrid";
import DesktopPurchaseBar from "../components/product-detail/DesktopPurchaseBar";
import MobileStickyBar from "../components/product-detail/MobileStickyBar";
import ProductReviews from "../components/product-detail/reviews/ProductReviews";
import { ACCENT, PLACEHOLDER } from "../components/product-detail/constants";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CategoryNode {
  _id: string;
  name: string;
  slug: string;
  children?: CategoryNode[];
}

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

  const { data: product, isLoading, isError } = useGetProductBySlugQuery(slug || "");
  const { data: categoryTree = [] } = useGetCategoryTreeQuery(undefined);

  const variant = useProductVariants(product);

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const categoryId = product ? getCategoryId(product.category) : undefined;
  const categoryNode = categoryId
    ? findCategoryById(categoryTree, categoryId)
    : null;

  const hasDiscount = !!(
    product?.discount?.percentage && product.discount.percentage > 0
  );
  const discountPercent = product?.discount?.percentage;

  const isWishlisted = product ? wishlistIds.includes(product._id) : false;

  const { recentIds, addToRecentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    if (product?._id) addToRecentlyViewed(product._id);
  }, [product?._id, addToRecentlyViewed]);

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
        price: variant.displayPrice,
        priceCurrency: "NGN",
        availability: variant.isOutOfStock
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
  }, [product, variant.displayPrice, variant.isOutOfStock]);

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
    if (!product || variant.isOutOfStock) {
      toast.error("Out of stock!");
      return;
    }
    const variantInfo = variant.activeVariant
      ? {
          sku: variant.activeVariant.sku,
          color: variant.activeVariant.color,
          size: variant.activeVariant.size,
          compareAtPrice: variant.activeVariant.compareAtPrice,
        }
      : undefined;
    dispatch(
      addToCart({
        _id: product._id,
        name: product.name,
        image: product.images?.[0] || PLACEHOLDER,
        price: variant.displayPrice,
        qty,
        stock: variant.displayStock,
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

  const handleDecreaseQty = () => {
    if (qty > 1) setQty((q) => q - 1);
  };
  const handleIncreaseQty = () => {
    if (qty < variant.displayStock) setQty((q) => q + 1);
  };

  // ══════ LOADING / NOT FOUND ═══════════════════════════════
  if (isLoading) return <ProductDetailSkeleton />;
  if (!product || isError) return <ProductNotFound />;

  const categoryName = getCategoryName(product.category);
  const images = product.images?.length ? product.images : [PLACEHOLDER];

  const metaItems = [
    { label: "Category", value: categoryName },
    { label: "Unit Price", value: `₦${variant.displayPrice.toLocaleString()}` },
    ...(product.brand ? [{ label: "Brand", value: product.brand }] : []),
    ...(product.sku ? [{ label: "SKU", value: product.sku }] : []),
    ...(variant.hasSalePrice && variant.displayCompareAtPrice
      ? [
          {
            label: "Original Price",
            value: `₦${variant.displayCompareAtPrice.toLocaleString()}`,
          },
        ]
      : []),
  ];

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen px-4 md:px-8 max-w-7xl mx-auto bg-[#FCFAF5] dark:bg-[#0F1011] focus:outline-none pt-[calc(80px+env(safe-area-inset-top,0px))] md:pt-[calc(96px+env(safe-area-inset-top,0px))] pb-[calc(64px+env(safe-area-inset-bottom,0px))]"
    >
      <SEO
        title={product.name}
        description={`Buy ${product.name} from Sholex. ${product.description || ""}`}
        ogImage={product.images?.[0]}
        ogType="product"
        jsonLd={productSchema}
      />

      <ProductBreadcrumb categoryNode={categoryNode} onGoBack={handleGoBack} />

      {/* Main grid */}
      <div className="grid md:grid-cols-2 gap-6 md:gap-10 lg:gap-14 items-start">
        <ProductImageGallery
          images={images}
          productName={product.name}
          isOutOfStock={variant.isOutOfStock}
        />

        <section aria-label="Product details" className="space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <div
                className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${ACCENT}18` }}
              >
                <Tag className="w-3 h-3" style={{ color: ACCENT }} aria-hidden="true" />
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

          {variant.hasVariants && (
            <ProductVariantPicker
              variantSizes={variant.variantSizes}
              colorsToShow={variant.colorsToShow}
              selectedSize={variant.selectedSize}
              selectedColor={variant.selectedColor}
              onSelectSize={variant.handleSizeSelect}
              onSelectColor={variant.setSelectedColor}
            />
          )}

          <ProductPriceBlock
            displayPrice={variant.displayPrice}
            hasVariants={variant.hasVariants}
            activeVariant={variant.activeVariant}
            hasSalePrice={variant.hasSalePrice}
            displayCompareAtPrice={variant.displayCompareAtPrice}
            hasDiscount={hasDiscount}
            discountPercent={discountPercent}
          />

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

          {product.description && (
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm md:text-[15px]">
              {product.description}
            </p>
          )}

          <div
            className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-[#1F2123] border border-gray-200 dark:border-white/[0.07]"
            role="status"
            aria-label={
              variant.isOutOfStock
                ? "Out of stock"
                : `In stock, ${variant.displayStock} units available`
            }
          >
            <div
              className={`w-2 h-2 rounded-full shrink-0 ${variant.isOutOfStock ? "bg-red-500" : "bg-emerald-500"}`}
              aria-hidden="true"
            />
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {variant.isOutOfStock
                ? "Out of Stock"
                : `In Stock — ${variant.displayStock} units left`}
            </span>
          </div>

          <DesktopPurchaseBar
            isOutOfStock={variant.isOutOfStock}
            qty={qty}
            displayStock={variant.displayStock}
            onDecreaseQty={handleDecreaseQty}
            onIncreaseQty={handleIncreaseQty}
            isWishlisted={isWishlisted}
            onWishlistToggle={handleWishlistToggle}
            added={added}
            onAddToCart={handleAddToCart}
            productName={product.name}
          />

          <ProductMetaGrid items={metaItems} />
        </section>
      </div>

      {/* Related Products */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <RelatedProducts products={product.relatedProducts as ProductItem[]} />
      )}

      {/* Recently Viewed */}
      <RecentlyViewed recentIds={recentIds} currentProductId={product._id} />

      {/* Reviews Section */}
      <ProductReviews
        productId={product._id}
        userId={user?._id}
        isLoggedIn={!!user}
        averageRating={product.averageRating}
        numberOfReviews={product.numberOfReviews}
      />

      {/* Mobile sticky CTA */}
      <MobileStickyBar
        isOutOfStock={variant.isOutOfStock}
        qty={qty}
        displayStock={variant.displayStock}
        displayPrice={variant.displayPrice}
        onDecreaseQty={handleDecreaseQty}
        onIncreaseQty={handleIncreaseQty}
        isWishlisted={isWishlisted}
        onWishlistToggle={handleWishlistToggle}
        added={added}
        onAddToCart={handleAddToCart}
        productName={product.name}
      />
    </main>
  );
};

export default ProductDetail;