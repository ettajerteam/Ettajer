"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Trash2,
  Mail,
  FilePlus2,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { OrdersSectionNav } from "@/components/orders/orders-section-nav";
import { OrdersStatGrid } from "@/components/orders/orders-stat-grid";
import { OrdersEmptyState } from "@/components/orders/orders-empty-state";
import { formatCurrency } from "@/lib/utils";
import type { AbandonedListStats, OrdersSectionCounts } from "@/lib/orders-stats";
import { EMPTY_ORDERS_SECTION_COUNTS } from "@/lib/orders-stats";
import type { AbandonedCheckoutRow } from "@/lib/abandoned";

interface AbandonedClientProps {
  initial: AbandonedCheckoutRow[];
  currency: string;
  counts?: OrdersSectionCounts;
  stats?: AbandonedListStats;
}

function computeAbandonedStats(rows: AbandonedCheckoutRow[]): AbandonedListStats {
  const totalValue = rows.reduce((sum, row) => sum + row.subtotal, 0);
  return {
    count: rows.length,
    totalValue,
    avgValue: rows.length > 0 ? totalValue / rows.length : 0,
  };
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function recoveryMailto(row: AbandonedCheckoutRow): string | null {
  if (!row.email) return null;
  const subject = encodeURIComponent("Complete your order");
  const body = encodeURIComponent(
    `Hi${row.customerName ? ` ${row.customerName}` : ""},\n\nYou left items in your cart. Come back to complete your purchase!\n\nThank you.`
  );
  return `mailto:${row.email}?subject=${subject}&body=${body}`;
}

export function AbandonedClient({
  initial,
  currency,
  counts = EMPTY_ORDERS_SECTION_COUNTS,
}: AbandonedClientProps) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchRows = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("search", query);
      const res = await fetch(`/api/abandoned?${params.toString()}`);
      const data = await res.json();
      if (res.ok) setRows(data.checkouts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) fetchRows(search);
      else setRows(initial);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchRows, initial]);

  const displayStats = useMemo(() => computeAbandonedStats(rows), [rows]);

  async function handleDelete(id: string) {
    if (!confirm("Remove this abandoned checkout?")) return;
    setActionId(id);
    try {
      const res = await fetch(`/api/abandoned?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove");
      setRows((prev) => prev.filter((r) => r.id !== id));
      toast.success("Removed");
    } catch {
      toast.error("Failed to remove checkout");
    } finally {
      setActionId(null);
    }
  }

  async function handleCreateDraft(id: string) {
    setActionId(id);
    try {
      const res = await fetch(`/api/abandoned/${id}/draft`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to create draft");
      toast.success("Draft created from cart");
      setRows((prev) => prev.filter((r) => r.id !== id));
      router.push(`/dashboard/orders/drafts/${data.draft.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create draft");
    } finally {
      setActionId(null);
    }
  }

  const statItems = [
    { icon: Users, label: "Abandoned carts", value: displayStats.count.toLocaleString() },
    {
      icon: DollarSign,
      label: "Recoverable value",
      value: formatCurrency(displayStats.totalValue, currency),
    },
    {
      icon: TrendingUp,
      label: "Avg. cart value",
      value: formatCurrency(displayStats.avgValue, currency),
    },
    {
      icon: ShoppingCart,
      label: "Potential orders",
      value: displayStats.count.toLocaleString(),
      hint: "Unrecovered checkouts",
    },
  ];

  return (
    <div className="space-y-4">
      <OrdersSectionNav counts={counts} />
      <OrdersStatGrid stats={statItems} columns={4} />

      {loading ? (
        <div className="premium-card p-12 text-center text-sm text-muted-foreground">
          Loading checkouts...
        </div>
      ) : rows.length === 0 ? (
        <OrdersEmptyState
          icon={ShoppingCart}
          title="No abandoned checkouts"
          description="Checkouts are saved when a customer enters their email but doesn't complete the order."
        />
      ) : (
        <div className="premium-card overflow-hidden">
          <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">Abandoned checkouts</h2>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="h-9 w-44 rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/30 sm:w-56"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Items</th>
                  <th className="px-5 py-3 font-medium">Cart value</th>
                  <th className="hidden px-5 py-3 font-medium md:table-cell">Products</th>
                  <th className="px-5 py-3 font-medium">Last updated</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const mailto = recoveryMailto(row);
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-border/80 last:border-0 transition-colors duration-200 hover:bg-muted/35"
                    >
                      <td className="px-5 py-3">
                        <p className="font-medium text-foreground">{row.customerName ?? "Guest"}</p>
                        <p className="text-xs text-muted-foreground">{row.email ?? "—"}</p>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{row.items.length}</td>
                      <td className="px-5 py-3 font-medium text-foreground">
                        {formatCurrency(row.subtotal, currency)}
                      </td>
                      <td className="hidden max-w-[200px] px-5 py-3 md:table-cell">
                        <p className="truncate text-xs text-muted-foreground">
                          {row.items.map((i) => i.title).join(", ") || "—"}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {formatDateTime(row.updatedAt)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={actionId === row.id}
                            onClick={() => handleCreateDraft(row.id)}
                            className="text-[#007AFF] hover:text-[#007AFF] hover:bg-[#007AFF]/10"
                          >
                            <FilePlus2 className="h-4 w-4 mr-1" />
                            Draft
                          </Button>
                          {mailto && (
                            <Button variant="ghost" size="icon" asChild>
                              <a href={mailto} aria-label="Send recovery email">
                                <Mail className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={actionId === row.id}
                            onClick={() => handleDelete(row.id)}
                            className="text-muted-foreground hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
