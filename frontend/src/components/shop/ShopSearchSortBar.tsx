import { ArrowUpDown, X } from "lucide-react";
import ProductSearchBox from "../ProductSearchBox";

interface SortOption {
  label: string;
  value: string;
}

interface ShopSearchSortBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
  categoryId?: string;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  sortOptions: SortOption[];
}

const ShopSearchSortBar = ({
  search,
  onSearchChange,
  onSearchClear,
  categoryId,
  hasActiveFilters,
  onClearFilters,
  sortBy,
  onSortChange,
  sortOptions,
}: ShopSearchSortBarProps) => (
  <div className="px-4 md:px-6 py-3 mb-6 sm:mt-3 md:mt-4 bg-[#FCFAF5] dark:bg-[#0A0A0B] border-b border-gray-200 dark:border-white/[0.06]">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <ProductSearchBox
          id="shop-search"
          value={search}
          onChange={onSearchChange}
          onClear={onSearchClear}
          categoryId={categoryId}
        />

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20"
            >
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}

          <div className="relative">
            <label htmlFor="shop-sort" className="sr-only">
              Sort products
            </label>
            <select
              id="shop-sort"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2.5 rounded-xl text-sm font-bold bg-gray-100 dark:bg-[#1c1c1c] border border-gray-300 dark:border-white/[0.08] text-gray-900 dark:text-white outline-none cursor-pointer focus:border-[#e8622a]/50 transition-colors"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ArrowUpDown
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-600 pointer-events-none"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ShopSearchSortBar;
