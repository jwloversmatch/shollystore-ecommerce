import { ChevronRight } from "lucide-react";
import { ACCENT } from "../../types/home";
import type { Breadcrumb } from "../../hooks/useShopCatalog";

interface ShopBreadcrumbProps {
  breadcrumbs: Breadcrumb[];
  onCrumbClick: (id: string | null) => void;
}

const ShopBreadcrumb = ({ breadcrumbs, onCrumbClick }: ShopBreadcrumbProps) => (
  <nav
    aria-label="Breadcrumb"
    className="flex items-center gap-2 mb-5 text-sm flex-wrap"
  >
    {breadcrumbs.map((crumb, idx) => (
      <span key={crumb.id || "root"} className="flex items-center gap-2">
        {idx > 0 && (
          <ChevronRight
            className="w-4 h-4 text-gray-400 dark:text-gray-600"
            aria-hidden="true"
          />
        )}
        <button
          onClick={() => onCrumbClick(crumb.id)}
          className={`font-bold transition-colors px-3 py-1 rounded-full border ${
            idx === breadcrumbs.length - 1
              ? "text-white border-transparent"
              : "text-gray-600 dark:text-gray-400 border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
          }`}
          style={{
            background: idx === breadcrumbs.length - 1 ? ACCENT : "transparent",
            borderColor: idx === breadcrumbs.length - 1 ? ACCENT : undefined,
          }}
          aria-current={idx === breadcrumbs.length - 1 ? "page" : undefined}
        >
          {crumb.name}
        </button>
      </span>
    ))}
  </nav>
);

export default ShopBreadcrumb;
