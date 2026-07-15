"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Gift, DollarSign, CheckCircle2, CircleOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CatalogSectionNav } from "@/components/catalog/catalog-section-nav";
import { OrdersStatGrid } from "@/components/orders/orders-stat-grid";
import { ProductsEmptyState } from "@/components/products/products-empty-state";
import { cn, formatCurrency } from "@/lib/utils";

interface GiftCard {
  id: string;
  code: string;
  initialBalance: number;
  balance: number;
  active: boolean;
  expiresAt: string | null;
}

export function GiftCardsClient({
  initial,
  currency,
}: {
  initial: GiftCard[];
  currency: string;
}) {
  const [cards, setCards] = useState(initial);
  const [balance, setBalance] = useState("");
  const [creating, setCreating] = useState(false);

  const stats = useMemo(() => {
    const active = cards.filter((c) => c.active);
    const totalBalance = cards.reduce((sum, c) => sum + c.balance, 0);
    const activeBalance = active.reduce((sum, c) => sum + c.balance, 0);
    return {
      total: cards.length,
      active: active.length,
      totalBalance,
      activeBalance,
    };
  }, [cards]);

  async function handleCreate() {
    const amount = Number(balance);
    if (!amount || amount <= 0) return;
    setCreating(true);
    try {
      const res = await fetch("/api/gift-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ balance: amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCards((prev) => [data.giftCard, ...prev]);
      setBalance("");
      toast.success("Gift card created");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setCreating(false);
    }
  }

  async function handleDeactivate(id: string) {
    if (!confirm("Deactivate this gift card?")) return;
    const res = await fetch(`/api/gift-cards?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setCards((prev) => prev.map((c) => (c.id === id ? { ...c, active: false } : c)));
      toast.success("Gift card deactivated");
    }
  }

  return (
    <div className="space-y-4">
      <CatalogSectionNav />
      <OrdersStatGrid
        stats={[
          { icon: Gift, label: "Total cards", value: stats.total.toLocaleString() },
          { icon: CheckCircle2, label: "Active", value: stats.active.toLocaleString() },
          {
            icon: DollarSign,
            label: "Outstanding balance",
            value: formatCurrency(stats.activeBalance, currency),
          },
          {
            icon: CircleOff,
            label: "Total issued",
            value: formatCurrency(stats.totalBalance, currency),
          },
        ]}
        columns={4}
      />

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="premium-card p-6">
          <h3 className="text-lg font-semibold tracking-[-0.02em]">Create gift card</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Issue a new card with a unique code and starting balance.
          </p>
          <div className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gift-balance">Balance ({currency})</Label>
              <Input
                id="gift-balance"
                type="number"
                min="1"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="rounded-xl"
                placeholder="100"
              />
            </div>
            <Button
              onClick={handleCreate}
              disabled={creating}
              className="h-10 w-full rounded-xl bg-[#007AFF] hover:bg-[#007AFF]/90"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              {creating ? "Creating..." : "Create gift card"}
            </Button>
          </div>
        </div>

        <div className="premium-card overflow-hidden">
          <div className="border-b border-border/80 px-6 py-5">
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">All gift cards</h2>
          </div>

          {cards.length === 0 ? (
            <div className="p-6">
              <ProductsEmptyState
                icon={Gift}
                title="No gift cards yet"
                description="Create gift cards for customers to redeem on your storefront."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Code</th>
                    <th className="px-6 py-3 font-medium">Balance</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="hidden px-6 py-3 font-medium md:table-cell">Expires</th>
                    <th className="px-6 py-3 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {cards.map((card) => (
                    <tr
                      key={card.id}
                      className="group border-b border-border/80 transition-colors duration-200 last:border-0 hover:bg-muted/35"
                    >
                      <td className="px-6 py-4 font-mono font-medium text-foreground">{card.code}</td>
                      <td className="px-6 py-4 font-medium text-foreground">
                        {formatCurrency(card.balance, currency)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                            card.active
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {card.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="hidden px-6 py-4 text-muted-foreground md:table-cell">
                        {card.expiresAt
                          ? new Date(card.expiresAt).toLocaleDateString()
                          : "No expiry"}
                      </td>
                      <td className="px-6 py-4">
                        {card.active && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeactivate(card.id)}
                            className="text-muted-foreground opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
