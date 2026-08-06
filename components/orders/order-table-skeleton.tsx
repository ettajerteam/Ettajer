import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { dashboardCard } from "@/lib/dashboard-ui";

export function OrderTableSkeleton() {
  return (
    <div className={cn(dashboardCard, "overflow-hidden")}>
      <div className="flex items-center justify-between border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-48" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/[0.05] text-left text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-400 dark:border-white/10">
              <th className="px-4 py-2.5">Order</th>
              <th className="px-4 py-2.5">Customer</th>
              <th className="px-4 py-2.5">Items</th>
              <th className="px-4 py-2.5">Total</th>
              <th className="px-4 py-2.5">Payment</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="hidden px-4 py-2.5 md:table-cell">Date</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-black/[0.04] last:border-0 dark:border-white/5">
                <td className="px-4 py-2.5">
                  <Skeleton className="h-3.5 w-24" />
                </td>
                <td className="px-4 py-2.5">
                  <Skeleton className="mb-1.5 h-3.5 w-28" />
                  <Skeleton className="h-2.5 w-36" />
                </td>
                <td className="px-4 py-2.5">
                  <Skeleton className="h-3.5 w-6" />
                </td>
                <td className="px-4 py-2.5">
                  <Skeleton className="h-3.5 w-14" />
                </td>
                <td className="px-4 py-2.5">
                  <Skeleton className="h-3.5 w-14" />
                </td>
                <td className="px-4 py-2.5">
                  <Skeleton className="h-5 w-16 rounded-md" />
                </td>
                <td className="hidden px-4 py-2.5 md:table-cell">
                  <Skeleton className="h-3.5 w-20" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
