const ProductGridSkeleton = () => (
  <div
    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
    role="status"
    aria-label="Loading products"
    aria-busy="true"
  >
    <span className="sr-only">Loading products...</span>
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#17181A]"
      >
        <div className="h-48 bg-gray-200 dark:bg-[#1F2123] animate-pulse" />
        <div className="p-4 space-y-3">
          <div className="h-3 w-16 rounded-full bg-gray-200 dark:bg-[#1F2123] animate-pulse" />
          <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-[#1F2123] animate-pulse" />
          <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-[#1F2123] animate-pulse" />
          <div className="flex justify-between items-end pt-2">
            <div className="h-5 w-20 rounded bg-gray-200 dark:bg-[#1F2123] animate-pulse" />
            <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-[#1F2123] animate-pulse" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default ProductGridSkeleton;
