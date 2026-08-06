import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { dashboardCard } from "@/lib/dashboard-ui";

export function ProductTableSkeleton() {
  return (
    <div className={cn(dashboardCard, "overflow-hidden")}>
      <div className="flex items-center justify-between border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-7 w-56 rounded-md" />
      </div>
      <div className="hidden md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/[0.05] text-left text-[10px] uppercase tracking-[0.06em] text-neutral-400 dark:border-white/10">
              <th className="px-4 py-2.5 font-medium">Product</th>
              <th className="px-4 py-2.5 font-medium">Type</th>
              <th className="px-4 py-2.5 font-medium">Price</th>
              <th className="px-4 py-2.5 font-medium">Inventory</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="w-12 px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr
                key={i}
                className="border-b border-black/[0.04] last:border-0 dark:border-white/5"
              >
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 shrink-0 rounded-md" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3.5 w-36" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <Skeleton className="h-5 w-20 rounded-md" />
                </td>
                <td className="px-4 py-2.5">
                  <Skeleton className="h-3.5 w-14" />
                </td>
                <td className="px-4 py-2.5">
                  <Skeleton className="h-3.5 w-16" />
                </td>
                <td className="px-4 py-2.5">
                  <Skeleton className="h-5 w-14 rounded-md" />
                </td>
                <td className="px-4 py-2.5">
                  <Skeleton className="h-7 w-7 rounded-md" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="divide-y divide-black/[0.04] dark:divide-white/5 md:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-3">
            <Skeleton className="h-12 w-12 shrink-0 rounded-md" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-36" />
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
