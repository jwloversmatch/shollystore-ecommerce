/** Central site configuration — sourced from environment variables */
export const SITE_CONFIG = {
  name: import.meta.env.VITE_SITE_NAME || 'SholexStore',
  url: import.meta.env.VITE_SITE_URL || 'https://iresstore.vercel.app',
  description:
    import.meta.env.VITE_SITE_DESCRIPTION ||
    'Shop the best deals on fashion, beverages, electronics and more. Fast delivery across Nigeria.',
  twitter: import.meta.env.VITE_TWITTER_HANDLE || '@sholexstore',
  ogImage: `${import.meta.env.VITE_SITE_URL || 'https://iresstore.vercel.app'}/og-default.jpg`,
  locale: 'en_NG',
  phone: import.meta.env.VITE_CONTACT_PHONE || '+234-000-000-0000',
} as const;

export const productUrl = (slug: string) => `${SITE_CONFIG.url}/products/${slug}`;
export const shopUrl = (categorySlug?: string) =>
  categorySlug ? `${SITE_CONFIG.url}/shop?category=${categorySlug}` : `${SITE_CONFIG.url}/shop`;
