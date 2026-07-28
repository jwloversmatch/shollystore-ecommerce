import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'product';
  twitterCard?: 'summary_large_image' | 'summary';
  keywords?: string;
  noIndex?: boolean;
}

const SEO = ({
  title,
  description,
  canonicalUrl,
  ogImage = '/og-default.jpg',
  ogType = 'website',
  twitterCard = 'summary_large_image',
  keywords,
  noIndex = false,
}: SEOProps) => {
  const siteName = 'ShollyStore';
  const fullTitle = `${title} | ${siteName}`;

  return (
    <Helmet>
      {/* Basic */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noIndex && <meta name="robots" content="noindex, follow" />}
      {!noIndex && <meta name="robots" content="index, follow" />}

      {/* Canonical */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_NG" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={title} />
      <meta name="twitter:site" content="@shollystore" />
      <meta name="twitter:creator" content="@shollystore" />

      {/* Additional SEO tags */}
      <meta name="author" content={siteName} />
      <meta name="rating" content="General" />
      <meta name="coverage" content="Worldwide" />
      <meta name="format-detection" content="telephone=no" />
      <meta httpEquiv="content-language" content="en-NG" />
      <meta name="geo.region" content="NG" />
      <meta name="geo.placename" content="Nigeria" />

      {/* Favicon references */}
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <meta name="theme-color" content="#ffffff" />
    </Helmet>
  );
};

export default SEO;

// ── Structured Data component for root layout ────────────────────────────────
export const StructuredData = () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ShollyStore',
    url: 'https://yourdomain.com',
    logo: 'https://yourdomain.com/logo.png',
    description: 'Your store description here',
    sameAs: [
      'https://twitter.com/shollystore',
      'https://instagram.com/shollystore',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+234-000-000-0000',
      contactType: 'customer service',
      areaServed: 'NG',
      availableLanguage: ['English'],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};