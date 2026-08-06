"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Activity, Check, Truck, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  dashboardMetric,
  dashboardPrimaryBtn,
  dashboardSubtitle,
} from "@/lib/dashboard-ui";
import {
  parseShippingZones,
  type ShippingZone,
  type StoreWithSettings,
} from "@/lib/store-settings";
import { countryCodeToName } from "@/lib/shipping-destinations";

/** Soft-gray health icon next to Help — opens shipping readiness popup. */
export function ShippingHealthCheckButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [currency, setCurrency] = useState("MAD");

  const loadHealth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/store");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Health check failed");
      const store = data.store as StoreWithSettings | undefined;
      setZones(
        store?.settings?.shippingZones?.length
          ? store.settings.shippingZones
          : parseShippingZones(undefined)
      );
      setCurrency(store?.currency ?? "MAD");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Health check failed");
    } finally {
      setLoading(false);
    }
  }, []);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) void loadHealth();
  }

  const countryCodes = Array.from(
    new Set(zones.flatMap((z) => z.countries.map((c) => c.toUpperCase())))
  );
  const freeZones = zones.filter((z) => z.rate === 0);
  const paidZones = zones.filter((z) => z.rate > 0);
  const lowestPaid =
    paidZones.length > 0 ? Math.min(...paidZones.map((z) => z.rate)) : null;

  const checklist = [
    {
      id: "zones",
      label: "Zones named",
      done: zones.length > 0 && zones.every((z) => z.name.trim()),
    },
    {
      id: "coverage",
      label: "Countries",
      done: zones.every((z) => z.countries.length > 0 || z.cities.length > 0),
    },
    {
      id: "rates",
      label: "Rates",
      done: zones.every((z) => z.rate >= 0),
    },
    {
      id: "ready",
      label: "Checkout ready",
      done:
        zones.length > 0 &&
        zones.every(
          (z) =>
            z.name.trim() &&
            (z.countries.length > 0 || z.cities.length > 0) &&
            z.rate >= 0
        ),
    },
  ];
  const doneCount = checklist.filter((c) => c.done).length;

  return (
    <>
      <button
        type="button"
        onClick={() => handleOpenChange(true)}
        aria-label="Shipping readiness"
        title="Shipping readiness"
        className={cn(
          "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-neutral-400 transition-colors duration-200",
          "hover:bg-black/[0.04] hover:text-neutral-600",
          "dark:text-neutral-500 dark:hover:bg-white/[0.06] dark:hover:text-neutral-300",
          className
        )}
      >
        <Activity className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className={cn(
            "w-[min(100vw-1.5rem,420px)] max-w-[420px] gap-0 overflow-hidden rounded-2xl border-black/[0.06] p-0 shadow-xl dark:border-white/10"
          )}
        >
          <DialogHeader className="space-y-0 border-b border-black/[0.05] px-4 pb-3 pt-4 pr-12 text-left dark:border-white/10">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#007AFF]/10 text-[#007AFF]">
                  <Activity className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <DialogTitle className="text-[14px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                    Shipping readiness
                  </DialogTitle>
                  <DialogDescription className="mt-0.5 text-[11px] text-neutral-500">
                    Zones, coverage, and rates customers see at checkout.
                  </DialogDescription>
                </div>
              </div>
              {!loading ? (
                <span className="shrink-0 text-[10px] tabular-nums text-neutral-400">
                  {doneCount}/{checklist.length} ready
                </span>
              ) : null}
            </div>
          </DialogHeader>

          <div className="max-h-[min(70vh,520px)] space-y-0 overflow-y-auto">
            {loading && zones.length === 0 ? (
              <div className="space-y-2 px-4 py-3">
                <div className="h-14 animate-pulse rounded-[10px] bg-black/[0.04] dark:bg-white/[0.06]" />
                <div className="h-20 animate-pulse rounded-[10px] bg-black/[0.04] dark:bg-white/[0.06]" />
                <div className="h-16 animate-pulse rounded-[10px] bg-black/[0.04] dark:bg-white/[0.06]" />
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3 border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#007AFF]/10 text-[#007AFF]">
                    <Truck className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                      {zones.length} zone{zones.length === 1 ? "" : "s"} ·{" "}
                      {countryCodes.length} countr
                      {countryCodes.length === 1 ? "y" : "ies"}
                    </p>
                    <p className={cn(dashboardSubtitle, "mt-0.5")}>
                      {freeZones.length === zones.length
                        ? "All zones ship free"
                        : lowestPaid != null
                          ? `From ${lowestPaid} ${currency}${
                              freeZones.length
                                ? ` · ${freeZones.length} free`
                                : ""
                            }`
                          : "Set delivery rates per zone"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
                  {(
                    [
                      {
                        label: "Zones",
                        value: String(zones.length),
                      },
                      {
                        label: "Countries",
                        value: String(countryCodes.length),
                      },
                      {
                        label: "Free zones",
                        value: String(freeZones.length),
                      },
                    ] as const
                  ).map((m) => (
                    <div key={m.label} className={dashboardMetric}>
                      <p className="text-[10px] font-medium text-neutral-400">
                        {m.label}
                      </p>
                      <p className="mt-0.5 text-[15px] font-semibold tabular-nums tracking-[-0.02em] text-neutral-900 dark:text-white">
                        {m.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5 border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
                  <p className="text-[11px] font-medium text-neutral-400">
                    Checklist
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {checklist.map((item) => (
                      <span
                        key={item.id}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                          item.done
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                            : "bg-black/[0.03] text-neutral-400 dark:bg-white/[0.04]"
                        )}
                      >
                        {item.done ? (
                          <Check className="h-2.5 w-2.5" />
                        ) : (
                          <span className="h-2.5 w-2.5 rounded-full border border-current opacity-40" />
                        )}
                        {item.label}
                      </span>
                    ))}
                  </div>
                </div>

                {countryCodes.length > 0 ? (
                  <div className="space-y-1.5 border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
                    <p className="text-[11px] font-medium text-neutral-400">
                      Ships to
                    </p>
                    <p className="text-[12px] leading-relaxed text-neutral-600 dark:text-neutral-300">
                      {countryCodes
                        .slice(0, 12)
                        .map((c) => countryCodeToName(c))
                        .join(", ")}
                      {countryCodes.length > 12
                        ? ` +${countryCodes.length - 12} more`
                        : ""}
                    </p>
                  </div>
                ) : (
                  <div className="border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
                    <p className="text-[12px] text-neutral-500">
                      Add at least one country so checkout can offer delivery.
                    </p>
                  </div>
                )}

                <div className="px-4 py-3">
                  {doneCount === checklist.length ? (
                    <p className="text-[12px] text-emerald-700 dark:text-emerald-300">
                      Shipping looks ready — customers can check out to your
                      zones.
                    </p>
                  ) : (
                    <p className="text-[12px] text-neutral-500">
                      Finish naming zones and adding countries, then save so
                      checkout prices match.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-black/[0.05] px-4 py-3 dark:border-white/10">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-[12px] text-neutral-500"
              disabled={loading}
              onClick={() => void loadHealth()}
            >
              <RefreshCw
                className={cn("mr-1.5 h-3.5 w-3.5", loading && "animate-spin")}
              />
              Refresh
            </Button>
            <Button
              type="button"
              size="sm"
              className={cn(dashboardPrimaryBtn, "h-8 px-3 text-[12px]")}
              onClick={() => setOpen(false)}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const SHIPPING_SETTINGS_TIPS = [
  {
    title: "Think region → country",
    body: "Add Europe or Africa in one click, then trim countries you don’t ship to.",
  },
  {
    title: "Free shipping toggle",
    body: "Turn Free on for a zone to set rate to 0 — customers always see free delivery there.",
  },
  {
    title: "Cities are optional",
    body: "Country coverage is enough for most stores. Add Maghreb cities only when you need different rates.",
  },
  {
    title: "Checkout follows your zones",
    body: "Shoppers pick from countries you cover; the price is the matching zone rate (or free).",
  },
] as const;
