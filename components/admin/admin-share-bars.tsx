import Link from "next/link";
import {
  homeCard,
  homeCardPad,
  homeKicker,
  homeLinkQuiet,
  homeSubtitle,
  homeTitle,
} from "@/components/dashboard/home/home-ui";
import { cn } from "@/lib/utils";

export type AdminShareRow = {
  id: string;
  name: string;
  slug: string;
  gmv: number;
  sharePct: number;
  orders: number;
  currency?: string;
};

interface AdminShareBarsProps {
  title: string;
  subtitle: string;
  rows: AdminShareRow[];
  hrefAll: string;
  emptyLabel?: string;
}

export function AdminShareBars({
  title,
  subtitle,
  rows,
  hrefAll,
  emptyLabel = "No GMV in this window",
}: AdminShareBarsProps) {
  const maxShare = Math.max(...rows.map((r) => r.sharePct), 1);

  return (
    <section className={cn(homeCard, homeCardPad)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className={homeTitle}>{title}</h2>
          <p className={homeSubtitle}>{subtitle}</p>
        </div>
        <Link href={hrefAll} className={homeLinkQuiet}>
          All stores
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className={cn("mt-4", homeSubtitle)}>{emptyLabel}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((row, index) => (
            <li key={row.id}>
              <Link href={`/admin/stores/${row.id}`} className="block group">
                <div className="mb-1 flex items-baseline justify-between gap-2">
                  <p className="truncate text-[12px] font-medium text-neutral-900 group-hover:text-[#007AFF] dark:text-white">
                    <span className="mr-1.5 text-neutral-400">{index + 1}.</span>
                    {row.name}
                  </p>
                  <p className="shrink-0 text-[11px] tabular-nums text-neutral-600 dark:text-neutral-300">
                    {Math.round(row.gmv).toLocaleString()}
                    {row.currency ? ` ${row.currency}` : " MAD"}
                    <span className="ml-1.5 text-neutral-400">{row.sharePct}%</span>
                  </p>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.05] dark:bg-white/[0.08]">
                  <div
                    className="h-full rounded-full bg-neutral-900 dark:bg-white"
                    style={{
                      width: `${Math.max(4, Math.round((row.sharePct / maxShare) * 100))}%`,
                    }}
                  />
                </div>
                <p className={cn("mt-1", homeKicker)}>
                  {row.orders} real orders · /{row.slug}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
