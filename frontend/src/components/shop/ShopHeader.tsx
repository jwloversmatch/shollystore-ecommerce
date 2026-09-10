import { Home } from "lucide-react";
import { ACCENT } from "../../types/home";

interface ShopHeaderProps {
  categoryName: string | null;
  totalProducts: number;
  showResetButton: boolean;
  onReset: () => void;
}

const ShopHeader = ({
  categoryName,
  totalProducts,
  showResetButton,
  onReset,
}: ShopHeaderProps) => (
  <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
    <div>
      <p
        className="text-xs font-black uppercase tracking-[0.2em] mb-1"
        style={{ color: ACCENT }}
      >
        {categoryName || "All Categories"}
      </p>
      <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
        {categoryName || "Shop"}
      </h1>
      <p
        className="text-gray-500 dark:text-gray-400 text-sm mt-1"
        aria-live="polite"
      >
        {totalProducts} product{totalProducts !== 1 ? "s" : ""} available
      </p>
    </div>

    {showResetButton && (
      <button
        onClick={onReset}
        className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-white dark:bg-[#1F2123] border border-gray-200 dark:border-white/[0.08]"
        aria-label="Show all categories"
      >
        <Home className="w-4 h-4" aria-hidden="true" /> All Categories
      </button>
    )}
  </header>
);

export default ShopHeader;
