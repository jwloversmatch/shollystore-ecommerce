import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG, productUrl } from '../config/site';

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'product';
  twitterCard?: 'summary_large_image' | 'summary';
  keywords?: string;
  noIndex?: boolean;
  /** Product-specific Open Graph price (NGN) */
  productPrice?: number;
  productAvailability?: 'in stock' | 'out of stock';
}

const SEO = ({
  title,
  description,
  canonicalUrl,
  ogImage,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  keywords,
  noIndex = false,
  productPrice,
  productAvailability,
}: SEOProps) => {
  const siteName = SITE_CONFIG.name;
  const fullTitle = title === siteName ? title : `${title} | ${siteName}`;
  const resolvedOgImage = ogImage || SITE_CONFIG.ogImage;
  const resolvedCanonical = canonicalUrl || SITE_CONFIG.url;

  const trimmedDescription = description.slice(0, 160);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={trimmedDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={noIndex ? 'noindex, follow' : 'index, follow'} />

      <link rel="canonical" href={resolvedCanonical} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={trimmedDescription} />
      <meta property="og:image" content={resolvedOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={SITE_CONFIG.locale} />
      <meta property="og:url" content={resolvedCanonical} />

      {ogType === 'product' && productPrice != null && (
        <>
          <meta property="product:price:amount" content={String(productPrice)} />
          <meta property="product:price:currency" content="NGN" />
          {productAvailability && (
            <meta property="product:availability" content={productAvailability} />
          )}
        </>
      )}

      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={trimmedDescription} />
      <meta name="twitter:image" content={resolvedOgImage} />
      <meta name="twitter:image:alt" content={title} />
      <meta name="twitter:site" content={SITE_CONFIG.twitter} />

      <meta name="author" content={siteName} />
      <meta httpEquiv="content-language" content="en-NG" />
    </Helmet>
  );
};

export default SEO;

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
