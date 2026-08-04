import { ProductCardSkeleton } from "../../components/Skeletons";
import { useTheme } from "../../context/ThemeContext";

const ShimmerBlock = ({ className = "" }: { className?: string }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div
      className={`rounded-lg bg-[length:200%_100%] animate-pulse ${className} ${
        isDark
          ? "bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800"
          : "bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"
      }`}
    />
  );
};

const HomeLoading = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen pt-14 ${isDark ? "bg-[#0A0A0B]" : "bg-[#FCFAF5]"}`}
      role="status"
      aria-label="Loading homepage"
    >
      <span className="sr-only">Loading...</span>

      {/* ── Hero skeleton ──────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 pt-6 md:pt-14 pb-10 grid md:grid-cols-2 items-center gap-16">
        {/* Left */}
        <div className="space-y-5">
          <ShimmerBlock className="h-8 w-44 rounded-full" />
          <ShimmerBlock className="h-14 w-full" />
          <ShimmerBlock className="h-14 w-3/4" />
          <ShimmerBlock className="h-5 w-full" />
          <ShimmerBlock className="h-5 w-2/3" />
          <div className="flex gap-2.5 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <ShimmerBlock key={i} className="h-9 w-24 rounded-xl" />
            ))}
          </div>
          <div className="flex items-center gap-5 pt-2">
            <ShimmerBlock className="h-14 w-40 rounded-full" />
            <div className="flex gap-1">
              <ShimmerBlock className="w-9 h-9 rounded-full" />
              <ShimmerBlock className="w-9 h-9 rounded-full" />
              <ShimmerBlock className="w-9 h-9 rounded-full" />
              <ShimmerBlock className="w-9 h-9 rounded-full" />
            </div>
          </div>
          <div className="flex gap-4 pt-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <ShimmerBlock key={i} className="h-5 w-24" />
            ))}
          </div>
        </div>
        {/* Right – carousel circle */}
        <div className="flex justify-center">
          <ShimmerBlock className="w-64 h-64 md:w-[380px] md:h-[380px] lg:w-[440px] lg:h-[440px] rounded-full" />
        </div>
      </div>

      {/* ── CTA skeleton ───────────────────────────────────── */}
      <div className={`py-10 flex flex-col items-center gap-4 ${isDark ? "" : "bg-[#FCFAF5]"}`}>
        <ShimmerBlock className="h-8 w-56" />
        <ShimmerBlock className="h-5 w-72" />
        <ShimmerBlock className="h-14 w-48 rounded-full" />
      </div>

      {/* ── Marquee skeleton ───────────────────────────────── */}
      <div className={`py-6 flex gap-3 overflow-hidden px-4 ${isDark ? "" : "bg-[#FCFAF5]"}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <ShimmerBlock key={i} className="h-8 w-32 rounded-full shrink-0" />
        ))}
      </div>

      {/* ── Features skeleton ──────────────────────────────── */}
      <div className={`py-16 ${isDark ? "bg-[#111111]" : "bg-[#FCFAF5]"}`}>
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-2xl p-5 md:p-6 border space-y-3 ${
                isDark
                  ? "bg-[#141414] border-white/5"
                  : "bg-white border-gray-200"
              }`}
            >
              <ShimmerBlock className="w-11 h-11 rounded-xl" />
              <ShimmerBlock className="h-8 w-16" />
              <ShimmerBlock className="h-4 w-20" />
              <ShimmerBlock className="h-3 w-24" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Best Sellers skeleton ──────────────────────────── */}
      <div className={`py-14 ${isDark ? "bg-[#111111]" : "bg-[#FCFAF5]"}`}>
        <div className="max-w-7xl mx-auto px-4">
          <ShimmerBlock className="h-4 w-20 mb-2" />
          <ShimmerBlock className="h-10 w-48 mb-4" />
          <div className="flex gap-3 mb-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <ShimmerBlock key={i} className="h-8 w-20 rounded-full" />
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 pt-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Special Offer skeleton ─────────────────────────── */}
      <div className={`py-14 px-4 ${isDark ? "bg-[#0A0A0B]" : "bg-[#FCFAF5]"}`}>
        <div className="max-w-7xl mx-auto">
          <div
            className="rounded-3xl p-10 md:p-16 flex flex-col items-center text-center gap-4"
            style={{
              background: isDark
                ? "linear-gradient(140deg, #180a00 0%, #0A0A0B 45%, #001509 100%)"
                : "linear-gradient(140deg, #fef3e8 0%, #FCFAF5 45%, #eafaf1 100%)",
            }}
          >
            <ShimmerBlock className="h-8 w-36 rounded-full" />
            <ShimmerBlock className="h-12 w-3/4 max-w-lg" />
            <ShimmerBlock className="h-5 w-2/3 max-w-md" />
            <ShimmerBlock className="h-14 w-40 rounded-full" />
          </div>
        </div>
      </div>

      {/* ── Footer skeleton ────────────────────────────────── */}
      <div className={`border-t py-10 px-4 ${isDark ? "bg-[#0A0A0B] border-white/10" : "bg-[#FCFAF5] border-gray-200"}`}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <ShimmerBlock className="h-6 w-32" />
            <ShimmerBlock className="h-4 w-full" />
            <ShimmerBlock className="h-4 w-3/4" />
            <div className="flex gap-2 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <ShimmerBlock key={i} className="w-9 h-9 rounded-full" />
              ))}
            </div>
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <ShimmerBlock className="h-5 w-24" />
              <ShimmerBlock className="h-4 w-full" />
              <ShimmerBlock className="h-4 w-3/4" />
              <ShimmerBlock className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeLoading;