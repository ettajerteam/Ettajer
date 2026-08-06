import Link from "next/link";
import { Package } from "lucide-react";
import {
  dashboardCard,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import { cn, formatCurrency } from "@/lib/utils";
import type { ReportsData } from "@/lib/reports";

interface ReportsTopProductsProps {
  products: ReportsData["topProducts"];
  currency: string;
}

export function ReportsTopProducts({ products, currency }: ReportsTopProductsProps) {
  const maxRevenue = Math.max(...products.map((product) => product.revenue), 1);

  return (
    <section className={cn(dashboardCard, "overflow-hidden")}>
      <div className="flex items-center justify-between border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
        <div>
          <h2 className={dashboardTitle}>Top products</h2>
          <p className={dashboardSubtitle}>By revenue in this period</p>
        </div>
        <Link
          href="/dashboard/products"
          className="text-[11px] font-medium text-[#007AFF] hover:underline"
        >
          View all
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
          <Package className="h-5 w-5 text-neutral-300" />
          <p className="mt-2 text-[12px] text-neutral-400">
            No product sales in this period
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-black/[0.04] dark:divide-white/5">
          {products.map((product, index) => {
            const width = `${(product.revenue / maxRevenue) * 100}%`;

            return (
              <li key={product.title} className="px-4 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#F5F5F7] text-[10px] font-semibold text-neutral-500 dark:bg-white/[0.08] dark:text-neutral-300">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[12px] font-medium text-neutral-900 dark:text-white">
                        {product.title}
                      </p>
                      <p className="shrink-0 text-[12px] font-semibold tabular-nums text-neutral-900 dark:text-white">
                        {formatCurrency(product.revenue, currency)}
                      </p>
                    </div>
                    <p className={dashboardSubtitle}>
                      {product.units} sold · {product.share.toFixed(1)}%
                    </p>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-black/[0.05] dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-[#007AFF]"
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
