import { ChevronLeft, ChevronRight } from "lucide-react";
import { ACCENT } from "../../types/home";

interface ShopPaginationProps {
  page: number;
  totalPages: number;
  visiblePages: (number | "ellipsis")[];
  onPageChange: (page: number) => void;
}

const ShopPagination = ({
  page,
  totalPages,
  visiblePages,
  onPageChange,
}: ShopPaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <nav
      className="flex justify-center items-center gap-3 mt-10 flex-wrap"
      aria-label="Pagination"
    >
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="p-2.5 rounded-xl border border-gray-300 dark:border-white/10 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-white/5 transition text-gray-700 dark:text-white"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-5 h-5" aria-hidden="true" />
      </button>

      {visiblePages.map((pageItem, idx) => {
        if (pageItem === "ellipsis") {
          return (
            <span
              key={`ellipsis-${idx}`}
              className="px-2 text-gray-500 dark:text-gray-400 select-none"
              aria-hidden="true"
            >
              …
            </span>
          );
        }

        return (
          <button
            key={pageItem}
            onClick={() => onPageChange(pageItem)}
            className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
              pageItem === page
                ? "text-white shadow-lg"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
            }`}
            style={
              pageItem === page
                ? { background: ACCENT, boxShadow: `0 4px 12px ${ACCENT}44` }
                : {}
            }
            aria-current={pageItem === page ? "page" : undefined}
            aria-label={`Page ${pageItem}`}
          >
            {pageItem}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="p-2.5 rounded-xl border border-gray-300 dark:border-white/10 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-white/5 transition text-gray-700 dark:text-white"
        aria-label="Next page"
      >
        <ChevronRight className="w-5 h-5" aria-hidden="true" />
      </button>
    </nav>
  );
};

export default ShopPagination;
