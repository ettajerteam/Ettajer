import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { dashboardCard, dashboardStack } from "@/lib/dashboard-ui";

export function ReportsSkeleton() {
  return (
    <div className={dashboardStack}>
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-9 w-48 rounded-[12px]" />
        <div className="flex gap-1.5 self-end sm:self-auto">
          <Skeleton className="h-7 w-16 rounded-md" />
          <Skeleton className="h-7 w-16 rounded-md" />
        </div>
      </div>

      <div className={cn(dashboardCard, "p-4")}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2.5">
            <Skeleton className="h-8 w-8 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3.5 w-56" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:min-w-[260px]">
            <Skeleton className="h-16 rounded-[10px]" />
            <Skeleton className="h-16 rounded-[10px]" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className={cn(dashboardCard, "px-3.5 py-3")}>
            <Skeleton className="h-3 w-14" />
            <Skeleton className="mt-2 h-5 w-20" />
            <Skeleton className="mt-2 h-3 w-16" />
          </div>
        ))}
      </div>

      <div className={cn(dashboardCard, "p-4")}>
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="mt-2 h-3 w-48" />
        <Skeleton className="mt-4 h-6 w-36" />
        <Skeleton className="mt-4 h-[200px] w-full rounded-md" />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className={cn(dashboardCard, "overflow-hidden")}>
          <div className="border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="mt-2 h-3 w-36" />
          </div>
          <div className="space-y-3 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        </div>
        <div className={cn(dashboardCard, "overflow-hidden")}>
          <div className="border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="mt-2 h-3 w-36" />
          </div>
          <div className="space-y-3 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        </div>
      </div>

      <div className={cn(dashboardCard, "p-4")}>
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="mt-4 h-1.5 w-full rounded-full" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
