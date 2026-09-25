/** Central site configuration — sourced from environment variables */

export const SITE = {
  name: import.meta.env.VITE_SITE_NAME || "Sholex",
  url: import.meta.env.VITE_SITE_URL || "https://www.sholexstore.com",
  description:
    import.meta.env.VITE_SITE_DESCRIPTION ||
    "Shop the best deals on fashion, beverages, electronics and more. Fast delivery across Nigeria.",
  twitter: import.meta.env.VITE_TWITTER_HANDLE || "@sholexstore",
  twitterCreator: import.meta.env.VITE_TWITTER_CREATOR || "@sholexstore",
  ogImage: `${import.meta.env.VITE_SITE_URL || "https://www.sholexstore.com"}/og-default.jpg`,
  locale: "en_NG",
  phone: import.meta.env.VITE_CONTACT_PHONE || "+234-810-976-7466",
  email: import.meta.env.VITE_CONTACT_EMAIL || "support@sholexstore.com",
} as const;

export const productUrl = (slug: string) => `${SITE.url}/products/${slug}`;

export const shopUrl = (categorySlug?: string) =>
  categorySlug
    ? `${SITE.url}/shop?category=${categorySlug}`
    : `${SITE.url}/shop`;