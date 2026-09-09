import { useNavigate } from "react-router-dom";
import SEO from "../components/SEO";
import ProductQuickViewModal from "../components/ProductQuickViewModal";
import { useShopCatalog } from "../hooks/useShopCatalog";
import { useShopSeo } from "../hooks/useShopSeo";
import ShopSearchSortBar from "../components/shop/ShopSearchSortBar";
import ShopHeader from "../components/shop/ShopHeader";
import ShopBreadcrumb from "../components/shop/ShopBreadcrumb";
import CategoryChips from "../components/shop/CategoryChips";
import ActiveFiltersBar from "../components/shop/ActiveFiltersBar";
import ProductGridSkeleton from "../components/shop/ProductGridSkeleton";
import EmptyProductsState from "../components/shop/EmptyProductsState";
import ProductGrid from "../components/shop/ProductGrid";
import ShopPagination from "../components/shop/ShopPagination";
import { SITE_CONFIG } from "../config/site";
import type { ProductItem } from "../types/home";

const SHOP_OG_IMAGE = `${SITE_CONFIG.url}/shop-banner.jpg`;

const ShopPage = () => {
  const navigate = useNavigate();
  const catalog = useShopCatalog();
  const { seoTitle, seoDescription, canonicalUrl, shopSchema } = useShopSeo(
    catalog.currentNode,
    catalog.debouncedSearch,
    catalog.selectedPath,
    catalog.products,
    catalog.breadcrumbs,
  );

  const handleProductClick = (product: ProductItem) =>
    navigate(`/products/${product.slug || product._id}`);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-[#FCFAF5] dark:bg-[#0A0A0B] pb-28 md:pb-16 focus:outline-none"
      style={{
        paddingTop: "calc(96px + env(safe-area-inset-top, 0px))",
        paddingBottom: "calc(64px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonicalUrl={canonicalUrl}
        ogImage={SHOP_OG_IMAGE}
        keywords={[catalog.currentNode?.name, "shop", "products", "buy online"]
          .filter(Boolean)
          .join(", ")}
        jsonLd={shopSchema}
      />

      <ShopSearchSortBar
        search={catalog.search}
        onSearchChange={catalog.setSearch}
        onSearchClear={catalog.clearSearch}
        categoryId={catalog.categoryId}
        hasActiveFilters={catalog.hasActiveFilters}
        onClearFilters={catalog.clearAllFilters}
        sortBy={catalog.sortBy}
        onSortChange={catalog.setSortBy}
        sortOptions={catalog.SORT_OPTIONS}
      />

      {/* Page content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <ShopHeader
          categoryName={catalog.currentNode?.name ?? null}
          totalProducts={catalog.pagination.total}
          showResetButton={catalog.selectedPath.length > 0}
          onReset={() => catalog.handleChipClick(null)}
        />

        <ShopBreadcrumb
          breadcrumbs={catalog.breadcrumbs}
          onCrumbClick={catalog.handleChipClick}
        />

        <CategoryChips
          categoryName={catalog.currentNode?.name ?? null}
          childCategories={catalog.childCategories}
          isAllActive={catalog.selectedPath.length === 0}
          activeChildId={
            catalog.selectedPath[catalog.selectedPath.length - 1] ?? null
          }
          onSelect={catalog.handleChipClick}
        />

        {catalog.hasActiveFilters && (
          <ActiveFiltersBar
            showCategory={catalog.selectedPath.length > 0}
            categoryName={catalog.currentNode?.name}
            onRemoveCategory={() => catalog.setSelectedPath([])}
            searchTerm={catalog.debouncedSearch}
            onRemoveSearch={catalog.clearSearch}
          />
        )}

        {/* Products */}
        {catalog.isLoading ? (
          <ProductGridSkeleton />
        ) : catalog.products.length === 0 ? (
          <EmptyProductsState
            onClearFilters={catalog.clearAllFilters}
            isFallbackLoading={catalog.isFallbackLoading}
            fallbackCategoryName={catalog.fallbackCategoryName}
            parentFallbackProducts={catalog.parentFallbackProducts}
            globalFallbackProducts={catalog.globalFallbackProducts}
            onProductClick={handleProductClick}
            onQuickView={catalog.setQuickViewProduct}
          />
        ) : (
          <>
            <ProductGrid
              products={catalog.products}
              onProductClick={handleProductClick}
              onQuickView={catalog.setQuickViewProduct}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
              motionKey={`${catalog.page}-${catalog.categoryId || "all"}-${catalog.debouncedSearch}-${catalog.sortBy}`}
              transitionDuration={0.35}
              ariaLabel="Product list"
            />

            <ShopPagination
              page={catalog.page}
              totalPages={catalog.pagination.pages}
              visiblePages={catalog.visiblePages}
              onPageChange={catalog.handlePageChange}
            />
          </>
        )}
      </div>

      {/* Quick View Modal */}
      <ProductQuickViewModal
        product={catalog.quickViewProduct}
        isOpen={!!catalog.quickViewProduct}
        onClose={() => catalog.setQuickViewProduct(null)}
      />
    </main>
  );
};

export default ShopPage;
