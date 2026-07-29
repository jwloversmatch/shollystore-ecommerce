import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ChevronLeft, ChevronRight, Home, SlidersHorizontal,
  X, Package, ArrowUpDown,
} from "lucide-react";
import {
  useGetProductsQuery,
  useGetCategoryTreeQuery,
} from "../features/api/apiSlice";
import ProductCard from "../components/ProductCard";
import { ACCENT, PLACEHOLDER } from "../types/home";
import type { ProductItem } from "../types/home";

// ─── Types ────────────────────────────────────────────────────────────────
interface CategoryNode {
  _id: string;
  name: string;
  slug: string;
  children?: CategoryNode[];
}

const findNodeById = (tree: CategoryNode[], id: string): CategoryNode | null => {
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
  typeof p.category === "string" ? p.category : p.category?.name ?? "General";

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Name: A-Z", value: "name_asc" },
  { label: "Name: Z-A", value: "name_desc" },
];

const ShopPage = () => {
  const navigate = useNavigate();
  const { data: tree = [] } = useGetCategoryTreeQuery(undefined);
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const limit = 12;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timeout);
  }, [search]);

  const currentNode = useMemo<CategoryNode | null>(() => {
    if (selectedPath.length === 0) return null;
    return findNodeById(tree, selectedPath[selectedPath.length - 1]);
  }, [selectedPath, tree]);

  const childCategories = useMemo<CategoryNode[]>(() => {
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

  const { data, isLoading } = useGetProductsQuery({
    ...(categoryId ? { category: categoryId, includeSubcategories: true } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    page,
    limit,
  });

  // ✅ Move rawProducts inside useMemo to satisfy the linter
  const products = useMemo(() => {
    const rawProducts: ProductItem[] = data?.products ?? [];
    const sorted = [...rawProducts];
    switch (sortBy) {
      case "price_asc":  sorted.sort((a, b) => a.price - b.price); break;
      case "price_desc": sorted.sort((a, b) => b.price - a.price); break;
      case "name_asc":   sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "name_desc":  sorted.sort((a, b) => b.name.localeCompare(a.name)); break;
      case "newest":
      default: break;
    }
    return sorted;
  }, [data?.products, sortBy]);

  const pagination = data?.pagination ?? { page: 1, pages: 1, total: 0 };

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
    setPage(1);
    setSearch("");
    setDebouncedSearch("");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const clearAllFilters = () => {
    setSelectedPath([]);
    setSearch("");
    setDebouncedSearch("");
    setSortBy("newest");
    setPage(1);
  };

  const hasActiveFilters = selectedPath.length > 0 || debouncedSearch.length > 0 || sortBy !== "newest";

  return (
    <main id="main-content" className="min-h-screen pt-20 md:pt-24 pb-16 px-4 md:px-6 max-w-7xl mx-auto bg-[#FCFAF5] dark:bg-[#0A0A0B]">
      {/* Sticky top bar */}
      <div className="sticky top-16 md:top-20 z-30 -mx-4 md:-mx-6 px-4 md:px-6 py-3 mb-6
        bg-[#FCFAF5]/90 dark:bg-[#0A0A0B]/90 backdrop-blur-xl
        border-b border-gray-200 dark:border-white/[0.06]">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-72">
            <label htmlFor="shop-search" className="sr-only">Search products</label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-600" aria-hidden="true" />
            <input
              id="shop-search"
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl
                bg-gray-100 dark:bg-[#1c1c1c]
                border border-gray-300 dark:border-white/[0.08]
                text-gray-900 dark:text-white
                placeholder-gray-500 dark:placeholder-gray-600
                outline-none text-sm focus:border-[#e8622a]/50 transition-colors"
            />
            {search && (
              <button
                onClick={() => { setSearch(""); setDebouncedSearch(""); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

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
              <label htmlFor="shop-sort" className="sr-only">Sort products</label>
              <select
                id="shop-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-9 pr-8 py-2.5 rounded-xl text-sm font-bold
                  bg-gray-100 dark:bg-[#1c1c1c]
                  border border-gray-300 dark:border-white/[0.08]
                  text-gray-900 dark:text-white
                  outline-none cursor-pointer focus:border-[#e8622a]/50 transition-colors"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-600 pointer-events-none" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] mb-1" style={{ color: ACCENT }}>
            {currentNode ? currentNode.name : "All Categories"}
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
            {currentNode ? currentNode.name : "Shop"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1" aria-live="polite">
            {pagination.total} product{pagination.total !== 1 ? "s" : ""} available
          </p>
        </div>

        {selectedPath.length > 0 && (
          <button
            onClick={() => handleChipClick(null)}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold
              text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors
              bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/[0.08]"
            aria-label="Show all categories"
          >
            <Home className="w-4 h-4" aria-hidden="true" /> All Categories
          </button>
        )}
      </header>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 mb-5 text-sm flex-wrap">
        {breadcrumbs.map((crumb, idx) => (
          <span key={crumb.id || "root"} className="flex items-center gap-2">
            {idx > 0 && <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-600" aria-hidden="true" />}
            <button
              onClick={() => handleChipClick(crumb.id)}
              className={`font-bold transition-colors px-3 py-1 rounded-full border ${
                idx === breadcrumbs.length - 1
                  ? "text-white border-transparent"
                  : "text-gray-600 dark:text-gray-400 border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
              }`}
              style={{
                background: idx === breadcrumbs.length - 1 ? ACCENT : "transparent",
                borderColor: idx === breadcrumbs.length - 1 ? ACCENT : undefined,
              }}
              aria-current={idx === breadcrumbs.length - 1 ? "page" : undefined}
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
            <SlidersHorizontal className="w-4 h-4" style={{ color: ACCENT }} aria-hidden="true" />
            {currentNode ? `${currentNode.name} – Subcategories` : "Categories"}
          </h2>
          <div className="flex gap-3 flex-wrap" role="group" aria-label="Category filters">
            <button
              onClick={() => handleChipClick(null)}
              className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                selectedPath.length === 0
                  ? "text-white border-transparent"
                  : "text-gray-600 dark:text-gray-400 border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
              }`}
              style={{
                background: selectedPath.length === 0 ? ACCENT : "transparent",
                borderColor: selectedPath.length === 0 ? ACCENT : undefined,
              }}
              aria-pressed={selectedPath.length === 0}
            >
              All
            </button>
            {childCategories.map(child => {
              const isActive = selectedPath[selectedPath.length - 1] === child._id;
              return (
                <button
                  key={child._id}
                  onClick={() => handleChipClick(child._id)}
                  className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                    isActive
                      ? "text-white border-transparent"
                      : "text-gray-600 dark:text-gray-400 border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
                  }`}
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
          <span className="text-gray-500 dark:text-gray-400 font-semibold">Active filters:</span>
          {selectedPath.length > 0 && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#e8622a]/10 text-[#e8622a] border border-[#e8622a]/20">
              Category: {currentNode?.name}
              <button onClick={() => setSelectedPath([])} className="ml-1 hover:text-red-400" aria-label="Remove category filter">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {debouncedSearch && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
              Search: "{debouncedSearch}"
              <button onClick={() => { setSearch(""); setDebouncedSearch(""); }} className="ml-1 hover:text-red-400" aria-label="Remove search filter">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Products */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6" role="status" aria-label="Loading products">
          <span className="sr-only">Loading products...</span>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#141414]">
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
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: `${ACCENT}10` }}>
            <Package className="w-10 h-10" style={{ color: ACCENT }} aria-hidden="true" />
          </div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">No products found</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
            We couldn't find any products matching your criteria. Try adjusting your search or filters.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-6 py-3 rounded-xl font-bold text-white text-sm"
            style={{ background: ACCENT, boxShadow: `0 6px 18px ${ACCENT}44` }}
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6" aria-label="Product list">
            <AnimatePresence mode="popLayout">
              {products.map(product => (
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
                    onClick={() => navigate(`/products/${product.slug || product._id}`)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {pagination.pages > 1 && (
            <nav className="flex justify-center items-center gap-3 mt-10" aria-label="Pagination">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2.5 rounded-xl border border-gray-300 dark:border-white/10 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-white/5 transition text-gray-700 dark:text-white"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              </button>

              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                    pageNum === page
                      ? "text-white shadow-lg"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                  }`}
                  style={pageNum === page ? { background: ACCENT, boxShadow: `0 4px 12px ${ACCENT}44` } : {}}
                  aria-current={pageNum === page ? "page" : undefined}
                  aria-label={`Page ${pageNum}`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
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
    </main>
  );
};

export default ShopPage;