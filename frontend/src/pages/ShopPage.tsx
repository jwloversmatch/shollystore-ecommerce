import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, Home } from "lucide-react";
import { useGetProductsQuery, useGetCategoryTreeQuery } from "../features/api/apiSlice";
import ProductCard from "../components/ProductCard";
import { ACCENT, PLACEHOLDER } from "../types/home";
import type { ProductItem } from "../types/home";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface CategoryNode {
  _id: string;
  name: string;
  slug: string;
  children?: CategoryNode[];
}

// Safely extract category name from product
const getCategoryName = (p: ProductItem): string =>
  typeof p.category === "string" ? p.category : p.category?.name ?? "General";

// Find a category node by slug path from a tree
const findCategoryByPath = (
  tree: CategoryNode[],
  slugs: string[]
): CategoryNode | null => {
  if (!slugs.length) return null;
  const [currentSlug, ...rest] = slugs;
  for (const node of tree) {
    if (node.slug === currentSlug) {
      if (rest.length === 0) return node;
      if (node.children) {
        const found = findCategoryByPath(node.children, rest);
        if (found) return found;
      }
    }
  }
  return null;
};

const ShopPage = () => {
  const { "*": pathParam } = useParams<{ "*": string }>();
  const navigate = useNavigate();

  // Memoize slugs to avoid new array on every render
  const slugs = useMemo(
    () => (pathParam ? pathParam.split("/").filter(Boolean) : []),
    [pathParam]
  );

  // Fetch category tree (pass undefined as the argument to satisfy the hook signature)
  const { data: tree = [] } = useGetCategoryTreeQuery(undefined);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 12;

  // Current category node based on the path
  const currentCategory = useMemo(
    () => (tree.length ? findCategoryByPath(tree, slugs) : null),
    [tree, slugs]
  );

  // All ancestors (breadcrumb)
  const breadcrumbs = useMemo(() => {
    if (!currentCategory) return [];
    const crumbs: { name: string; path: string }[] = [];
    const currentSlugs: string[] = [];
    for (const slug of slugs) {
      currentSlugs.push(slug);
      const node = findCategoryByPath(tree, currentSlugs);
      if (node) {
        crumbs.push({
          name: node.name,
          path: `/shop/${currentSlugs.join("/")}`,
        });
      }
    }
    return crumbs;
  }, [currentCategory, slugs, tree]);

  // Child categories of current node (or root if no node)
  const childCategories = useMemo<CategoryNode[]>(
    () => (currentCategory?.children || tree),
    [currentCategory, tree]
  );

  // Category ID for product query
  const categoryId = currentCategory?._id || undefined;

  const { data, isLoading } = useGetProductsQuery({
    ...(categoryId ? { category: categoryId, includeSubcategories: true } : {}),
    page,
    limit,
  });

  const products: ProductItem[] = data?.products ?? [];
  const pagination = data?.pagination ?? { page: 1, pages: 1, total: 0 };

  // Client‑side search filter
  const filtered = search
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  // Reset page when path changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
    setSearch("");
  }, [slugs]);

  // When a child category card is clicked, navigate deeper
  const handleChildClick = (child: CategoryNode) => {
    const base = slugs.join("/");
    const newPath = base ? `/shop/${base}/${child.slug}` : `/shop/${child.slug}`;
    navigate(newPath);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-20 md:pt-24 pb-16 px-4 md:px-6 max-w-7xl mx-auto"
      style={{ background: "#0A0A0B" }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] mb-1" style={{ color: ACCENT }}>
            {currentCategory ? currentCategory.name : "All Categories"}
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-white">
            {currentCategory ? currentCategory.name : "Shop"}
          </h1>
          <p className="text-gray-600 text-sm mt-1">{pagination.total} products available</p>
        </div>

        <div className="flex gap-3 w-full md:w-auto items-center">
          {/* Search */}
          <div className="relative flex-1 md:flex-none md:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1c1c1c] border border-white/[0.08] text-white placeholder-gray-600 outline-none text-sm focus:border-[#e8622a]/50 transition-colors"
            />
          </div>

          {/* Quick jump to root */}
          {slugs.length > 0 && (
            <Link
              to="/shop"
              className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-white transition-colors bg-[#1c1c1c] border border-white/[0.08]"
            >
              <Home className="w-4 h-4" /> All
            </Link>
          )}
        </div>
      </div>

      {/* Breadcrumbs */}
      {slugs.length > 0 && (
        <div className="flex items-center gap-2 mb-5 text-sm flex-wrap">
          <Link
            to="/shop"
            className="text-gray-500 hover:text-white transition-colors font-bold"
          >
            Shop
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <span key={crumb.path} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-gray-600" />
              <Link
                to={crumb.path}
                className={`font-bold transition-colors ${
                  idx === breadcrumbs.length - 1
                    ? "text-white"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                {crumb.name}
              </Link>
            </span>
          ))}
        </div>
      )}

      {/* Child categories (grid of cards) */}
      {childCategories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-white font-black text-lg mb-4">
            {currentCategory ? `${currentCategory.name} – Subcategories` : "Categories"}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {childCategories.map((child) => (
              <button
                key={child._id}
                onClick={() => handleChildClick(child)}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/10 bg-[#1c1c1c] hover:border-[#e8622a]/40 transition-colors"
              >
                <span className="text-gray-400 font-bold text-sm">{child.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl animate-pulse bg-[#141414]" />
          ))}
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map(product => (
              <motion.div
                key={product._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <ProductCard
                  _id={product._id}
                  name={product.name}
                  price={product.price}
                  image={product.images?.[0] || PLACEHOLDER}
                  category={getCategoryName(product)}
                  stock={product.stock}
                  onClick={() => window.location.href = `/products/${product.slug || product._id}`}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-10">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-xl border border-white/10 disabled:opacity-30 hover:bg-white/5 transition"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <span className="text-sm text-gray-400">{page} / {pagination.pages}</span>
          <button
            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="p-2 rounded-xl border border-white/10 disabled:opacity-30 hover:bg-white/5 transition"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default ShopPage;