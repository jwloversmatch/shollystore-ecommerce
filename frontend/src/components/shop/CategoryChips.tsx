import { SlidersHorizontal } from "lucide-react";
import { ACCENT } from "../../types/home";

interface CategoryNode {
  _id: string;
  name: string;
}

interface CategoryChipsProps {
  categoryName: string | null;
  childCategories: CategoryNode[];
  isAllActive: boolean;
  activeChildId: string | null;
  onSelect: (id: string | null) => void;
}

const CategoryChips = ({
  categoryName,
  childCategories,
  isAllActive,
  activeChildId,
  onSelect,
}: CategoryChipsProps) => {
  if (childCategories.length === 0) return null;

  return (
    <section aria-label="Filter by category" className="mb-8">
      <h2 className="font-black text-lg mb-4 text-gray-900 dark:text-white flex items-center gap-2">
        <SlidersHorizontal
          className="w-4 h-4"
          style={{ color: ACCENT }}
          aria-hidden="true"
        />
        {categoryName ? `${categoryName} – Subcategories` : "Categories"}
      </h2>
      <div
        className="flex gap-3 flex-wrap"
        role="group"
        aria-label="Category filters"
      >
        <button
          onClick={() => onSelect(null)}
          className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
            isAllActive
              ? "text-white border-transparent"
              : "text-gray-600 dark:text-gray-400 border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
          }`}
          style={{
            background: isAllActive ? ACCENT : "transparent",
            borderColor: isAllActive ? ACCENT : undefined,
          }}
          aria-pressed={isAllActive}
        >
          All
        </button>
        {childCategories.map((child) => {
          const isActive = activeChildId === child._id;
          return (
            <button
              key={child._id}
              onClick={() => onSelect(child._id)}
              className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                isActive
                  ? "text-white border-transparent"
                  : "text-gray-600 dark:text-gray-400 border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
              }`}
              style={{
                background: isActive ? ACCENT : "transparent",
                borderColor: isActive ? ACCENT : undefined,
              }}
              aria-pressed={isActive}
            >
              {child.name}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryChips;
