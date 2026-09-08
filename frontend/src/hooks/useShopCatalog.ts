import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useGetProductsQuery,
  useGetCategoryTreeQuery,
  useLazyGetProductsQuery,
} from "../features/api/apiSlice";
import type { ProductItem } from "../types/home";
import { getVisiblePages } from "../utils/pagination";

export interface CategoryNode {
  _id: string;
  name: string;
  slug: string;
  children?: CategoryNode[];
}

export interface Breadcrumb {
  name: string;
  id: string | null;
}

const findNodeById = (
  tree: CategoryNode[],
  id: string,
): CategoryNode | null => {
  for (const node of tree) {
    if (node._id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

export const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Name: A-Z", value: "name_asc" },
  { label: "Name: Z-A", value: "name_desc" },
];

export function useShopCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: treeData } = useGetCategoryTreeQuery(undefined);
  const tree: CategoryNode[] = useMemo(
    () => (treeData as CategoryNode[]) || [],
    [treeData],
  );

  // ─── Safe initial state from URL ────────────────────────────────────────
  const initialSearch = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category") || "";
  const initialSelectedPath = categoryParam
    ? categoryParam.split(",").filter((id) => /^[0-9a-fA-F]{24}$/.test(id))
    : [];
  const sortParam = searchParams.get("sort") || "newest";

  const [selectedPath, setSelectedPath] =
    useState<string[]>(initialSelectedPath);
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [sortBy, setSortBy] = useState(sortParam);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(
    null,
  );
  const limit = 12;

  const [getParentFallback, parentResult] = useLazyGetProductsQuery();
  const [getGlobalFallback, globalResult] = useLazyGetProductsQuery();

  const isInitialMount = useRef(true);
  const page = parseInt(searchParams.get("page") || "1") || 1;

  // Ref to track previous filter values for change detection
  const prevFilters = useRef({
    selectedPath: initialSelectedPath.join(","),
    debouncedSearch: initialSearch,
    sortBy: sortParam,
  });

  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams);
      if (newPage === 1) {
        params.delete("page");
      } else {
        params.set("page", newPage.toString());
      }
      setSearchParams(params, { replace: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [searchParams, setSearchParams],
  );

  // Clears both the live input and the debounced value used for querying —
  // used wherever search needs to reset immediately, bypassing the debounce.
  const clearSearch = () => {
    setSearch("");
    setDebouncedSearch("");
  };

  // Debounce search input
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      handlePageChange(1);
    }, 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // ─── Single effect to synchronise search, category, and sort to URL ────
  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    // Determine if any filter value changed compared to the last render
    const currentFilters = {
      selectedPath: selectedPath.join(","),
      debouncedSearch,
      sortBy,
    };

    const filtersChanged =
      prevFilters.current.selectedPath !== currentFilters.selectedPath ||
      prevFilters.current.debouncedSearch !== currentFilters.debouncedSearch ||
      prevFilters.current.sortBy !== currentFilters.sortBy;

    if (filtersChanged) {
      // When filters change, reset page to 1 by removing the page param
      params.delete("page");
    }

    // Remove the keys we manage (search, category, sort)
    params.delete("search");
    params.delete("category");
    params.delete("sort");

    if (debouncedSearch) params.set("search", debouncedSearch);
    if (selectedPath.length > 0) params.set("category", selectedPath.join(","));
    if (sortBy !== "newest") params.set("sort", sortBy);

    // Update URL only if something changed
    if (params.toString() !== searchParams.toString() || filtersChanged) {
      setSearchParams(params, { replace: true });
    }

    // Update previous filters ref
    prevFilters.current = currentFilters;
  }, [debouncedSearch, selectedPath, sortBy, searchParams, setSearchParams]);

  // ─── Derived state and queries ─────────────────────────────────────────
  const currentNode = useMemo<CategoryNode | null>(() => {
    if (selectedPath.length === 0) return null;
    return findNodeById(tree, selectedPath[selectedPath.length - 1]);
  }, [selectedPath, tree]);

  const childCategories: CategoryNode[] = useMemo(() => {
    if (selectedPath.length === 0) return tree;
    return currentNode?.children || [];
  }, [currentNode, tree, selectedPath]);

  const breadcrumbs: Breadcrumb[] = useMemo(() => {
    const crumbs: Breadcrumb[] = [{ name: "All", id: null }];
    selectedPath.forEach((id) => {
      const node = findNodeById(tree, id);
      if (node) crumbs.push({ name: node.name, id: node._id });
    });
    return crumbs;
  }, [selectedPath, tree]);

  const categoryId = currentNode?._id || undefined;
  const fallbackCategoryId =
    selectedPath.length > 0 ? selectedPath[0] : undefined;
  const fallbackCategoryName = fallbackCategoryId
    ? findNodeById(tree, fallbackCategoryId)?.name
    : undefined;

  const parentFallbackProducts = parentResult.data?.products ?? [];
  const globalFallbackProducts = globalResult.data?.products ?? [];
  const isFallbackLoading = parentResult.isLoading || globalResult.isLoading;

  const { data, isLoading } = useGetProductsQuery({
    ...(categoryId ? { category: categoryId, includeSubcategories: true } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    page,
    limit,
  });

  const products = useMemo(() => {
    const rawProducts: ProductItem[] = data?.products ?? [];
    const sorted = [...rawProducts];
    switch (sortBy) {
      case "price_asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "name_asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name_desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }
    return sorted;
  }, [data?.products, sortBy]);

  const pagination = data?.pagination ?? { page: 1, pages: 1, total: 0 };

  // Generate visible page numbers with ellipsis
  const visiblePages = useMemo(
    () => getVisiblePages(page, pagination.pages),
    [page, pagination.pages],
  );

  // Trigger fallback queries when main results are empty
  useEffect(() => {
    if (!isLoading && products.length === 0) {
      if (selectedPath.length > 0) {
        getParentFallback({
          category: fallbackCategoryId,
          includeSubcategories: true,
          limit: 8,
        });
      }
      getGlobalFallback({ featured: true, limit: 8 });
    }
  }, [
    isLoading,
    products.length,
    selectedPath,
    fallbackCategoryId,
    getParentFallback,
    getGlobalFallback,
  ]);

  // ─── Event handlers ─────────────────────────────────────────────────────
  const handleChipClick = (id: string | null) => {
    if (id === null) {
      setSelectedPath([]);
    } else {
      const idx = selectedPath.indexOf(id);
      if (idx !== -1) {
        setSelectedPath(selectedPath.slice(0, idx + 1));
      } else {
        setSelectedPath([...selectedPath, id]);
      }
    }
    clearSearch();
  };

  const clearAllFilters = () => {
    setSelectedPath([]);
    clearSearch();
    setSortBy("newest");
  };

  const hasActiveFilters =
    selectedPath.length > 0 ||
    debouncedSearch.length > 0 ||
    sortBy !== "newest";

  return {
    selectedPath,
    setSelectedPath,
    search,
    setSearch,
    debouncedSearch,
    clearSearch,
    sortBy,
    setSortBy,
    quickViewProduct,
    setQuickViewProduct,
    page,
    handlePageChange,
    currentNode,
    childCategories,
    breadcrumbs,
    categoryId,
    fallbackCategoryName,
    parentFallbackProducts,
    globalFallbackProducts,
    isFallbackLoading,
    products,
    isLoading,
    pagination,
    visiblePages,
    handleChipClick,
    clearAllFilters,
    hasActiveFilters,
    SORT_OPTIONS,
  };
}
