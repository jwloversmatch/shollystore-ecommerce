import { useState, useRef, useEffect, useId } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { useGetProductSuggestionsQuery, type ProductSuggestion } from "../features/api/apiSlice";
import { getCloudinaryUrl } from "../utils/cloudinary";
import { ACCENT, PLACEHOLDER } from "../types/home";

interface ProductSearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  id?: string;
  placeholder?: string;
  categoryId?: string;
}

// Bolds the portion of `name` that matches `query`, case-insensitively.
// Falls back to the plain name if there's no direct match (e.g. the
// suggestion matched on a word elsewhere in the name than expected).
const HighlightMatch = ({ name, query }: { name: string; query: string }) => {
  const trimmed = query.trim();
  if (!trimmed) return <>{name}</>;
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const idx = name.search(new RegExp(escaped, "i"));
  if (idx === -1) return <>{name}</>;
  return (
    <>
      {name.slice(0, idx)}
      <strong className="font-black">{name.slice(idx, idx + trimmed.length)}</strong>
      {name.slice(idx + trimmed.length)}
    </>
  );
};

const ProductSearchBox = ({
  value,
  onChange,
  onClear,
  id = "product-search",
  placeholder = "Search products...",
  categoryId,
}: ProductSearchBoxProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [suggestQuery, setSuggestQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  // Suggestions debounce faster than the main results grid (200ms here vs
  // 350ms for the full grid) — a live dropdown should feel closer to
  // instant, since it's a far cheaper query than the paginated grid below.
  useEffect(() => {
    const timeout = setTimeout(() => setSuggestQuery(value.trim()), 200);
    return () => clearTimeout(timeout);
  }, [value]);

  const { data, isFetching } = useGetProductSuggestionsQuery(
    { q: suggestQuery, categoryId },
    { skip: suggestQuery.length < 2 }
  );
  const suggestions = data?.suggestions ?? [];
  const showLoading = isFetching && suggestions.length === 0;
  const showDropdown = isOpen && value.trim().length >= 2;

  // Close on click outside.
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const goToProduct = (slug: string) => {
    setIsOpen(false);
    navigate(`/products/${slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === "Escape") setIsOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      const picked = suggestions[highlightedIndex];
      if (picked?.slug) goToProduct(picked.slug);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full sm:w-72">
      <label htmlFor={id} className="sr-only">Search products</label>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-600 pointer-events-none" aria-hidden="true" />
      <input
        id={id}
        type="search"
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={highlightedIndex >= 0 ? `${listboxId}-option-${highlightedIndex}` : undefined}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
          setHighlightedIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-gray-100 dark:bg-[#1c1c1c] border border-gray-300 dark:border-white/[0.08] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 outline-none text-sm focus:border-[#e8622a]/50 transition-colors"
      />
      {value && (
        <button
          onClick={() => { onClear(); setIsOpen(false); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute z-30 mt-2 w-full rounded-xl border overflow-hidden
              bg-white dark:bg-[#141414] border-gray-200 dark:border-white/[0.08]
              shadow-lg dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            {showLoading ? (
              <p className="px-3 py-3 text-sm text-gray-500 dark:text-gray-500" role="status" aria-live="polite">
                Searching…
              </p>
            ) : suggestions.length === 0 ? (
              <p className="px-3 py-3 text-sm text-gray-500 dark:text-gray-500" role="status" aria-live="polite">
                No matches found
              </p>
            ) : (
              <ul id={listboxId} role="listbox" aria-label="Product suggestions">
                {suggestions.map((product: ProductSuggestion, i: number) => (
                  <li
                    key={product._id}
                    id={`${listboxId}-option-${i}`}
                    role="option"
                    aria-selected={i === highlightedIndex}
                    onMouseEnter={() => setHighlightedIndex(i)}
                    // Keeps the input focused when clicking a suggestion —
                    // without this, mousedown on the li would blur the
                    // input first, and the subsequent click could land on
                    // a dropdown that's already started closing.
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => goToProduct(product.slug)}
                    className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                      i === highlightedIndex ? "bg-gray-100 dark:bg-white/[0.06]" : ""
                    }`}
                  >
                    <img
                      src={getCloudinaryUrl(product.images?.[0] || PLACEHOLDER, 80)}
                      alt=""
                      className="w-9 h-9 rounded-lg object-cover shrink-0 bg-gray-100 dark:bg-[#1c1c1c]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate text-gray-900 dark:text-white">
                        <HighlightMatch name={product.name} query={value} />
                      </p>
                      {typeof product.category === "object" && product.category?.name && (
                        <p className="text-[10px] text-gray-500 dark:text-gray-500 truncate">{product.category.name}</p>
                      )}
                    </div>
                    <span className="text-sm font-bold shrink-0" style={{ color: ACCENT }}>
                      ₦{product.price?.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductSearchBox;