export function ReportsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="premium-skeleton h-9 w-48 animate-pulse rounded-xl" />
        <div className="flex gap-2 self-end sm:self-auto">
          <div className="premium-skeleton h-8 w-20 animate-pulse rounded-lg" />
          <div className="premium-skeleton h-8 w-20 animate-pulse rounded-lg" />
        </div>
      </div>

      <div className="premium-skeleton h-[108px] animate-pulse rounded-xl" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="premium-skeleton h-[132px] animate-pulse rounded-xl" />
        ))}
      </div>

      <div className="premium-skeleton h-[340px] animate-pulse rounded-xl" />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="premium-skeleton h-64 animate-pulse rounded-xl" />
        <div className="premium-skeleton h-64 animate-pulse rounded-xl" />
      </div>

      <div className="premium-skeleton h-48 animate-pulse rounded-xl" />
    </div>
  );
}
