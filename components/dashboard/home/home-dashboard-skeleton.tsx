import { homePage } from "./home-ui";

export function HomeDashboardSkeleton() {
  return (
    <div className={homePage}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="premium-skeleton h-24 animate-pulse rounded-2xl" />
        <div className="premium-skeleton h-28 animate-pulse rounded-2xl" />
      </div>

      <div className="premium-skeleton h-40 animate-pulse rounded-2xl" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="premium-skeleton h-[120px] animate-pulse rounded-2xl" />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="premium-skeleton h-[340px] animate-pulse rounded-2xl" />
        <div className="space-y-4">
          <div className="premium-skeleton h-40 animate-pulse rounded-2xl" />
          <div className="premium-skeleton h-40 animate-pulse rounded-2xl" />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="premium-skeleton h-64 animate-pulse rounded-2xl" />
        <div className="premium-skeleton h-64 animate-pulse rounded-2xl" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="premium-skeleton h-52 animate-pulse rounded-2xl" />
        <div className="premium-skeleton h-52 animate-pulse rounded-2xl" />
      </div>
    </div>
  );
}
