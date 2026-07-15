import { homePage } from "./home-ui";

export function HomeDashboardSkeleton() {
  return (
    <div className={homePage}>
      <div className="premium-skeleton h-[72px] animate-pulse rounded-xl" />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="premium-skeleton h-[108px] animate-pulse rounded-xl" />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
        <div className="premium-skeleton h-[320px] animate-pulse rounded-xl" />
        <div className="premium-skeleton h-[320px] animate-pulse rounded-xl" />
      </div>

      <div className="premium-skeleton h-56 animate-pulse rounded-xl" />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="premium-skeleton h-48 animate-pulse rounded-xl" />
        <div className="premium-skeleton h-48 animate-pulse rounded-xl" />
      </div>
    </div>
  );
}
