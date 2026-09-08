import { useMemo } from "react";
import { SITE_CONFIG, productUrl } from "../config/site";
import { PLACEHOLDER } from "../types/home";
import type { ProductItem } from "../types/home";
import type { Breadcrumb } from "./useShopCatalog";

interface CategoryLike {
  name: string;
}

export function useShopSeo(
  currentNode: CategoryLike | null,
  debouncedSearch: string,
  selectedPath: string[],
  products: ProductItem[],
  breadcrumbs: Breadcrumb[],
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

  // ─── Clean canonical URL (only category, no pagination/sort/search) ─────
  const canonicalUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedPath.length > 0) {
      params.set("category", selectedPath.join(","));
    }
    const query = params.toString();
    return `${SITE_CONFIG.url}/shop${query ? `?${query}` : ""}`;
  }, [selectedPath]);

  // ─── Structured data for collection & breadcrumbs ───────────────────────
  const shopSchema = useMemo(() => {
    const breadcrumbItems = breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.id
        ? `${SITE_CONFIG.url}/shop?category=${crumb.id}`
        : `${SITE_CONFIG.url}/shop`,
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
            itemListElement: products.map((product, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "Product",
                name: product.name,
                image: product.images?.[0] || PLACEHOLDER,
                url: productUrl(product.slug || product._id),
                offers: {
                  "@type": "Offer",
                  price: product.price,
                  priceCurrency: "NGN",
                  availability:
                    (product.stock ?? 0) > 0
                      ? "https://schema.org/InStock"
                      : "https://schema.org/OutOfStock",
                },
              },
            })),
          },
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: breadcrumbItems,
        },
      ],
    };
  }, [currentNode, products, breadcrumbs, seoDescription, canonicalUrl]);

  return { seoTitle, seoDescription, canonicalUrl, shopSchema };
}
