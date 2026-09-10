import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { ACCENT } from "./constants";

interface CategoryNode {
  _id: string;
  name: string;
  slug: string;
}

interface ProductBreadcrumbProps {
  categoryNode: CategoryNode | null;
  onGoBack: () => void;
}

const ProductBreadcrumb = ({ categoryNode, onGoBack }: ProductBreadcrumbProps) => (
  <nav
    aria-label="Breadcrumb"
    className="flex items-center gap-2 mb-5 overflow-x-auto no-scrollbar pb-1 sm:mt-4 md:mt-6"
  >
    <motion.button
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      onClick={onGoBack}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold
        text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors shrink-0
        bg-white dark:bg-[#17181A] border border-gray-200 dark:border-white/[0.08]"
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
);

export default ProductBreadcrumb;
