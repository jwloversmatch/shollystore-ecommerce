import { useMemo } from "react";
import { SITE, productUrl } from "../config/site";
import { PLACEHOLDER } from "../types/home";
import type { ProductItem } from "../types/home";
import type { Breadcrumb } from "./useShopCatalog";

// Computed once at module load, not during render.
// Gives Google a reasonable "price valid until" date without
// calling impure functions inside the component.
const PRICE_VALID_UNTIL = new Date(
  Date.now() + 365 * 24 * 60 * 60 * 1000,
)
  .toISOString()
  .split("T")[0];

interface CategoryLike {
  name: string;
}

export function useShopSeo(
  currentNode: CategoryLike | null,
  debouncedSearch: string,
  selectedPath: string[],
  products: ProductItem[],
  breadcrumbs: Breadcrumb[],
  currentPage: number = 1,
) {
  const seoTitle = currentNode
    ? `${currentNode.name} – Shop`
    : debouncedSearch
      ? `Search: "${debouncedSearch}" – Shop`
      : "Shop";

  const seoDescription =
    currentNode?.name ||
    (debouncedSearch
      ? `Browse products matching "${debouncedSearch}"`
      : "Browse our full collection of products");

  // ─── Clean canonical URL ────────────────────────────────────────────────
  // Category always preserved. Page number preserved only when > 1, so
  // paginated pages self-reference instead of all pointing to page 1.
  // Search, sort, and non-category filters are intentionally stripped.
  const canonicalUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedPath.length > 0) {
      params.set("category", selectedPath.join(","));
    }
    if (currentPage > 1) {
      params.set("page", String(currentPage));
    }
    const query = params.toString();
    return `${SITE.url}/shop${query ? `?${query}` : ""}`;
  }, [selectedPath, currentPage]);

  // Search result pages should not be indexed — they generate near-duplicate
  // URLs for every possible query and dilute crawl budget.
  const shouldNoIndex = Boolean(debouncedSearch);

  // ─── Structured data for collection & breadcrumbs ───────────────────────
  const shopSchema = useMemo(() => {
    const breadcrumbItems = breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.id
        ? `${SITE.url}/shop?category=${crumb.id}`
        : `${SITE.url}/shop`,
    }));

    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          name: currentNode ? currentNode.name : "Shop",
          url: canonicalUrl,
          description: seoDescription,
          mainEntity: {
            "@type": "ItemList",
            itemListElement: products.map((product, index) => {
              const productLink = productUrl(product.slug || product._id);

              const productSchema: Record<string, unknown> = {
                "@type": "Product",
                name: product.name,
                image: product.images?.[0] || PLACEHOLDER,
                url: productLink,
                brand: {
                  "@type": "Brand",
                  name: product.brand || "Sholex",
                },
              };

              if (product.sku) {
                productSchema.sku = product.sku;
              }

              if (
                product.averageRating !== undefined &&
                product.numberOfReviews !== undefined &&
                product.numberOfReviews > 0
              ) {
                productSchema.aggregateRating = {
                  "@type": "AggregateRating",
                  ratingValue: product.averageRating,
                  reviewCount: product.numberOfReviews,
                  bestRating: 5,
                  worstRating: 1,
                };
              }

              productSchema.offers = {
                "@type": "Offer",
                url: productLink,
                price: product.price,
                priceCurrency: "NGN",
                priceValidUntil: PRICE_VALID_UNTIL,
                availability:
                  (product.stock ?? 0) > 0
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
                seller: {
                  "@type": "Organization",
                  name: "Sholex",
                },
              };

              return {
                "@type": "ListItem",
                position: index + 1,
                item: productSchema,
              };
            }),
          },
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: breadcrumbItems,
        },
      ],
    };
  }, [currentNode, products, breadcrumbs, seoDescription, canonicalUrl]);

  return {
    seoTitle,
    seoDescription,
    canonicalUrl,
    shopSchema,
    shouldNoIndex,
  };
}