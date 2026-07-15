import Link from "next/link";
import { Package } from "lucide-react";
import { dashboardCard, dashboardCardPad, dashboardSubtitle, dashboardTitle } from "@/lib/dashboard-ui";
import { cn, formatCurrency } from "@/lib/utils";
import type { ReportsData } from "@/lib/reports";

interface ReportsTopProductsProps {
  products: ReportsData["topProducts"];
  currency: string;
}

export function ReportsTopProducts({ products, currency }: ReportsTopProductsProps) {
  const maxRevenue = Math.max(...products.map((product) => product.revenue), 1);

  return (
    <section className={cn(dashboardCard, dashboardCardPad, "ring-1 ring-neutral-200/60 dark:ring-white/10")}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
            <Package className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h2 className={dashboardTitle}>Top products</h2>
            <p className={dashboardSubtitle}>By revenue in this period</p>
          </div>
        </div>
        <Link href="/dashboard/products" className="text-xs font-medium text-[#007AFF] hover:underline">
          View all
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Package className="h-8 w-8 text-neutral-300" />
          <p className="mt-2 text-sm text-muted-foreground">No product sales in this period</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {products.map((product, index) => {
            const width = `${(product.revenue / maxRevenue) * 100}%`;

            return (
              <li
                key={product.title}
                className="rounded-xl border border-transparent bg-neutral-50/70 px-3 py-2.5 dark:bg-white/[0.02]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-semibold text-neutral-600 shadow-sm dark:bg-white/10">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                        {product.title}
                      </p>
                      <p className="shrink-0 text-sm font-semibold text-neutral-900 dark:text-white">
                        {formatCurrency(product.revenue, currency)}
                      </p>
                    </div>
                    <p className={dashboardSubtitle}>
                      {product.units} sold · {product.share.toFixed(1)}% of revenue
                    </p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200/80 dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-400 to-violet-600"
                        style={{ width }}
                      />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
