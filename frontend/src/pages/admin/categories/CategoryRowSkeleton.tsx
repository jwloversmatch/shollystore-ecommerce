import { DarkCardSkeleton } from "../../../components/Skeletons";

const CategoryRowSkeleton = ({ isDark }: { isDark: boolean }) => (
  <DarkCardSkeleton>
    <div className="flex items-center justify-between p-4 md:p-5" role="status" aria-label="Loading category">
      <span className="sr-only">Loading...</span>
      <div className="flex items-center gap-3.5 flex-1">
        <div className="w-11 h-11 rounded-xl shrink-0 animate-pulse" style={{ background: isDark ? "#1c1c1c" : "#e5e7eb" }} />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-32 rounded-lg animate-pulse" style={{ background: isDark ? "#1c1c1c" : "#e5e7eb" }} />
          <div className="flex items-center gap-2">
            <div className="h-3 w-20 rounded-full animate-pulse" style={{ background: isDark ? "#1c1c1c" : "#e5e7eb" }} />
            <div className="h-3 w-24 rounded-full animate-pulse" style={{ background: isDark ? "#1c1c1c" : "#e5e7eb" }} />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-9 h-9 rounded-xl animate-pulse" style={{ background: isDark ? "#1c1c1c" : "#e5e7eb" }} />
        <div className="w-9 h-9 rounded-xl animate-pulse" style={{ background: isDark ? "#1c1c1c" : "#e5e7eb" }} />
      </div>
    </div>
  </DarkCardSkeleton>
);

export default CategoryRowSkeleton;