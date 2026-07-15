"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Mail,
  ShoppingCart,
  DollarSign,
  Users,
  Send,
  FilePlus2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingSectionNav } from "@/components/marketing/marketing-section-nav";
import { dashboardCard, dashboardCardPad } from "@/lib/dashboard-ui";
import { formatCurrency } from "@/lib/utils";
import type { AbandonedCheckoutRow } from "@/lib/abandoned";

interface MarketingCampaignsClientProps {
  initial: AbandonedCheckoutRow[];
  currency: string;
  storeSlug: string;
}

function recoveryMailto(row: AbandonedCheckoutRow, storeSlug: string): string | null {
  if (!row.email) return null;
  const storeUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/store/${storeSlug}`;
  const subject = encodeURIComponent("You left something behind");
  const body = encodeURIComponent(
    `Hi${row.customerName ? ` ${row.customerName}` : ""},\n\nYou left items in your cart at our store. Complete your order here:\n${storeUrl}\n\nThank you!`
  );
  return `mailto:${row.email}?subject=${subject}&body=${body}`;
}

export function MarketingCampaignsClient({
  initial,
  currency,
  storeSlug,
}: MarketingCampaignsClientProps) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [actionId, setActionId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const totalValue = rows.reduce((sum, row) => sum + row.subtotal, 0);
    return {
      count: rows.length,
      totalValue,
      avgValue: rows.length > 0 ? totalValue / rows.length : 0,
      withEmail: rows.filter((r) => r.email).length,
    };
  }, [rows]);

  const handleDraft = useCallback(
    async (id: string) => {
      setActionId(id);
      try {
        const res = await fetch(`/api/abandoned/${id}/draft`, { method: "POST" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? "Failed");
        toast.success("Draft order created");
        router.push(`/dashboard/orders/drafts/${data.draft.id}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed");
      } finally {
        setActionId(null);
      }
    },
    [router]
  );

  const handleDelete = useCallback(async (id: string) => {
    setActionId(id);
    try {
      const res = await fetch(`/api/abandoned?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setRows((prev) => prev.filter((r) => r.id !== id));
      toast.success("Removed");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setActionId(null);
    }
  }, []);

  const statCards = [
    { label: "Abandoned carts", value: stats.count.toString(), icon: ShoppingCart },
    { label: "Recoverable value", value: formatCurrency(stats.totalValue, currency), icon: DollarSign },
    { label: "Avg cart value", value: formatCurrency(stats.avgValue, currency), icon: Users },
    { label: "With email", value: stats.withEmail.toString(), icon: Mail },
  ];

  return (
    <div className="space-y-4">
      <MarketingSectionNav />

      <section className={dashboardCard}>
        <div className={`${dashboardCardPad} border-b border-border/70`}>
          <h3 className="text-base font-semibold tracking-[-0.02em]">Abandoned cart recovery</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Customers who started checkout but didn&apos;t finish. Send recovery emails to win them back.
          </p>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={dashboardCard}>
              <div className={`${dashboardCardPad} flex items-center gap-3`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#007AFF]/10">
                  <Icon className="h-4 w-4 text-[#007AFF]" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-semibold tracking-tight">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <section className={dashboardCard}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Items</th>
                <th className="px-5 py-3 font-medium">Value</th>
                <th className="px-5 py-3 font-medium">Captured</th>
                <th className="px-5 py-3 w-36" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                    No abandoned carts yet. They appear when customers enter email at checkout.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const mailto = recoveryMailto(row, storeSlug);
                  return (
                    <tr key={row.id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-5 py-3.5">
                        <p className="font-medium">{row.customerName ?? "Guest"}</p>
                        <p className="text-xs text-muted-foreground">{row.email ?? "No email"}</p>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">{row.items.length} items</td>
                      <td className="px-5 py-3.5 font-medium">
                        {formatCurrency(row.subtotal, currency)}
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground text-xs">
                        {new Date(row.createdAt).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1">
                          {mailto && (
                            <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs" asChild>
                              <a href={mailto}>
                                <Send className="h-3.5 w-3.5 mr-1" />
                                Recover
                              </a>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={actionId === row.id}
                            onClick={() => handleDraft(row.id)}
                          >
                            <FilePlus2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={actionId === row.id}
                            onClick={() => handleDelete(row.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
