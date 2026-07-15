import { Skeleton } from "@/components/ui/skeleton";

export function OrderTableSkeleton() {
  return (
    <div className="premium-card overflow-hidden">
      <div className="flex items-center justify-between p-6">
        <Skeleton className="premium-skeleton h-6 w-28" />
        <Skeleton className="premium-skeleton h-9 w-52" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-y border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Items</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="hidden px-5 py-3 font-medium md:table-cell">Date</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                <td className="px-5 py-3"><Skeleton className="premium-skeleton h-4 w-28" /></td>
                <td className="px-5 py-3">
                  <Skeleton className="premium-skeleton mb-2 h-4 w-32" />
                  <Skeleton className="premium-skeleton h-3 w-40" />
                </td>
                <td className="px-5 py-3"><Skeleton className="premium-skeleton h-4 w-8" /></td>
                <td className="px-5 py-3"><Skeleton className="premium-skeleton h-4 w-16" /></td>
                <td className="px-5 py-3"><Skeleton className="premium-skeleton h-6 w-20 rounded-full" /></td>
                <td className="hidden px-5 py-3 md:table-cell"><Skeleton className="premium-skeleton h-4 w-24" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
