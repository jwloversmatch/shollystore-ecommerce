import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  SlidersHorizontal,
  X,
  Package,
  ArrowUpDown,
} from "lucide-react";
import {
  useGetProductsQuery,
  useGetCategoryTreeQuery,
  useLazyGetProductsQuery,
} from "../features/api/apiSlice";
import ProductCard from "../components/ProductCard";
import ProductSearchBox from "../components/ProductSearchBox";
import SEO from "../components/SEO";
import { SITE_CONFIG, productUrl } from "../config/site";
import { ACCENT, PLACEHOLDER } from "../types/home";
import type { ProductItem } from "../types/home";

// ─── Types ────────────────────────────────────────────────────────────────
interface CategoryNode {
  _id: string;
  name: string;
  slug: string;
  children?: CategoryNode[];
}

const findNodeById = (
  tree: CategoryNode[],
  id: string,
): CategoryNode | null => {
  for (const node of tree) {
    if (node._id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

const getCategoryName = (p: ProductItem): string =>
  typeof p.category === "string" ? p.category : (p.category?.name ?? "General");

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Name: A-Z", value: "name_asc" },
  { label: "Name: Z-A", value: "name_desc" },
];

// Shop-specific Open Graph image (replace with your actual image URL)
const SHOP_OG_IMAGE = `${SITE_CONFIG.url}/shop-banner.jpg`;

const ShopPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: treeData } = useGetCategoryTreeQuery(undefined);
  const tree: CategoryNode[] = useMemo(
    () => (treeData as CategoryNode[]) || [],
    [treeData],
  );

  // ─── Safe initial state from URL ────────────────────────────────────────
  const initialSearch = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category") || "";
  const initialSelectedPath = categoryParam
    ? categoryParam.split(",").filter((id) => /^[0-9a-fA-F]{24}$/.test(id))
    : [];
  const sortParam = searchParams.get("sort") || "newest";

  const [selectedPath, setSelectedPath] =
    useState<string[]>(initialSelectedPath);
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [sortBy, setSortBy] = useState(sortParam);
  const limit = 12;

  const [getParentFallback, parentResult] = useLazyGetProductsQuery();
  const [getGlobalFallback, globalResult] = useLazyGetProductsQuery();

  const isInitialMount = useRef(true);
  const page = parseInt(searchParams.get("page") || "1") || 1;

  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams);
      if (newPage === 1) {
        params.delete("page");
      } else {
        params.set("page", newPage.toString());
      }
      setSearchParams(params, { replace: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [searchParams, setSearchParams],
  );

  // Debounce search input
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      handlePageChange(1);
    }, 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // ─── Single effect to synchronise search, category, and sort to URL ────
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.delete("search");
    params.delete("category");
    params.delete("sort");

    if (debouncedSearch) params.set("search", debouncedSearch);
    if (selectedPath.length > 0) params.set("category", selectedPath.join(","));
    if (sortBy !== "newest") params.set("sort", sortBy);

    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [debouncedSearch, selectedPath, sortBy, searchParams, setSearchParams]);

  // ─── Derived state and queries ─────────────────────────────────────────
  const currentNode = useMemo<CategoryNode | null>(() => {
    if (selectedPath.length === 0) return null;
    return findNodeById(tree, selectedPath[selectedPath.length - 1]);
  }, [selectedPath, tree]);

  const childCategories: CategoryNode[] = useMemo(() => {
    if (selectedPath.length === 0) return tree;
    return currentNode?.children || [];
  }, [currentNode, tree, selectedPath]);

  const breadcrumbs = useMemo(() => {
    const crumbs: { name: string; id: string | null }[] = [
      { name: "All", id: null },
    ];
    selectedPath.forEach((id) => {
      const node = findNodeById(tree, id);
      if (node) crumbs.push({ name: node.name, id: node._id });
    });
    return crumbs;
  }, [selectedPath, tree]);

  const categoryId = currentNode?._id || undefined;
  const fallbackCategoryId =
    selectedPath.length > 0 ? selectedPath[0] : undefined;
  const fallbackCategoryName = fallbackCategoryId
    ? findNodeById(tree, fallbackCategoryId)?.name
    : undefined;

  const parentFallbackProducts = parentResult.data?.products ?? [];
  const globalFallbackProducts = globalResult.data?.products ?? [];

  const { data, isLoading } = useGetProductsQuery({
    ...(categoryId ? { category: categoryId, includeSubcategories: true } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    page,
    limit,
  });

  const products = useMemo(() => {
    const rawProducts: ProductItem[] = data?.products ?? [];
    const sorted = [...rawProducts];
    switch (sortBy) {
      case "price_asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "name_asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name_desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }
    return sorted;
  }, [data?.products, sortBy]);

  const pagination = data?.pagination ?? { page: 1, pages: 1, total: 0 };

  // Trigger fallback queries when main results are empty
  useEffect(() => {
    if (!isLoading && products.length === 0) {
      if (selectedPath.length > 0) {
        getParentFallback({
          category: fallbackCategoryId,
          includeSubcategories: true,
          limit: 8,
        });
      }
      getGlobalFallback({ featured: true, limit: 8 });
    }
  }, [
    isLoading,
    products.length,
    selectedPath,
    fallbackCategoryId,
    getParentFallback,
    getGlobalFallback,
  ]);

  // ─── Event handlers ─────────────────────────────────────────────────────
  const handleChipClick = (id: string | null) => {
    if (id === null) {
      setSelectedPath([]);
    } else {
      const idx = selectedPath.indexOf(id);
      if (idx !== -1) {
        setSelectedPath(selectedPath.slice(0, idx + 1));
      } else {
        setSelectedPath([...selectedPath, id]);
      }
    }
    handlePageChange(1);
    setSearch("");
    setDebouncedSearch("");
  };

  const clearAllFilters = () => {
    setSelectedPath([]);
    setSearch("");
    setDebouncedSearch("");
    setSortBy("newest");
    handlePageChange(1);
  };

  const hasActiveFilters =
    selectedPath.length > 0 ||
    debouncedSearch.length > 0 ||
    sortBy !== "newest";

  // ─── SEO dynamic title & description ────────────────────────────────────
  const seoTitle = currentNode
    ? `${currentNode.name} – Shop`
    : debouncedSearch
      ? `Search: "${debouncedSearch}" – Shop`
      : "Shop";
  const seoDescription =
    currentNode?.name ||
    (debouncedSearch
      ? `Browse products matching "${debouncedSearch}"`
      : "Browse our full collection of products");

  // ─── Clean canonical URL (only category, no pagination/sort/search) ─────
  const canonicalUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedPath.length > 0) {
      params.set("category", selectedPath.join(","));
    }
    const query = params.toString();
    return `${SITE_CONFIG.url}/shop${query ? `?${query}` : ""}`;
  }, [selectedPath]);

  // ─── Structured data for collection & breadcrumbs ───────────────────────
  const shopSchema = useMemo(() => {
    const breadcrumbItems = breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.id
        ? `${SITE_CONFIG.url}/shop?category=${crumb.id}`
        : `${SITE_CONFIG.url}/shop`,
    }));

    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          name: currentNode ? currentNode.name : "Shop",
          url: canonicalUrl,
          description: seoDescription,
          mainEntity: {
            "@type": "ItemList",
            itemListElement: products.map((product, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "Product",
                name: product.name,
                image: product.images?.[0] || PLACEHOLDER,
                url: productUrl(product.slug || product._id),
                offers: {
                  "@type": "Offer",
                  price: product.price,
                  priceCurrency: "NGN",
                  availability:
                    (product.stock ?? 0) > 0
                      ? "https://schema.org/InStock"
                      : "https://schema.org/OutOfStock",
                },
              },
            })),
          },
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: breadcrumbItems,
        },
      ],
    };
  }, [currentNode, products, breadcrumbs, seoDescription, canonicalUrl]);

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-[#FCFAF5] dark:bg-[#0A0A0B] pb-28 md:pb-16 focus:outline-none"
      style={{
        paddingTop: "calc(96px + env(safe-area-inset-top, 0px))",
        paddingBottom: "calc(64px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonicalUrl={canonicalUrl}
        ogImage={SHOP_OG_IMAGE}
        keywords={[currentNode?.name, "shop", "products", "buy online"]
          .filter(Boolean)
          .join(", ")}
        jsonLd={shopSchema}
      />

      {/* Search + sort bar */}
      <div className="px-4 md:px-6 py-3 mb-6 sm:mt-3 md:mt-4 bg-[#FCFAF5] dark:bg-[#0A0A0B] border-b border-gray-200 dark:border-white/[0.06]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <ProductSearchBox
              id="shop-search"
              value={search}
              onChange={setSearch}
              onClear={() => {
                setSearch("");
                setDebouncedSearch("");
              }}
              categoryId={categoryId}
            />

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20"
                >
                  <X className="w-3 h-3" /> Clear filters
                </button>
              )}

              <div className="relative">
                <label htmlFor="shop-sort" className="sr-only">
                  Sort products
                </label>
                <select
                  id="shop-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-9 pr-8 py-2.5 rounded-xl text-sm font-bold bg-gray-100 dark:bg-[#1c1c1c] border border-gray-300 dark:border-white/[0.08] text-gray-900 dark:text-white outline-none cursor-pointer focus:border-[#e8622a]/50 transition-colors"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ArrowUpDown
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-600 pointer-events-none"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <p
              className="text-xs font-black uppercase tracking-[0.2em] mb-1"
              style={{ color: ACCENT }}
            >
              {currentNode ? currentNode.name : "All Categories"}
            </p>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
              {currentNode ? currentNode.name : "Shop"}
            </h1>
            <p
              className="text-gray-500 dark:text-gray-400 text-sm mt-1"
              aria-live="polite"
            >
              {pagination.total} product{pagination.total !== 1 ? "s" : ""}{" "}
              available
            </p>
          </div>

          {selectedPath.length > 0 && (
            <button
              onClick={() => handleChipClick(null)}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/[0.08]"
              aria-label="Show all categories"
            >
              <Home className="w-4 h-4" aria-hidden="true" /> All Categories
            </button>
          )}
        </header>

        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 mb-5 text-sm flex-wrap"
        >
          {breadcrumbs.map((crumb, idx) => (
            <span key={crumb.id || "root"} className="flex items-center gap-2">
              {idx > 0 && (
                <ChevronRight
                  className="w-4 h-4 text-gray-400 dark:text-gray-600"
                  aria-hidden="true"
                />
              )}
              <button
                onClick={() => handleChipClick(crumb.id)}
                className={`font-bold transition-colors px-3 py-1 rounded-full border ${
                  idx === breadcrumbs.length - 1
                    ? "text-white border-transparent"
                    : "text-gray-600 dark:text-gray-400 border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
                }`}
                style={{
                  background:
                    idx === breadcrumbs.length - 1 ? ACCENT : "transparent",
                  borderColor:
                    idx === breadcrumbs.length - 1 ? ACCENT : undefined,
                }}
                aria-current={
                  idx === breadcrumbs.length - 1 ? "page" : undefined
                }
              >
                {crumb.name}
              </button>
            </span>
          ))}
        </nav>

        {/* Subcategories */}
        {childCategories.length > 0 && (
          <section aria-label="Filter by category" className="mb-8">
            <h2 className="font-black text-lg mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <SlidersHorizontal
                className="w-4 h-4"
                style={{ color: ACCENT }}
                aria-hidden="true"
              />
              {currentNode
                ? `${currentNode.name} – Subcategories`
                : "Categories"}
            </h2>
            <div
              className="flex gap-3 flex-wrap"
              role="group"
              aria-label="Category filters"
            >
              <button
                onClick={() => handleChipClick(null)}
                className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${selectedPath.length === 0 ? "text-white border-transparent" : "text-gray-600 dark:text-gray-400 border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"}`}
                style={{
                  background:
                    selectedPath.length === 0 ? ACCENT : "transparent",
                  borderColor: selectedPath.length === 0 ? ACCENT : undefined,
                }}
                aria-pressed={selectedPath.length === 0}
              >
                All
              </button>
              {childCategories.map((child: CategoryNode) => {
                const isActive =
                  selectedPath[selectedPath.length - 1] === child._id;
                return (
                  <button
                    key={child._id}
                    onClick={() => handleChipClick(child._id)}
                    className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${isActive ? "text-white border-transparent" : "text-gray-600 dark:text-gray-400 border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"}`}
                    style={{
                      background: isActive ? ACCENT : "transparent",
                      borderColor: isActive ? ACCENT : undefined,
                    }}
                    aria-pressed={isActive}
                  >
                    {child.name}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Active filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mb-6 text-sm flex-wrap">
            <span className="text-gray-500 dark:text-gray-400 font-semibold">
              Active filters:
            </span>
            {selectedPath.length > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#e8622a]/10 text-[#e8622a] border border-[#e8622a]/20">
                Category: {currentNode?.name}
                <button
                  onClick={() => setSelectedPath([])}
                  className="ml-1 hover:text-red-400"
                  aria-label="Remove category filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {debouncedSearch && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                Search: "{debouncedSearch}"
                <button
                  onClick={() => {
                    setSearch("");
                    setDebouncedSearch("");
                  }}
                  className="ml-1 hover:text-red-400"
                  aria-label="Remove search filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Products */}
        {isLoading ? (
          <div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            role="status"
            aria-label="Loading products"
            aria-busy="true"
          >
            <span className="sr-only">Loading products...</span>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#141414]"
              >
                <div className="h-48 bg-gray-200 dark:bg-[#1c1c1c] animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-3 w-16 rounded-full bg-gray-200 dark:bg-[#1c1c1c] animate-pulse" />
                  <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-[#1c1c1c] animate-pulse" />
                  <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-[#1c1c1c] animate-pulse" />
                  <div className="flex justify-between items-end pt-2">
                    <div className="h-5 w-20 rounded bg-gray-200 dark:bg-[#1c1c1c] animate-pulse" />
                    <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-[#1c1c1c] animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{ background: `${ACCENT}10` }}
            >
              <Package
                className="w-10 h-10"
                style={{ color: ACCENT }}
                aria-hidden="true"
              />
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">
              No products found
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
              We couldn't find any products in this category. But here are some
              other items you might like.
            </p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-3 rounded-xl font-bold text-white text-sm"
              style={{
                background: ACCENT,
                boxShadow: `0 6px 18px ${ACCENT}44`,
              }}
            >
              Clear all filters
            </button>

            {/* Fallback suggestions */}
            {parentResult.isLoading || globalResult.isLoading ? (
              <div className="mt-12 w-full grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-48 rounded-2xl bg-gray-200 dark:bg-[#1c1c1c] animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <>
                {parentFallbackProducts.length > 0 ? (
                  <div className="mt-12 w-full">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">
                      More in {fallbackCategoryName}
                    </h3>
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="grid grid-cols-2 md:grid-cols-4 gap-4"
                    >
                      {parentFallbackProducts.map((product, i) => (
                        <ProductCard
                          key={product._id}
                          index={i}
                          _id={product._id}
                          name={product.name}
                          price={product.price}
                          image={product.images?.[0] || PLACEHOLDER}
                          category={getCategoryName(product)}
                          stock={product.stock}
                          compareAtPrice={product.compareAtPrice}
                          discountPercent={product.discount?.percentage}
                          onClick={() =>
                            navigate(`/products/${product.slug || product._id}`)
                          }
                          averageRating={product.averageRating}
                          numberOfReviews={product.numberOfReviews}
                        />
                      ))}
                    </motion.div>
                  </div>
                ) : globalFallbackProducts.length > 0 ? (
                  <div className="mt-12 w-full">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">
                      Popular Products
                    </h3>
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="grid grid-cols-2 md:grid-cols-4 gap-4"
                    >
                      {globalFallbackProducts.map((product, i) => (
                        <ProductCard
                          key={product._id}
                          index={i}
                          _id={product._id}
                          name={product.name}
                          price={product.price}
                          image={product.images?.[0] || PLACEHOLDER}
                          category={getCategoryName(product)}
                          stock={product.stock}
                          compareAtPrice={product.compareAtPrice}
                          discountPercent={product.discount?.percentage}
                          onClick={() =>
                            navigate(`/products/${product.slug || product._id}`)
                          }
                          averageRating={product.averageRating}
                          numberOfReviews={product.numberOfReviews}
                        />
                      ))}
                    </motion.div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        ) : (
          <>
            <motion.div
              key={`${page}-${categoryId || "all"}-${debouncedSearch}-${sortBy}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
              aria-label="Product list"
            >
              {products.map((product, i) => (
                <ProductCard
                  key={product._id}
                  index={i}
                  _id={product._id}
                  name={product.name}
                  price={product.price}
                  image={product.images?.[0] || PLACEHOLDER}
                  category={getCategoryName(product)}
                  stock={product.stock}
                  compareAtPrice={product.compareAtPrice}
                  discountPercent={product.discount?.percentage}
                  onClick={() =>
                    navigate(`/products/${product.slug || product._id}`)
                  }
                  averageRating={product.averageRating}
                  numberOfReviews={product.numberOfReviews}
                />
              ))}
            </motion.div>

            {pagination.pages > 1 && (
              <nav
                className="flex justify-center items-center gap-3 mt-10"
                aria-label="Pagination"
              >
                <button
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2.5 rounded-xl border border-gray-300 dark:border-white/10 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-white/5 transition text-gray-700 dark:text-white"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                </button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${pageNum === page ? "text-white shadow-lg" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
                      style={
                        pageNum === page
                          ? {
                              background: ACCENT,
                              boxShadow: `0 4px 12px ${ACCENT}44`,
                            }
                          : {}
                      }
                      aria-current={pageNum === page ? "page" : undefined}
                      aria-label={`Page ${pageNum}`}
                    >
                      {pageNum}
                    </button>
                  ),
                )}
                <button
                  onClick={() =>
                    handlePageChange(Math.min(pagination.pages, page + 1))
                  }
                  disabled={page === pagination.pages}
                  className="p-2.5 rounded-xl border border-gray-300 dark:border-white/10 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-white/5 transition text-gray-700 dark:text-white"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-5 h-5" aria-hidden="true" />
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default ShopPage;