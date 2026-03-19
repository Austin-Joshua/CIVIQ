import { SkeletonCard, SkeletonChart, SkeletonList } from '@/components/ui/Skeletons';

export default function DashboardLoading() {
  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="w-48 h-8 bg-white/[0.05] rounded-lg animate-pulse" />
          <div className="w-72 h-4 bg-white/[0.05] rounded animate-pulse" />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2">
          <SkeletonChart />
        </div>
        <div className="lg:col-span-1">
          <SkeletonList />
        </div>
      </div>
    </div>
  );
}
