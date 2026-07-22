import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ACCENT } from "../../types/home";

interface CategoryEntry {
  name: string;
  slug: string;
  count: number;
}

interface HomeCategoryBrowserProps {
  categories: CategoryEntry[];
}

const HomeCategoryBrowser = ({ categories }: HomeCategoryBrowserProps) => (
  <section className="py-14 md:py-18 bg-[#0A0A0B]">
    <div className="max-w-7xl mx-auto px-4 md:px-6">
      <div className="mb-8">
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

      <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar -mx-4 px-4">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            to={`/category/${cat.slug}`}
            className="flex-shrink-0 relative flex flex-col items-center gap-2 px-5 py-4 rounded-2xl border transition-all min-w-[100px] hover:border-[#e8622a]/50"
            style={{
              background: "#141414",
              borderColor: "rgba(255,255,255,0.06)",
            }}
          >
            <span className="text-2xl">🛍️</span>
            <span className="text-xs font-bold whitespace-nowrap text-gray-400">
              {cat.name}
            </span>
            {cat.count > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: ACCENT, color: "white" }}
              >
                {cat.count}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default HomeCategoryBrowser;