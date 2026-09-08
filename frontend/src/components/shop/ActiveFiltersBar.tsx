import { X } from "lucide-react";

interface ActiveFiltersBarProps {
  // Gated on selectedPath.length > 0 rather than categoryName truthiness,
  // to match the original exactly — a stale/invalid category id in the URL
  // would still show this pill (with an empty name) in the original.
  showCategory: boolean;
  categoryName?: string;
  onRemoveCategory: () => void;
  searchTerm: string;
  onRemoveSearch: () => void;
}

const ActiveFiltersBar = ({
  showCategory,
  categoryName,
  onRemoveCategory,
  searchTerm,
  onRemoveSearch,
}: ActiveFiltersBarProps) => (
  <div className="flex items-center gap-2 mb-6 text-sm flex-wrap">
    <span className="text-gray-500 dark:text-gray-400 font-semibold">
      Active filters:
    </span>
    {showCategory && (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#e8622a]/10 text-[#e8622a] border border-[#e8622a]/20">
        Category: {categoryName}
        <button
          onClick={onRemoveCategory}
          className="ml-1 hover:text-red-400"
          aria-label="Remove category filter"
        >
          <X className="w-3 h-3" />
        </button>
      </span>
    )}
    {searchTerm && (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
        Search: "{searchTerm}"
        <button
          onClick={onRemoveSearch}
          className="ml-1 hover:text-red-400"
          aria-label="Remove search filter"
        >
          <X className="w-3 h-3" />
        </button>
      </span>
    )}
  </div>
);

export default ActiveFiltersBar;
