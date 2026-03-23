export function SkeletonProductCard() {
  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden border animate-pulse"
      style={{ backgroundColor: '#111111', borderColor: '#262626' }}
    >
      {/* Image skeleton */}
      <div className="aspect-[4/3]" style={{ backgroundColor: '#1a1a1a' }} />

      {/* Info skeleton */}
      <div className="p-4 flex flex-col gap-3">
        {/* Creator */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full" style={{ backgroundColor: '#262626' }} />
          <div className="h-3 w-20 rounded" style={{ backgroundColor: '#262626' }} />
        </div>
        {/* Title */}
        <div className="h-4 w-3/4 rounded" style={{ backgroundColor: '#262626' }} />
        {/* Price */}
        <div className="flex justify-between">
          <div className="h-4 w-16 rounded" style={{ backgroundColor: '#262626' }} />
          <div className="h-3 w-10 rounded" style={{ backgroundColor: '#262626' }} />
        </div>
      </div>
    </div>
  );
}
