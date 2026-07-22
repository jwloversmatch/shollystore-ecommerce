import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'product';
  twitterCard?: 'summary_large_image' | 'summary';
  keywords?: string;                     // ✅ new
  noIndex?: boolean;                     // ✅ new
}

const SEO = ({
  title,
  description,
  canonicalUrl,
  ogImage = '/og-default.jpg',          // should be a valid absolute or relative URL
  ogType = 'website',
  twitterCard = 'summary_large_image',
  keywords,
  noIndex = false,
}: SEOProps) => {
  const siteName = 'ShollyStore';       // ✅ updated
  const fullTitle = `${title} | ${siteName}`;

  return (
    <Helmet>
      {/* Basic */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noIndex && <meta name="robots" content="noindex, follow" />}

      {/* Canonical */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_NG" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {/* Optional: add your Twitter handle if you have one */}
      {/* <meta name="twitter:site" content="@shollystore" /> */}
    </Helmet>
  );
};

export default SEO;