import { motion } from "framer-motion";
import { ACCENT } from "../../types/home";

interface HomeCategoryBrowserProps {
  categoryList: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  categoryCounts: Record<string, number>;
}

const HomeCategoryBrowser = ({
  categoryList,
  selectedCategory,
  setSelectedCategory,
  categoryCounts,
}: HomeCategoryBrowserProps) => (
  <section className="py-14 md:py-18 bg-[#0A0A0B]">
    <div className="max-w-7xl mx-auto px-4 md:px-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs font-black uppercase tracking-[0.2em] mb-2"
            style={{ color: ACCENT }}
          >
            Browse
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-black text-white"
          >
            Shop by Category
          </motion.h2>
        </div>
        {selectedCategory !== "All" && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setSelectedCategory("All")}
            className="text-sm font-semibold text-gray-500 hover:text-white transition-colors pb-1 border-b border-gray-700"
          >
            Clear filter
          </motion.button>
        )}
      </div>
      <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar -mx-4 px-4">
        {categoryList.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <motion.button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex-shrink-0 relative flex flex-col items-center gap-2 px-5 py-4 rounded-2xl border transition-all min-w-[100px]"
              style={{
                background: active ? ACCENT : "#141414",
                borderColor: active ? ACCENT : "rgba(255,255,255,0.06)",
                boxShadow: active ? `0 8px 24px ${ACCENT}44` : "none",
              }}
            >
              <span className="text-2xl">🍽️</span>
              <span
                className={`text-xs font-bold whitespace-nowrap ${
                  active ? "text-white" : "text-gray-400"
                }`}
              >
                {cat}
              </span>
              {categoryCounts[cat] > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    background: active ? "rgba(255,255,255,0.25)" : ACCENT,
                    color: "white",
                  }}
                >
                  {categoryCounts[cat]}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  </section>
);

export default HomeCategoryBrowser;