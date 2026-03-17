export function SkeletonCard() {
  return (
    <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-5 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="w-24 h-4 bg-white/[0.05] rounded" />
        <div className="w-8 h-8 rounded-xl bg-white/[0.05]" />
      </div>
      <div className="w-32 h-8 bg-white/[0.05] rounded mb-2" />
      <div className="w-16 h-4 bg-white/[0.05] rounded" />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-6 animate-pulse">
      <div className="w-48 h-5 bg-white/[0.05] rounded mb-2" />
      <div className="w-64 h-4 bg-white/[0.05] rounded mb-8" />
      <div className="w-full h-[280px] bg-white/[0.03] rounded-xl" />
    </div>
  );
}

export function SkeletonList() {
  return (
    <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-6 animate-pulse">
      <div className="w-40 h-5 bg-white/[0.05] rounded mb-6" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 border border-white/[0.02] rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-white/[0.05]" />
            <div className="flex-1 space-y-2">
              <div className="w-full h-4 bg-white/[0.05] rounded" />
              <div className="w-2/3 h-3 bg-white/[0.05] rounded" />
            </div>
            <div className="w-16 h-6 bg-white/[0.05] rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
