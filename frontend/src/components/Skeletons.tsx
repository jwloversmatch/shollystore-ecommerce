// frontend/src/components/Skeletons.tsx
import { useTheme } from '../context/ThemeContext';

// ── Shimmer utilities ──────────────────────────────────────────────────────────
const shimmerLight =
  'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-pulse';
const shimmerDark =
  'bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse';

// ── Base skeleton block ─────────────────────────────────────────────────────────
const SkeletonBox = ({
  className = '',
  dark,
}: {
  className?: string;
  dark?: boolean;
}) => {
  const { theme } = useTheme();
  const isDark = dark ?? theme === 'dark';
  return (
    <div className={`rounded-lg ${isDark ? shimmerDark : shimmerLight} ${className}`} />
  );
};

// ── Product Card Skeleton ──────────────────────────────────────────────────────
export const ProductCardSkeleton = ({ dark }: { dark?: boolean }) => {
  const { theme } = useTheme();
  const isDark = dark ?? theme === 'dark';
  return (
    <div
      className={`rounded-2xl shadow-sm border flex flex-col overflow-hidden ${
        isDark ? 'bg-[#141414] border-white/10' : 'bg-white border-gray-100'
      }`}
    >
      <SkeletonBox dark={isDark} className="w-full aspect-[4/3] rounded-none" />
      <div className="p-4 space-y-3">
        <SkeletonBox dark={isDark} className="h-4 w-3/4" />
        <SkeletonBox dark={isDark} className="h-6 w-1/2" />
        <SkeletonBox dark={isDark} className="h-10 w-full" />
      </div>
    </div>
  );
};

// ── Product Row Skeleton (admin table) ─────────────────────────────────────────
export const ProductRowSkeleton = ({ dark }: { dark?: boolean }) => {
  const { theme } = useTheme();
  const isDark = dark ?? theme === 'dark';
  return (
    <div
      className={`flex items-center gap-4 px-6 py-3 border-b ${
        isDark ? 'border-white/5' : 'border-gray-100'
      }`}
    >
      <SkeletonBox dark={isDark} className="w-12 h-12 shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonBox dark={isDark} className="h-4 w-1/3" />
        <SkeletonBox dark={isDark} className="h-3 w-1/4" />
      </div>
      <SkeletonBox dark={isDark} className="h-4 w-16" />
      <div className="flex items-center gap-2">
        <SkeletonBox dark={isDark} className="h-6 w-8" />
        <SkeletonBox dark={isDark} className="h-4 w-6" />
        <SkeletonBox dark={isDark} className="h-6 w-8" />
      </div>
    </div>
  );
};

// ── Order Row Skeleton (admin / account) ───────────────────────────────────────
export const OrderRowSkeleton = ({ dark }: { dark?: boolean }) => {
  const { theme } = useTheme();
  const isDark = dark ?? theme === 'dark';
  return (
    <div
      className={`flex items-center justify-between px-4 sm:px-6 py-3 border-b ${
        isDark ? 'border-white/5' : 'border-gray-100'
      }`}
    >
      <div className="space-y-2 flex-1">
        <SkeletonBox dark={isDark} className="h-4 w-1/3" />
        <SkeletonBox dark={isDark} className="h-3 w-1/4" />
      </div>
      <SkeletonBox dark={isDark} className="h-5 w-20 rounded-full" />
    </div>
  );
};

// ── Stats Card Skeleton ────────────────────────────────────────────────────────
export const StatsCardSkeleton = ({ dark }: { dark?: boolean }) => {
  const { theme } = useTheme();
  const isDark = dark ?? theme === 'dark';
  return (
    <div
      className={`backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 ${
        isDark ? 'bg-[#141414] border border-white/10' : 'bg-white/80'
      }`}
    >
      <SkeletonBox dark={isDark} className="w-12 h-12 rounded-xl" />
      <div className="space-y-2 flex-1">
        <SkeletonBox dark={isDark} className="h-3 w-1/2" />
        <SkeletonBox dark={isDark} className="h-5 w-1/3" />
      </div>
    </div>
  );
};

