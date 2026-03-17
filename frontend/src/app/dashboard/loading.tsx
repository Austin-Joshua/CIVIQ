export default function Loading() {
  return (
    <div className="w-full h-full min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-6">
      {/* Animated Core */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        <div className="absolute w-4 h-4 bg-emerald-500 rounded-full animate-ping opacity-20" />
      </div>
      
      {/* Loading Text */}
      <div className="text-center space-y-2">
        <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em] animate-pulse">
          Synthesizing Data
        </h3>
        <p className="text-xs text-white/40">
          Loading urban intelligence vectors...
        </p>
      </div>

      {/* Progress Bar Mock */}
      <div className="w-48 h-1 bg-white/[0.05] rounded-full overflow-hidden">
        <div className="w-full h-full bg-emerald-500 origin-left animate-[scale-x_2s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}
