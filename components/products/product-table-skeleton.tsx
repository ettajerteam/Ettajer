import { Skeleton } from "@/components/ui/skeleton";

export function ProductTableSkeleton() {
  return (
    <div className="premium-card overflow-hidden">
      <div className="flex items-center justify-between p-6">
        <Skeleton className="premium-skeleton h-6 w-28" />
        <Skeleton className="premium-skeleton h-9 w-56" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-y border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-6 py-3 font-medium">Product</th>
              <th className="hidden px-6 py-3 font-medium sm:table-cell">Status</th>
              <th className="px-6 py-3 font-medium">Price</th>
              <th className="hidden px-6 py-3 font-medium md:table-cell">Inventory</th>
              <th className="px-6 py-3 w-12" />
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="premium-skeleton h-12 w-12 shrink-0 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="premium-skeleton h-4 w-40" />
                      <Skeleton className="premium-skeleton h-3 w-24" />
                    </div>
                  </div>
                </td>
                <td className="hidden px-6 py-4 sm:table-cell">
                  <Skeleton className="premium-skeleton h-6 w-20 rounded-full" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="premium-skeleton h-4 w-16" />
                </td>
                <td className="hidden px-6 py-4 md:table-cell">
                  <Skeleton className="premium-skeleton h-4 w-10" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="premium-skeleton h-8 w-8 rounded-lg" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
