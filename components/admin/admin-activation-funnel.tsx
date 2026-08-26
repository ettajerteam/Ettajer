import Link from "next/link";
import type { ActivationGapData } from "@/lib/admin/activation-stats";
import {
  homeCard,
  homeCardPad,
  homeKicker,
  homeLinkQuiet,
  homeSubtitle,
  homeTitle,
} from "@/components/dashboard/home/home-ui";
import { cn } from "@/lib/utils";

interface AdminActivationFunnelProps {
  funnel: ActivationGapData["funnel"];
  hotEmptyCount: number;
  loggedInEmpty7d: number;
}

const STAGES: {
  key: keyof ActivationGapData["funnel"];
  label: string;
  hint: string;
  href: string;
}[] = [
  {
    key: "totalStores",
    label: "All stores",
    hint: "Merchant stores",
    href: "/admin/activation?stage=all",
  },
  {
    key: "noProducts",
    label: "Empty",
    hint: "No products",
    href: "/admin/activation?stage=empty",
  },
  {
    key: "draftOnly",
    label: "Draft",
    hint: "Nothing live",
    href: "/admin/activation?stage=draft",
  },
  {
    key: "activeNoOrders",
    label: "Listed · 0 sales",
    hint: "First-sale targets",
    href: "/admin/activation?stage=listed",
  },
  {
    key: "hasOrders",
    label: "Activated",
    hint: "≥1 real sale",
    href: "/admin/activation?stage=activated",
  },
];

export function AdminActivationFunnel({
  funnel,
  hotEmptyCount,
  loggedInEmpty7d,
}: AdminActivationFunnelProps) {
  const total = Math.max(funnel.totalStores, 1);

  return (
    <section className={cn(homeCard, homeCardPad)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className={homeTitle}>Activation funnel</h2>
          <p className={homeSubtitle}>
            Click a stage to open the operational list.
          </p>
        </div>
        <Link href="/admin/activation" className={homeLinkQuiet}>
          Full board
        </Link>
      </div>

      <div className="mt-4 space-y-1">
        {STAGES.map((stage, index) => {
          const value = funnel[stage.key];
          const width = Math.max(4, Math.round((value / total) * 100));
          return (
            <div key={stage.key}>
              {index > 0 ? (
                <div className="flex justify-center py-0.5 text-[10px] text-neutral-300 dark:text-neutral-600">
                  ↓
                </div>
              ) : null}
              <Link
                href={stage.href}
                className="block rounded-lg border border-transparent px-2 py-1.5 transition-colors hover:border-black/[0.06] hover:bg-black/[0.02] dark:hover:border-white/10 dark:hover:bg-white/[0.03]"
              >
                <div className="mb-1 flex items-baseline justify-between gap-2">
                  <p className="text-[12px] font-medium text-neutral-800 dark:text-neutral-100">
                    {stage.label}
                  </p>
                  <p className="text-[12px] tabular-nums text-neutral-500">
                    {value.toLocaleString()}
                    <span className="ml-1 text-neutral-400">
                      · {Math.round((value / total) * 100)}%
                    </span>
                  </p>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.05] dark:bg-white/[0.08]">
                  <div
                    className="h-full rounded-full bg-neutral-900 dark:bg-white"
                    style={{ width: `${width}%` }}
                  />
                </div>
                <p className={cn("mt-1", homeKicker)}>{stage.hint}</p>
              </Link>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          href="/admin/activation?stage=empty&temp=hot"
          className="rounded-lg border border-black/[0.05] px-2.5 py-2 transition-colors hover:bg-black/[0.02] dark:border-white/[0.06] dark:hover:bg-white/[0.03]"
        >
          <p className={homeKicker}>Hot empty</p>
          <p className="mt-1 text-[16px] font-semibold tabular-nums text-neutral-900 dark:text-white">
            {hotEmptyCount}
          </p>
        </Link>
        <div className="rounded-lg border border-black/[0.05] px-2.5 py-2 dark:border-white/[0.06]">
          <p className={homeKicker}>Logged in · empty · 7d</p>
          <p className="mt-1 text-[16px] font-semibold tabular-nums text-neutral-900 dark:text-white">
            {loggedInEmpty7d}
          </p>
        </div>
      </div>
    </section>
  );
}
