import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { dashboardCard } from "@/lib/dashboard-ui";

export function CollectionTableSkeleton() {
  return (
    <div className={cn(dashboardCard, "overflow-hidden")}>
      <div className="flex items-center justify-between border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3 w-36" />
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-7 w-40 rounded-md sm:w-52" />
          <Skeleton className="h-7 w-28 rounded-md" />
        </div>
      </div>

      <div className="divide-y divide-black/[0.04] dark:divide-white/5 md:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-3">
            <Skeleton className="h-11 w-11 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-7 w-7 rounded-md" />
              </div>
              <Skeleton className="h-4 w-14 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-black/[0.05] text-left text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-400 dark:border-white/10">
              <th className="px-4 py-2.5">Collection</th>
              <th className="px-4 py-2.5">Slug</th>
              <th className="px-4 py-2.5">Products</th>
              <th className="px-4 py-2.5">Featured</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr
                key={i}
                className="border-b border-black/[0.04] last:border-0 dark:border-white/5"
              >
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3.5 w-36" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <Skeleton className="h-3 w-24" />
                </td>
                <td className="px-4 py-2.5">
                  <Skeleton className="h-3.5 w-8" />
                </td>
                <td className="px-4 py-2.5">
                  <Skeleton className="h-4 w-14 rounded-md" />
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Skeleton className="ml-auto h-7 w-7 rounded-md" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
