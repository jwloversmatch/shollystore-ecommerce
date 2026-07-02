// frontend/src/components/Skeletons.tsx

// import { motion } from 'framer-motion';

// ---------- Helper: shimmer gradient ----------
const shimmer = 'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-pulse';

// ---------- Product Card Skeleton ----------
export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
    <div className={`w-full aspect-[4/3] ${shimmer}`} />
    <div className="p-4 space-y-3">
      <div className={`h-4 w-3/4 rounded-lg ${shimmer}`} />
      <div className={`h-6 w-1/2 rounded-lg ${shimmer}`} />
      <div className={`h-10 w-full rounded-xl ${shimmer}`} />
    </div>
  </div>
);

// ---------- Product List Skeleton (for admin table) ----------
export const ProductRowSkeleton = () => (
  <div className="flex items-center gap-4 px-6 py-3 border-b border-gray-100">
    <div className={`w-12 h-12 rounded-lg ${shimmer} shrink-0`} />
    <div className="flex-1 space-y-2">
      <div className={`h-4 w-1/3 rounded ${shimmer}`} />
      <div className={`h-3 w-1/4 rounded ${shimmer}`} />
    </div>
    <div className={`h-4 w-16 rounded ${shimmer}`} />
    <div className="flex items-center gap-2">
      <div className={`h-6 w-8 rounded ${shimmer}`} />
      <div className={`h-4 w-6 rounded ${shimmer}`} />
      <div className={`h-6 w-8 rounded ${shimmer}`} />
    </div>
  </div>
);

// ---------- Order Row Skeleton (admin / account) ----------
export const OrderRowSkeleton = () => (
  <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-100">
    <div className="space-y-2 flex-1">
      <div className={`h-4 w-1/3 rounded ${shimmer}`} />
      <div className={`h-3 w-1/4 rounded ${shimmer}`} />
    </div>
    <div className={`h-5 w-20 rounded-full ${shimmer}`} />
  </div>
);

// ---------- Stats Card Skeleton ----------
export const StatsCardSkeleton = () => (
  <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl ${shimmer}`} />
    <div className="space-y-2 flex-1">
      <div className={`h-3 w-1/2 rounded ${shimmer}`} />
      <div className={`h-5 w-1/3 rounded ${shimmer}`} />
    </div>
  </div>
);

// ---------- Category Card Skeleton ----------
export const CategoryCardSkeleton = () => (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-5 flex flex-col items-center gap-2">
    <div className={`w-12 h-12 rounded-full ${shimmer}`} />
    <div className={`h-4 w-16 rounded ${shimmer}`} />
  </div>
);

// ---------- Hero Slide Row Skeleton ----------
export const HeroSlideRowSkeleton = () => (
  <div className="flex items-center gap-6 px-6 py-4 border-b border-gray-100">
    <div className={`w-16 h-16 rounded-lg ${shimmer} shrink-0`} />
    <div className="flex-1 space-y-2">
      <div className={`h-4 w-1/3 rounded ${shimmer}`} />
      <div className={`h-3 w-1/4 rounded ${shimmer}`} />
    </div>
    <div className={`h-6 w-16 rounded-full ${shimmer}`} />
    <div className={`h-4 w-8 rounded ${shimmer}`} />
    <div className="flex gap-1">
      <div className={`w-8 h-8 rounded-lg ${shimmer}`} />
      <div className={`w-8 h-8 rounded-lg ${shimmer}`} />
      <div className={`w-8 h-8 rounded-lg ${shimmer}`} />
    </div>
  </div>
);

// ---------- Cart Item Skeleton ----------
export const CartItemSkeleton = () => (
  <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4">
    <div className={`w-20 h-20 rounded-xl ${shimmer} shrink-0`} />
    <div className="flex-1 space-y-2">
      <div className={`h-5 w-3/4 rounded ${shimmer}`} />
      <div className={`h-4 w-1/4 rounded ${shimmer}`} />
    </div>
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-full ${shimmer}`} />
      <div className={`w-6 h-6 rounded ${shimmer}`} />
      <div className={`w-8 h-8 rounded-full ${shimmer}`} />
      <div className={`w-16 h-8 rounded-lg ${shimmer}`} />
    </div>
  </div>
);

// ---------- Generic Table Row (user management) ----------
export const TableRowSkeleton = ({ cols = 4 }: { cols?: number }) => (
  <div className="flex items-center gap-4 px-6 py-3 border-b border-gray-100">
    {Array.from({ length: cols }).map((_, i) => (
      <div key={i} className={`h-4 w-24 rounded ${shimmer}`} />
    ))}
  </div>
);