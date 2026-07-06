// frontend/src/components/Skeletons.tsx


// ── Shimmer utilities ──────────────────────────────────────────────────────────
const shimmerLight =
  'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-pulse';
const shimmerDark =
  'bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse';

// ── Base skeleton block (supports light/dark via class) ────────────────────────
const SkeletonBox = ({
  className = '',
  dark = false,
}: {
  className?: string;
  dark?: boolean;
}) => (
  <div
    className={`rounded-lg ${dark ? shimmerDark : shimmerLight} ${className}`}
  />
);

// ── Product Card Skeleton ──────────────────────────────────────────────────────
export const ProductCardSkeleton = ({ dark = false }: { dark?: boolean }) => (
  <div
    className={`rounded-2xl shadow-sm border flex flex-col overflow-hidden ${
      dark
        ? 'bg-[#141414] border-white/10'
        : 'bg-white border-gray-100'
    }`}
  >
    <SkeletonBox dark={dark} className="w-full aspect-[4/3] rounded-none" />
    <div className="p-4 space-y-3">
      <SkeletonBox dark={dark} className="h-4 w-3/4" />
      <SkeletonBox dark={dark} className="h-6 w-1/2" />
      <SkeletonBox dark={dark} className="h-10 w-full" />
    </div>
  </div>
);

// ── Product Row Skeleton (admin table) ─────────────────────────────────────────
export const ProductRowSkeleton = ({ dark = false }: { dark?: boolean }) => (
  <div
    className={`flex items-center gap-4 px-6 py-3 border-b ${
      dark ? 'border-white/5' : 'border-gray-100'
    }`}
  >
    <SkeletonBox dark={dark} className="w-12 h-12 shrink-0" />
    <div className="flex-1 space-y-2">
      <SkeletonBox dark={dark} className="h-4 w-1/3" />
      <SkeletonBox dark={dark} className="h-3 w-1/4" />
    </div>
    <SkeletonBox dark={dark} className="h-4 w-16" />
    <div className="flex items-center gap-2">
      <SkeletonBox dark={dark} className="h-6 w-8" />
      <SkeletonBox dark={dark} className="h-4 w-6" />
      <SkeletonBox dark={dark} className="h-6 w-8" />
    </div>
  </div>
);

// ── Order Row Skeleton (admin / account) ───────────────────────────────────────
export const OrderRowSkeleton = ({ dark = false }: { dark?: boolean }) => (
  <div
    className={`flex items-center justify-between px-4 sm:px-6 py-3 border-b ${
      dark ? 'border-white/5' : 'border-gray-100'
    }`}
  >
    <div className="space-y-2 flex-1">
      <SkeletonBox dark={dark} className="h-4 w-1/3" />
      <SkeletonBox dark={dark} className="h-3 w-1/4" />
    </div>
    <SkeletonBox dark={dark} className="h-5 w-20 rounded-full" />
  </div>
);

// ── Stats Card Skeleton ────────────────────────────────────────────────────────
export const StatsCardSkeleton = ({ dark = false }: { dark?: boolean }) => (
  <div
    className={`backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 ${
      dark ? 'bg-[#141414] border border-white/10' : 'bg-white/80'
    }`}
  >
    <SkeletonBox dark={dark} className="w-12 h-12 rounded-xl" />
    <div className="space-y-2 flex-1">
      <SkeletonBox dark={dark} className="h-3 w-1/2" />
      <SkeletonBox dark={dark} className="h-5 w-1/3" />
    </div>
  </div>
);

// ── Chart Skeleton (rectangular area) ──────────────────────────────────────────
export const ChartSkeleton = ({ height = 230 }: { height?: number }) => (
  <div className="p-5 flex items-center justify-center" style={{ height }}>
    <div className="w-full h-full rounded-2xl bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
  </div>
);

// ── Category Card Skeleton ─────────────────────────────────────────────────────
export const CategoryCardSkeleton = ({ dark = false }: { dark?: boolean }) => (
  <div
    className={`backdrop-blur-sm rounded-2xl border p-5 flex flex-col items-center gap-2 ${
      dark
        ? 'bg-[#141414] border-white/10'
        : 'bg-white/80 border-gray-100'
    }`}
  >
    <SkeletonBox dark={dark} className="w-12 h-12 rounded-full" />
    <SkeletonBox dark={dark} className="h-4 w-16" />
  </div>
);

// ── Hero Slide Row Skeleton ────────────────────────────────────────────────────
export const HeroSlideRowSkeleton = ({ dark = false }: { dark?: boolean }) => (
  <div
    className={`flex items-center gap-6 px-6 py-4 border-b ${
      dark ? 'border-white/5' : 'border-gray-100'
    }`}
  >
    <SkeletonBox dark={dark} className="w-16 h-16 shrink-0" />
    <div className="flex-1 space-y-2">
      <SkeletonBox dark={dark} className="h-4 w-1/3" />
      <SkeletonBox dark={dark} className="h-3 w-1/4" />
    </div>
    <SkeletonBox dark={dark} className="h-6 w-16 rounded-full" />
    <SkeletonBox dark={dark} className="h-4 w-8" />
    <div className="flex gap-1">
      <SkeletonBox dark={dark} className="w-8 h-8 rounded-lg" />
      <SkeletonBox dark={dark} className="w-8 h-8 rounded-lg" />
      <SkeletonBox dark={dark} className="w-8 h-8 rounded-lg" />
    </div>
  </div>
);

// ── Cart Item Skeleton ─────────────────────────────────────────────────────────
export const CartItemSkeleton = ({ dark = false }: { dark?: boolean }) => (
  <div
    className={`backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 ${
      dark ? 'bg-[#141414] border border-white/10' : 'bg-white/80'
    }`}
  >
    <SkeletonBox dark={dark} className="w-20 h-20 rounded-xl shrink-0" />
    <div className="flex-1 space-y-2">
      <SkeletonBox dark={dark} className="h-5 w-3/4" />
      <SkeletonBox dark={dark} className="h-4 w-1/4" />
    </div>
    <div className="flex items-center gap-2">
      <SkeletonBox dark={dark} className="w-8 h-8 rounded-full" />
      <SkeletonBox dark={dark} className="w-6 h-6" />
      <SkeletonBox dark={dark} className="w-8 h-8 rounded-full" />
      <SkeletonBox dark={dark} className="w-16 h-8 rounded-lg" />
    </div>
  </div>
);

// ── Generic Table Row Skeleton (user management) ───────────────────────────────
export const TableRowSkeleton = ({
  cols = 4,
  dark = false,
}: {
  cols?: number;
  dark?: boolean;
}) => (
  <div
    className={`flex items-center gap-4 px-6 py-3 border-b ${
      dark ? 'border-white/5' : 'border-gray-100'
    }`}
  >
    {Array.from({ length: cols }).map((_, i) => (
      <SkeletonBox key={i} dark={dark} className="h-4 w-24" />
    ))}
  </div>
);

// ── Optional: full dark card wrapper (used for consistency) ────────────────────
export const DarkCardSkeleton = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`rounded-2xl overflow-hidden ${className}`}
    style={{
      background: '#141414',
      border: '1px solid rgba(255,255,255,0.07)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
    }}
  >
    {children}
  </div>
);