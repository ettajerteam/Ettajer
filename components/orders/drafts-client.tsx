"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Search,
  ChevronRight,
  Trash2,
  CheckCircle2,
  ShoppingBag,
  Layers,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { OrdersSectionNav } from "@/components/orders/orders-section-nav";
import { OrdersStatGrid } from "@/components/orders/orders-stat-grid";
import { OrdersEmptyState } from "@/components/orders/orders-empty-state";
import { formatCurrency } from "@/lib/utils";
import type { DraftsListStats, OrdersSectionCounts } from "@/lib/orders-stats";
import { EMPTY_ORDERS_SECTION_COUNTS } from "@/lib/orders-stats";
import type { DraftListItem } from "@/types/drafts";

interface DraftsClientProps {
  initialDrafts: DraftListItem[];
  currency: string;
  counts?: OrdersSectionCounts;
  stats?: DraftsListStats;
}

function computeDraftStats(drafts: DraftListItem[]): DraftsListStats {
  return {
    count: drafts.length,
    totalValue: drafts.reduce((sum, d) => sum + d.total, 0),
    totalItems: drafts.reduce((sum, d) => sum + d.itemCount, 0),
  };
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function DraftsClient({
  initialDrafts,
  currency,
  counts = EMPTY_ORDERS_SECTION_COUNTS,
}: DraftsClientProps) {
  const router = useRouter();
  const [drafts, setDrafts] = useState(initialDrafts);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchDrafts = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("search", query);
      const res = await fetch(`/api/drafts?${params.toString()}`);
      const data = await res.json();
      if (res.ok) setDrafts(data.drafts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) fetchDrafts(search);
      else setDrafts(initialDrafts);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchDrafts, initialDrafts]);

  const displayStats = useMemo(() => computeDraftStats(drafts), [drafts]);

  async function handleComplete(id: string) {
    setActionId(id);
    try {
      const res = await fetch(`/api/drafts/${id}/complete`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to complete draft");
      toast.success("Draft converted to order");
      setDrafts((prev) => prev.filter((d) => d.id !== id));
      router.push(`/dashboard/orders/${data.order.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to complete draft");
    } finally {
      setActionId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this draft? This cannot be undone.")) return;
    setActionId(id);
    try {
      const res = await fetch(`/api/drafts/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to delete draft");
      toast.success("Draft deleted");
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete draft");
    } finally {
      setActionId(null);
    }
  }

  const statItems = [
    { icon: FileText, label: "Draft orders", value: displayStats.count.toLocaleString() },
    { icon: DollarSign, label: "Total value", value: formatCurrency(displayStats.totalValue, currency) },
    { icon: Layers, label: "Line items", value: displayStats.totalItems.toLocaleString() },
    {
      icon: ShoppingBag,
      label: "Avg. per draft",
      value:
        displayStats.count > 0
          ? formatCurrency(displayStats.totalValue / displayStats.count, currency)
          : "—",
    },
  ];

  return (
    <div className="space-y-4">
      <OrdersSectionNav counts={counts} />
      <OrdersStatGrid stats={statItems} />

      {loading ? (
        <div className="premium-card p-12 text-center text-sm text-muted-foreground">
          Loading drafts...
        </div>
      ) : drafts.length === 0 ? (
        <OrdersEmptyState
          icon={FileText}
          title="No draft orders"
          description="Create a draft to prepare an order before sending it to a customer."
          action={
            <Button asChild className="bg-[#007AFF] hover:bg-[#007AFF]/90">
              <Link href="/dashboard/orders/drafts/new">
                <Plus className="h-4 w-4 mr-2" />
                Create draft
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="premium-card overflow-hidden">
          <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">Draft orders</h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search drafts..."
                  className="h-9 w-44 rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/30 sm:w-52"
                />
              </div>
              <Button asChild size="sm" className="bg-[#007AFF] hover:bg-[#007AFF]/90">
                <Link href="/dashboard/orders/drafts/new">
                  <Plus className="h-4 w-4 mr-1.5" />
                  Create draft
                </Link>
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Draft</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Items</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="hidden px-5 py-3 font-medium md:table-cell">Updated</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {drafts.map((draft) => (
                  <tr
                    key={draft.id}
                    className="border-b border-border/80 last:border-0 transition-colors duration-200 hover:bg-muted/35"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/dashboard/orders/drafts/${draft.id}`}
                        className="font-medium text-foreground hover:text-[#007AFF] transition-colors"
                      >
                        {draft.orderNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground">{draft.customerName}</p>
                      <p className="text-xs text-muted-foreground">{draft.customerEmail}</p>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{draft.itemCount}</td>
                    <td className="px-5 py-3 font-medium text-foreground">
                      {formatCurrency(draft.total, currency)}
                    </td>
                    <td className="hidden px-5 py-3 text-muted-foreground md:table-cell">
                      {formatDate(draft.updatedAt)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={actionId === draft.id}
                          onClick={() => handleComplete(draft.id)}
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={actionId === draft.id}
                          onClick={() => handleDelete(draft.id)}
                          className="text-muted-foreground hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/dashboard/orders/drafts/${draft.id}`}>
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