// ── Chart Skeleton (rectangular area) ──────────────────────────────────────────
export const ChartSkeleton = ({ height = 230, dark }: { height?: number; dark?: boolean }) => {
  const { theme } = useTheme();
  const isDark = dark ?? theme === 'dark';
  return (
    <div className="p-5 flex items-center justify-center" style={{ height }}>
      <div
        className={`w-full h-full rounded-2xl bg-[length:200%_100%] animate-pulse ${
          isDark
            ? 'bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800'
            : 'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200'
        }`}
      />
    </div>
  );
};

// ── Category Card Skeleton ─────────────────────────────────────────────────────
export const CategoryCardSkeleton = ({ dark }: { dark?: boolean }) => {
  const { theme } = useTheme();
  const isDark = dark ?? theme === 'dark';
  return (
    <div
      className={`backdrop-blur-sm rounded-2xl border p-5 flex flex-col items-center gap-2 ${
        isDark ? 'bg-[#141414] border-white/10' : 'bg-white/80 border-gray-100'
      }`}
    >
      <SkeletonBox dark={isDark} className="w-12 h-12 rounded-full" />
      <SkeletonBox dark={isDark} className="h-4 w-16" />
    </div>
  );
};

// ── Hero Slide Row Skeleton ────────────────────────────────────────────────────
export const HeroSlideRowSkeleton = ({ dark }: { dark?: boolean }) => {
  const { theme } = useTheme();
  const isDark = dark ?? theme === 'dark';
  return (
    <div
      className={`flex items-center gap-6 px-6 py-4 border-b ${
        isDark ? 'border-white/5' : 'border-gray-100'
      }`}
    >
      <SkeletonBox dark={isDark} className="w-16 h-16 shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonBox dark={isDark} className="h-4 w-1/3" />
        <SkeletonBox dark={isDark} className="h-3 w-1/4" />
      </div>
      <SkeletonBox dark={isDark} className="h-6 w-16 rounded-full" />
      <SkeletonBox dark={isDark} className="h-4 w-8" />
      <div className="flex gap-1">
        <SkeletonBox dark={isDark} className="w-8 h-8 rounded-lg" />
        <SkeletonBox dark={isDark} className="w-8 h-8 rounded-lg" />
        <SkeletonBox dark={isDark} className="w-8 h-8 rounded-lg" />
      </div>
    </div>
  );
};

// ── Cart Item Skeleton ─────────────────────────────────────────────────────────
export const CartItemSkeleton = ({ dark }: { dark?: boolean }) => {
  const { theme } = useTheme();
  const isDark = dark ?? theme === 'dark';
  return (
    <div
      className={`backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 ${
        isDark ? 'bg-[#141414] border border-white/10' : 'bg-white/80'
      }`}
    >
      <SkeletonBox dark={isDark} className="w-20 h-20 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonBox dark={isDark} className="h-5 w-3/4" />
        <SkeletonBox dark={isDark} className="h-4 w-1/4" />
      </div>
      <div className="flex items-center gap-2">
        <SkeletonBox dark={isDark} className="w-8 h-8 rounded-full" />
        <SkeletonBox dark={isDark} className="w-6 h-6" />
        <SkeletonBox dark={isDark} className="w-8 h-8 rounded-full" />
        <SkeletonBox dark={isDark} className="w-16 h-8 rounded-lg" />
      </div>
    </div>
  );
};

// ── Generic Table Row Skeleton (user management) ───────────────────────────────
export const TableRowSkeleton = ({
  cols = 4,
  dark,
}: {
  cols?: number;
  dark?: boolean;
}) => {
  const { theme } = useTheme();
  const isDark = dark ?? theme === 'dark';
  return (
    <div
      className={`flex items-center gap-4 px-6 py-3 border-b ${
        isDark ? 'border-white/5' : 'border-gray-100'
      }`}
    >
      {Array.from({ length: cols }).map((_, i) => (
        <SkeletonBox key={i} dark={isDark} className="h-4 w-24" />
      ))}
    </div>
  );
};

// ── Card wrapper skeleton (theme-aware) ────────────────────────────────────────
export const DarkCardSkeleton = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <div
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{
        background: isDark ? '#141414' : '#fff',
        border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.08)',
        boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.35)' : '0 4px 16px rgba(0,0,0,0.06)',
      }}
    >
      {children}
    </div>
  );
};