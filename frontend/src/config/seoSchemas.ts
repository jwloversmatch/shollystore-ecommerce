import { SITE_CONFIG, productUrl } from './site';

/** Build Product JSON-LD schema */
export const buildProductSchema = (product: {
  name: string;
  description?: string;
  slug: string;
  price: number;
  images?: string[];
  stock?: number;
  averageRating?: number;
  numberOfReviews?: number;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.description || product.name,
  image: product.images?.length ? product.images : [SITE_CONFIG.ogImage],
  url: productUrl(product.slug),
  offers: {
    '@type': 'Offer',
    price: product.price,
    priceCurrency: 'NGN',
    availability:
      (product.stock ?? 0) > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    url: productUrl(product.slug),
  },
  ...(product.averageRating && product.numberOfReviews
    ? {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.averageRating,
          reviewCount: product.numberOfReviews,
        },
      }
    : {}),
});

/** Build BreadcrumbList JSON-LD */
export const buildBreadcrumbSchema = (
  items: { name: string; url: string }[],
) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

/** Organization + WebSite schemas for root layout */
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_CONFIG.name,
  url: SITE_CONFIG.url,
  logo: `${SITE_CONFIG.url}/logo.png`,
  description: SITE_CONFIG.description,
  sameAs: [
    `https://twitter.com/${SITE_CONFIG.twitter.replace('@', '')}`,
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: SITE_CONFIG.phone,
    contactType: 'customer service',
    areaServed: 'NG',
    availableLanguage: ['English'],
  },
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_CONFIG.name,
  url: SITE_CONFIG.url,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_CONFIG.url}/shop?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};