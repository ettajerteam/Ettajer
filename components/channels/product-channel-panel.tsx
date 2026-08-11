"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Store as StoreIcon,
  Unlink,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format-relative-time";
import {
  dashboardCard,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import type { ChannelConnectionPublic } from "@/lib/channels/types";

interface ProductListingStatus {
  id: string;
  status: "draft" | "active" | "inactive" | "error" | string;
  externalProductId: string;
  lastSyncedAt: string | null;
  lastError: string | null;
  url: string | null;
}

interface ProductChannelStatusResponse {
  connected: boolean;
  connection: ChannelConnectionPublic | null;
  listing: ProductListingStatus | null;
}

interface ProductChannelPanelProps {
  productId: string;
  productTitle?: string;
}

const LISTING_STATUS_META: Record<string, { label: string; className: string }> = {
  active: {
    label: "Live on Etsy",
    className: "border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  draft: {
    label: "Draft on Etsy",
    className: "border-transparent bg-neutral-100 text-neutral-600 dark:bg-white/10 dark:text-neutral-300",
  },
  inactive: {
    label: "Unpublished",
    className: "border-transparent bg-neutral-100 text-neutral-600 dark:bg-white/10 dark:text-neutral-300",
  },
  error: {
    label: "Error",
    className: "border-transparent bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

export function ProductChannelPanel({ productId, productTitle }: ProductChannelPanelProps) {
  const [data, setData] = useState<ProductChannelStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<"publish" | "sync" | "unpublish" | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/channels/etsy/products/${productId}/status`);
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.message ?? "Failed to load channel status");
      setData(json);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load channel status");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  async function runAction(
    kind: "publish" | "sync" | "unpublish",
    endpoint: string,
    successMessage: string
  ) {
    setAction(kind);
    try {
      const res = await fetch(endpoint, { method: "POST" });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.message ?? "Request failed");
      toast.success(json?.message ?? successMessage);
      await fetchStatus();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Request failed");
    } finally {
      setAction(null);
    }
  }

  const handlePublish = () =>
    runAction("publish", `/api/channels/etsy/products/${productId}/publish`, "Published to Etsy");
  const handleSync = () =>
    runAction("sync", `/api/channels/etsy/products/${productId}/sync`, "Synced with Etsy");
  const handleUnpublish = () => {
    if (typeof window !== "undefined" && !window.confirm(`Unpublish "${productTitle ?? "this product"}" from Etsy?`)) {
      return;
    }
    void runAction("unpublish", `/api/channels/etsy/products/${productId}/unpublish`, "Unpublished from Etsy");
  };

  return (
    <section className={cn(dashboardCard, "overflow-hidden")}>
      <div className="border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
        <h3 className={dashboardTitle}>Sales Channels</h3>
        <p className={cn(dashboardSubtitle, "mt-0.5")}>Where this product is published and sold.</p>
      </div>

      <div className="divide-y divide-black/[0.05] dark:divide-white/10">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#007AFF]/10 text-[#007AFF]">
              <StoreIcon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[12px] font-medium text-neutral-900 dark:text-white">Ettajer</p>
              <p className={dashboardSubtitle}>Your storefront — always on.</p>
            </div>
          </div>
          <Badge className="rounded-full border-transparent bg-emerald-100 px-2 py-0 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            Active
          </Badge>
        </div>

        <div className="px-4 py-3">
          {loading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
              <Skeleton className="h-8 w-40" />
            </div>
          ) : (
            <ProductEtsyRow
              productId={productId}
              data={data}
              action={action}
              onPublish={handlePublish}
              onSync={handleSync}
              onUnpublish={handleUnpublish}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function ProductEtsyRow({
  data,
  action,
  onPublish,
  onSync,
  onUnpublish,
}: {
  productId: string;
  data: ProductChannelStatusResponse | null;
  action: "publish" | "sync" | "unpublish" | null;
  onPublish: () => void;
  onSync: () => void;
  onUnpublish: () => void;
}) {
  const iconWrap = (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F1641E]/10 text-[#F1641E]">
      <StoreIcon className="h-4 w-4" />
    </span>
  );

  if (!data || !data.connection) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {iconWrap}
          <div>
            <p className="text-[12px] font-medium text-neutral-900 dark:text-white">Etsy</p>
            <p className={dashboardSubtitle}>Not connected</p>
          </div>
        </div>
        <Button variant="outline" className="h-8 rounded-md border-black/[0.06] px-2.5 text-[12px] dark:border-white/10" asChild>
          <Link href="/dashboard/channels/etsy">Connect Etsy</Link>
        </Button>
      </div>
    );
  }

  if (!data.connected) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {iconWrap}
          <div>
            <p className="text-[12px] font-medium text-neutral-900 dark:text-white">Etsy</p>
            <p className={cn(dashboardSubtitle, "flex items-center gap-1")}>
              <AlertTriangle className="h-3 w-3 text-amber-500" />
              Connection needs attention
            </p>
          </div>
        </div>
        <Button variant="outline" className="h-8 rounded-md border-black/[0.06] px-2.5 text-[12px] dark:border-white/10" asChild>
          <Link href="/dashboard/channels/etsy">Reconnect</Link>
        </Button>
      </div>
    );
  }

  const listing = data.listing;
  const statusMeta = listing ? LISTING_STATUS_META[listing.status] : null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {iconWrap}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="text-[12px] font-medium text-neutral-900 dark:text-white">Etsy</p>
            {statusMeta ? (
              <Badge className={cn("rounded-full px-2 py-0 text-[10px] font-medium", statusMeta.className)}>
                {statusMeta.label}
              </Badge>
            ) : null}
          </div>
          <p className={dashboardSubtitle}>
            {listing
              ? `Synced ${listing.lastSyncedAt ? formatRelativeTime(listing.lastSyncedAt) : "never"}`
              : "Needs images + an Etsy shipping profile to go live"}
          </p>
          {listing?.lastError ? (
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400">
              <AlertTriangle className="h-3 w-3 shrink-0" />
              {listing.lastError}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-1.5">
        {listing?.url ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" asChild>
            <a href={listing.url} target="_blank" rel="noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        ) : null}
        {!listing ? (
          <Button
            className="h-8 rounded-md bg-[#F1641E] px-3 text-[12px] font-medium text-white shadow-none [background-image:none] hover:scale-100 hover:bg-[#D8560F] hover:shadow-none"
            onClick={onPublish}
            loading={action === "publish"}
            disabled={action !== null}
          >
            <UploadCloud className="mr-1 h-3.5 w-3.5" />
            Publish
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              className="h-8 rounded-md border-black/[0.06] px-2.5 text-[12px] dark:border-white/10"
              onClick={onSync}
              loading={action === "sync"}
              disabled={action !== null}
            >
              <RefreshCw className="mr-1 h-3.5 w-3.5" />
              Sync
            </Button>
            {listing.status !== "inactive" ? (
              <Button
                variant="outline"
                className="h-8 rounded-md border-red-500/20 px-2.5 text-[12px] text-red-600 hover:bg-red-500/5 dark:border-red-500/30 dark:text-red-400"
                onClick={onUnpublish}
                loading={action === "unpublish"}
                disabled={action !== null}
              >
                <Unlink className="mr-1 h-3.5 w-3.5" />
                Unpublish
              </Button>
            ) : (
              <Button
                className="h-8 rounded-md bg-[#F1641E] px-3 text-[12px] font-medium text-white shadow-none [background-image:none] hover:scale-100 hover:bg-[#D8560F] hover:shadow-none"
                onClick={onPublish}
                loading={action === "publish"}
                disabled={action !== null}
              >
                <UploadCloud className="mr-1 h-3.5 w-3.5" />
                Republish
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
