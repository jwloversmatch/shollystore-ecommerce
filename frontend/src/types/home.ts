// Shared interfaces and constants for the Home page

export interface ProductItem {
  _id: string;
  name: string;
  price: number;
  images?: string[];
  category?: string | { _id: string; name: string; slug?: string; parent?: string | null };
  stock?: number;
  slug?: string;
  description?: string;
}

export interface HeroSlide {
  _id: string;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  order: number;
  isActive: boolean;
}

export interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
}

export const PLACEHOLDER = "https://via.placeholder.com/600x600?text=No+Image";
export const ACCENT = "#e8622a";

// Animation variants (shared across many home sections)
export const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { delay, duration: 0.6, ease: "easeOut" as const } },
});

export const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};