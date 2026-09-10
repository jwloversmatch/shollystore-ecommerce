const ProductDetailSkeleton = () => (
  <div
    className="min-h-screen px-4 md:px-8 max-w-7xl mx-auto bg-[#FCFAF5] dark:bg-[#0F1011]"
    role="status"
    aria-label="Loading product details"
    style={{
      paddingTop: "calc(64px + env(safe-area-inset-top, 0px))",
      paddingBottom: "calc(64px + env(safe-area-inset-bottom, 0px))",
    }}
  >
    <span className="sr-only">Loading...</span>
    <div className="h-8 w-24 rounded-xl animate-pulse mb-6 mt-4 bg-gray-200 dark:bg-[#17181A]" />
    <div className="grid md:grid-cols-2 gap-8">
      <div className="rounded-3xl animate-pulse aspect-[4/3] bg-gray-200 dark:bg-[#17181A]" />
      <div className="space-y-4 pt-2">
        {[20, 75, 50, 100, 80, 70].map((w, i) => (
          <div
            key={i}
            className="h-4 rounded animate-pulse bg-gray-200 dark:bg-[#17181A]"
            style={{ width: `${w}%` }}
          />
        ))}
        <div className="h-12 w-44 rounded-xl animate-pulse bg-gray-200 dark:bg-[#17181A]" />
        <div className="flex gap-3 pt-2">
          <div className="h-14 w-36 rounded-xl animate-pulse bg-gray-200 dark:bg-[#17181A]" />
          <div className="h-14 flex-1 rounded-xl animate-pulse bg-gray-200 dark:bg-[#17181A]" />
        </div>
      </div>
    </div>
  </div>
);

export default ProductDetailSkeleton;
