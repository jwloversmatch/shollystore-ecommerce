import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, Home } from "lucide-react";
import {
  useGetProductsQuery,
  useGetCategoryTreeQuery,
} from "../features/api/apiSlice";
import ProductCard from "../components/ProductCard";
import { ACCENT, PLACEHOLDER } from "../types/home";
import type { ProductItem } from "../types/home";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CategoryNode {
  _id: string;
  name: string;
  slug: string;
  children?: CategoryNode[];
}

// Helper: find a node by ID anywhere in the tree
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

// Helper: safely extract category name from product
const getCategoryName = (p: ProductItem): string =>
  typeof p.category === "string" ? p.category : p.category?.name ?? "General";

const ShopPage = () => {
  const { data: tree = [] } = useGetCategoryTreeQuery(undefined);

  // ── Navigation state: array of selected category IDs ────────────────
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 12;

  // Current node based on selectedPath
  const currentNode = useMemo<CategoryNode | null>(() => {
    if (selectedPath.length === 0) return null;
    return findNodeById(tree, selectedPath[selectedPath.length - 1]);
  }, [selectedPath, tree]);

  // Children of current node (or root if none selected)
  const childCategories = useMemo<CategoryNode[]>(() => {
    if (selectedPath.length === 0) return tree;
    return currentNode?.children || [];
  }, [currentNode, tree, selectedPath]);

  // Build breadcrumb from selectedPath
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

  // Category ID for product query
  const categoryId = currentNode?._id || undefined;

  const { data, isLoading } = useGetProductsQuery({
    ...(categoryId ? { category: categoryId, includeSubcategories: true } : {}),
    page,
    limit,
  });

  const products: ProductItem[] = data?.products ?? [];
  const pagination = data?.pagination ?? { page: 1, pages: 1, total: 0 };

  const filtered = search
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  // Handle chip click – reset page and search
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
  };

  // Handle search input – reset page
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
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
            {currentNode ? currentNode.name : "All Categories"}
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-white">
            {currentNode ? currentNode.name : "Shop"}
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
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1c1c1c] border border-white/[0.08] text-white placeholder-gray-600 outline-none text-sm focus:border-[#e8622a]/50 transition-colors"
            />
          </div>

          {/* Quick jump to root */}
          {selectedPath.length > 0 && (
            <button
              onClick={() => handleChipClick(null)}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-white transition-colors bg-[#1c1c1c] border border-white/[0.08]"
            >
              <Home className="w-4 h-4" /> All
            </button>
          )}
        </div>
      </div>

      {/* Breadcrumb chips */}
      <div className="flex items-center gap-2 mb-5 text-sm flex-wrap">
        {breadcrumbs.map((crumb, idx) => (
          <span key={crumb.id || "root"} className="flex items-center gap-2">
            {idx > 0 && <ChevronRight className="w-4 h-4 text-gray-600" />}
            <button
              onClick={() => handleChipClick(crumb.id)}
              className={`font-bold transition-colors px-3 py-1 rounded-full border ${
                idx === breadcrumbs.length - 1
                  ? "text-white border-transparent"
                  : "text-gray-500 border-white/10 hover:border-white/20"
              }`}
              style={{
                background:
                  idx === breadcrumbs.length - 1 ? ACCENT : "#1c1c1c",
                borderColor:
                  idx === breadcrumbs.length - 1
                    ? ACCENT
                    : "rgba(255,255,255,0.08)",
              }}
            >
              {crumb.name}
            </button>
          </span>
        ))}
      </div>

      {/* Subcategory chips */}
      {childCategories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-white font-black text-lg mb-4">
            {currentNode ? `${currentNode.name} – Subcategories` : "Categories"}
          </h2>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => handleChipClick(null)}
              className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                selectedPath.length === 0
                  ? "text-white border-transparent"
                  : "text-gray-400 border-white/10 hover:border-white/20"
              }`}
              style={{
                background: selectedPath.length === 0 ? ACCENT : "#1c1c1c",
                borderColor: selectedPath.length === 0 ? ACCENT : "rgba(255,255,255,0.08)",
              }}
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
                      : "text-gray-400 border-white/10 hover:border-white/20"
                  }`}
                  style={{
                    background: isActive ? ACCENT : "#1c1c1c",
                    borderColor: isActive ? ACCENT : "rgba(255,255,255,0.08)",
                  }}
                >
                  {child.name}
                </button>
              );
            })}
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