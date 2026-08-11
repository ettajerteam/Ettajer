"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Download,
  ExternalLink,
  ImageOff,
  ShieldAlert,
  SquareStack,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  dashboardCard,
  dashboardCardPad,
  dashboardMetric,
  dashboardPrimaryBtn,
  dashboardStack,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import type { ListingImportReadiness } from "@/lib/channels/types";

interface EtsyPreviewItem {
  externalProductId: string;
  title: string;
  description: string;
  price: number;
  currencyCode: string;
  sku: string | null;
  quantity: number;
  tags: string[];
  images: string[];
  state: string;
  url: string | null;
  readiness: ListingImportReadiness;
  issues: string[];
  alreadyImported: boolean;
  importedProductId: string | null;
}

interface PreviewResponse {
  items: EtsyPreviewItem[];
  nextCursor: string | null;
}

const READINESS_META: Record<
  ListingImportReadiness,
  { label: string; className: string }
> = {
  ready: {
    label: "Ready",
    className: "border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  needs_review: {
    label: "Needs review",
    className: "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  missing_sku: {
    label: "Missing SKU",
    className: "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  unsupported: {
    label: "Unsupported",
    className: "border-transparent bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export function EtsyImportClient() {
  const router = useRouter();
  const [items, setItems] = useState<EtsyPreviewItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);

  const loadPage = useCallback(async (nextCursor: string | null, append: boolean) => {
    try {
      const url = new URL("/api/channels/etsy/import/preview", window.location.origin);
      if (nextCursor) url.searchParams.set("cursor", nextCursor);
      const res = await fetch(url.toString());
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message ?? "Failed to load Etsy listings");
      const parsed = data as PreviewResponse;
      setItems((current) => (append ? [...current, ...parsed.items] : parsed.items));
      setCursor(parsed.nextCursor ?? null);
      setConnectError(null);
    } catch (error) {
      setConnectError(error instanceof Error ? error.message : "Failed to load Etsy listings");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    void loadPage(null, false);
  }, [loadPage]);

  const counts = useMemo(() => {
    const base = { ready: 0, needs_review: 0, missing_sku: 0, unsupported: 0, alreadyImported: 0 };
    for (const item of items) {
      if (item.alreadyImported) {
        base.alreadyImported += 1;
        continue;
      }
      base[item.readiness] += 1;
    }
    return base;
  }, [items]);

  function toggle(externalProductId: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(externalProductId)) next.delete(externalProductId);
      else next.add(externalProductId);
      return next;
    });
  }

  function selectAllReady() {
    setSelected(
      new Set(items.filter((i) => i.readiness === "ready" && !i.alreadyImported).map((i) => i.externalProductId))
    );
  }

  async function handleImport() {
    if (selected.size === 0) return;
    setImporting(true);
    try {
      const res = await fetch("/api/channels/etsy/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingIds: Array.from(selected) }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message ?? "Import failed");
      toast.success(
        `Imported ${data.imported ?? 0} listing(s)${data.skipped ? `, ${data.skipped} already linked` : ""}`
      );
      setSelected(new Set());
      await loadPage(null, false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }

  if (loading) {
    return (
      <div className={dashboardStack}>
        <Skeleton className="h-8 w-40 rounded-md" />
        <div className="grid gap-3 sm:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-[12px]" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-[12px]" />
      </div>
    );
  }

  return (
    <div className={cn(dashboardStack, "pb-10")}>
      <Link
        href="/dashboard/channels/etsy"
        className="inline-flex h-7 w-fit items-center gap-1.5 text-[12px] font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Etsy
      </Link>

      {connectError ? (
        <section className={cn(dashboardCard, dashboardCardPad, "flex flex-wrap items-center justify-between gap-3")}>
          <div className="flex items-start gap-2.5">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-[12px] text-neutral-600 dark:text-neutral-300">{connectError}</p>
          </div>
          <Button asChild className={cn(dashboardPrimaryBtn, "h-8 shrink-0 px-3")}>
            <Link href="/dashboard/channels/etsy">Go to Etsy settings</Link>
          </Button>
        </section>
      ) : (
        <>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-5">
            <div className={cn(dashboardCard, dashboardCardPad)}>
              <p className={dashboardMetric}>{counts.ready}</p>
              <p className={dashboardSubtitle}>Ready</p>
            </div>
            <div className={cn(dashboardCard, dashboardCardPad)}>
              <p className={dashboardMetric}>{counts.needs_review}</p>
              <p className={dashboardSubtitle}>Needs review</p>
            </div>
            <div className={cn(dashboardCard, dashboardCardPad)}>
              <p className={dashboardMetric}>{counts.missing_sku}</p>
              <p className={dashboardSubtitle}>Missing SKU</p>
            </div>
            <div className={cn(dashboardCard, dashboardCardPad)}>
              <p className={dashboardMetric}>{counts.unsupported}</p>
              <p className={dashboardSubtitle}>Unsupported</p>
            </div>
            <div className={cn(dashboardCard, dashboardCardPad)}>
              <p className={dashboardMetric}>{counts.alreadyImported}</p>
              <p className={dashboardSubtitle}>Already imported</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] border border-black/[0.06] bg-white px-4 py-2.5 dark:border-white/10 dark:bg-[#1C1C1E]">
            <div className="flex items-center gap-2">
              <SquareStack className="h-3.5 w-3.5 text-neutral-400" />
              <p className="text-[12px] text-neutral-600 dark:text-neutral-300">
                {selected.size > 0 ? `${selected.size} selected` : "Select ready listings to import"}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                className="h-8 rounded-md border-black/[0.06] px-2.5 text-[12px] dark:border-white/10"
                onClick={selectAllReady}
                disabled={counts.ready === 0}
              >
                Select all ready
              </Button>
              <Button
                className={cn(dashboardPrimaryBtn, "h-8 px-3")}
                onClick={handleImport}
                loading={importing}
                disabled={importing || selected.size === 0}
              >
                <Download className="mr-1 h-3.5 w-3.5" />
                Import selected
              </Button>
            </div>
          </div>

          {items.length === 0 ? (
            <section className={cn(dashboardCard, dashboardCardPad, "py-12 text-center")}>
              <p className={dashboardSubtitle}>No Etsy listings found.</p>
            </section>
          ) : (
            <section className={cn(dashboardCard, "overflow-hidden")}>
              <div className="divide-y divide-black/[0.05] dark:divide-white/10">
                {items.map((item) => {
                  const meta = READINESS_META[item.readiness];
                  const selectable = item.readiness === "ready" && !item.alreadyImported;
                  const checked = selected.has(item.externalProductId);
                  return (
                    <div
                      key={item.externalProductId}
                      className={cn(
                        "flex items-start gap-3 px-4 py-3",
                        selectable && "cursor-pointer hover:bg-[#FAFAFA] dark:hover:bg-white/[0.03]"
                      )}
                      onClick={selectable ? () => toggle(item.externalProductId) : undefined}
                    >
                      {selectable ? (
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(item.externalProductId)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1 h-4 w-4 shrink-0 rounded border-black/20 text-[#007AFF] focus:ring-[#007AFF]/30 dark:border-white/20"
                        />
                      ) : (
                        <span className="mt-1 h-4 w-4 shrink-0" />
                      )}

                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#F5F5F7] dark:bg-white/[0.05]">
                        {item.images[0] ? (
                          <Image
                            src={item.images[0]}
                            alt={item.title || "Listing"}
                            fill
                            sizes="56px"
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-neutral-300">
                            <ImageOff className="h-5 w-5" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="truncate text-[12px] font-medium text-neutral-900 dark:text-white">
                            {item.title || `Listing ${item.externalProductId}`}
                          </p>
                          {item.alreadyImported ? (
                            <Badge className="rounded-full border-transparent bg-[#007AFF]/10 px-2 py-0 text-[10px] font-medium text-[#007AFF]">
                              Imported
                            </Badge>
                          ) : (
                            <Badge className={cn("rounded-full px-2 py-0 text-[10px] font-medium", meta.className)}>
                              {meta.label}
                            </Badge>
                          )}
                        </div>
                        <p className={cn(dashboardSubtitle, "mt-0.5")}>
                          {formatMoney(item.price, item.currencyCode)}
                          {item.sku ? ` · SKU ${item.sku}` : ""} · Qty {item.quantity}
                        </p>
                        {!item.alreadyImported && item.issues.length > 0 ? (
                          <div className="mt-1 flex flex-wrap items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400">
                            <ShieldAlert className="h-3 w-3 shrink-0" />
                            <span>{item.issues.join(" · ")}</span>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {item.alreadyImported && item.importedProductId ? (
                          <Button
                            variant="outline"
                            className="h-7 rounded-md border-black/[0.06] px-2 text-[11px] dark:border-white/10"
                            asChild
                          >
                            <Link href={`/dashboard/products/${item.importedProductId}/edit`}>
                              Open product
                            </Link>
                          </Button>
                        ) : item.alreadyImported ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : null}
                        {item.url ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-md"
                            asChild
                          >
                            <a href={item.url} target="_blank" rel="noreferrer">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {cursor ? (
            <div className="flex justify-center">
              <Button
                variant="outline"
                className="h-8 rounded-md border-black/[0.06] px-4 text-[12px] dark:border-white/10"
                onClick={() => {
                  setLoadingMore(true);
                  void loadPage(cursor, true);
                }}
                loading={loadingMore}
                disabled={loadingMore}
              >
                Load more
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
