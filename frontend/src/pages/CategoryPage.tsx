import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useGetProductsQuery, useGetCategoriesQuery } from "../features/api/apiSlice";
import ProductCard from "../components/ProductCard";
import { ACCENT, PLACEHOLDER } from "../types/home";
import type { ProductItem, CategoryItem } from "../types/home";

const getCategoryName = (p: ProductItem) =>
  typeof p.category === "string" ? p.category : p.category?.name ?? "General";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: categories } = useGetCategoriesQuery({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 12;

  const category = categories?.find((c: CategoryItem) => c.slug === slug);
  const categoryId = category?._id;

  const { data, isLoading } = useGetProductsQuery(
    categoryId ? { category: categoryId, includeSubcategories: true, page, limit } : { page, limit },
    { skip: !slug }
  );

  const products: ProductItem[] = data?.products ?? [];
  const pagination = data?.pagination ?? { page: 1, pages: 1, total: 0 };

  const filtered = search
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  // Reset page and search when slug changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
    setSearch("");
  }, [slug]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pt-20 md:pt-24 pb-16 px-4 md:px-6 max-w-7xl mx-auto" style={{ background: "#0A0A0B" }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] mb-1" style={{ color: ACCENT }}>Category</p>
          <h1 className="text-3xl md:text-4xl font-black text-white">{category?.name || "All Products"}</h1>
          <p className="text-gray-600 text-sm mt-1">{pagination.total} products found</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1c1c1c] border border-white/[0.08] text-white placeholder-gray-600 outline-none text-sm focus:border-[#e8622a]/50 transition-colors" />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-64 rounded-2xl animate-pulse bg-[#141414]" />)}
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map(product => (
              <motion.div key={product._id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}>
                <ProductCard _id={product._id} name={product.name} price={product.price} image={product.images?.[0] || PLACEHOLDER} category={getCategoryName(product)} stock={product.stock} onClick={() => window.location.href = `/products/${product.slug || product._id}`} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-10">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-xl border border-white/10 disabled:opacity-30 hover:bg-white/5 transition"><ChevronLeft className="w-5 h-5 text-white" /></button>
          <span className="text-sm text-gray-400">{page} / {pagination.pages}</span>
          <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="p-2 rounded-xl border border-white/10 disabled:opacity-30 hover:bg-white/5 transition"><ChevronRight className="w-5 h-5 text-white" /></button>
        </div>
      )}
    </motion.div>
  );
};

export default CategoryPage;