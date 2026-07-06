import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import ProductCard from "../../components/ProductCard";
import { ACCENT, PLACEHOLDER } from "../../types/home";
import type { ProductItem } from "../../types/home";

interface HomeProductGridProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredProducts: ProductItem[];
  categoryList: string[];
  setModalProduct: (product: ProductItem | null) => void;
}

const HomeProductGrid = ({
  selectedCategory,
  setSelectedCategory,
  searchTerm,
  setSearchTerm,
  filteredProducts,
  categoryList,
  setModalProduct,
}: HomeProductGridProps) => (
  <section id="products-grid" className="bg-[#111111] py-14 md:py-18">
    <div className="max-w-7xl mx-auto px-4 md:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <p
            className="text-xs font-black uppercase tracking-[0.2em] mb-1"
            style={{ color: ACCENT }}
          >
            {selectedCategory === "All" ? "All Products" : selectedCategory}
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-white">
            {selectedCategory === "All" ? "Best Sellers" : selectedCategory}
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#1c1c1c] border border-white/8 text-white placeholder-gray-600 rounded-xl outline-none text-sm focus:border-[#e8622a]/50 transition-colors"
              style={{ borderColor: "rgba(255,255,255,0.07)" }}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
            {categoryList.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border"
                style={{
                  background: selectedCategory === cat ? ACCENT : "transparent",
                  color: selectedCategory === cat ? "white" : "#6b7280",
                  borderColor:
                    selectedCategory === cat
                      ? ACCENT
                      : "rgba(255,255,255,0.08)",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        layout
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2 md:gap-x-6 pt-16"
      >
        <AnimatePresence mode="popLayout">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <motion.div
                key={product._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                  transition: { duration: 0.18 },
                }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
              >
                <ProductCard
                  _id={product._id}
                  name={product.name}
                  price={product.price}
                  image={product.images?.[0] || PLACEHOLDER}
                  category={product.category || "General"}
                  stock={product.stock}
                  onClick={() => setModalProduct(product)}
                />
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-24 flex flex-col items-center gap-3 text-gray-600"
            >
              <span className="text-5xl">🔍</span>
              <p className="text-lg font-semibold">No products found</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
                className="text-sm underline hover:text-gray-400 transition-colors"
              >
                Clear filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  </section>
);

export default HomeProductGrid;