import { ProductCardSkeleton } from "../../components/Skeletons";

const HomeLoading = () => (
  <div className="min-h-screen bg-[#0A0A0B] pt-20 pb-16 px-4">
    <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 pt-16">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} dark />
      ))}
    </div>
  </div>
);

export default HomeLoading;