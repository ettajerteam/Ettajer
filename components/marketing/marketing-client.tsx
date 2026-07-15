"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Pencil,
  Tag,
  Percent,
  Calendar,
  Hash,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MarketingSectionNav } from "@/components/marketing/marketing-section-nav";
import { dashboardCard, dashboardCardPad } from "@/lib/dashboard-ui";
import { formatCurrency, cn } from "@/lib/utils";
import type { CouponRow, CouponStats } from "@/lib/marketing";
import { getCouponStatus } from "@/lib/marketing";

interface MarketingClientProps {
  initial: CouponRow[];
  stats: CouponStats;
  currency: string;
}

interface CouponFormState {
  code: string;
  type: "percentage" | "fixed";
  value: string;
  minPurchase: string;
  maxDiscount: string;
  usageLimit: string;
  expiresAt: string;
}

const EMPTY_FORM: CouponFormState = {
  code: "",
  type: "percentage",
  value: "",
  minPurchase: "",
  maxDiscount: "",
  usageLimit: "",
  expiresAt: "",
};

function formatDiscount(coupon: CouponRow, currency: string) {
  if (coupon.type === "percentage") {
    const cap =
      coupon.maxDiscount != null
        ? ` · max ${formatCurrency(coupon.maxDiscount, currency)}`
        : "";
    return `${coupon.value}%${cap}`;
  }
  return formatCurrency(coupon.value, currency);
}

function StatusBadge({ status }: { status: ReturnType<typeof getCouponStatus> }) {
  const styles = {
    active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    expired: "bg-muted text-muted-foreground",
    depleted: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  };
  const labels = { active: "Active", expired: "Expired", depleted: "Limit reached" };
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        styles[status]
      )}
    >
      {labels[status]}
    </span>
  );
}

export function MarketingClient({ initial, stats, currency }: MarketingClientProps) {
  const [coupons, setCoupons] = useState(initial);
  const [form, setForm] = useState<CouponFormState>(EMPTY_FORM);
  const [editing, setEditing] = useState<CouponRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const statCards = useMemo(
    () => [
      { label: "Total codes", value: stats.totalCoupons.toString(), icon: Tag },
      { label: "Active", value: stats.activeCoupons.toString(), icon: Percent },
      { label: "Redemptions", value: stats.totalRedemptions.toString(), icon: Hash },
      {
        label: "Discount given",
        value: formatCurrency(stats.revenueDiscounted, currency),
        icon: TrendingDown,
      },
    ],
    [stats, currency]
  );

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(coupon: CouponRow) {
    setEditing(coupon);
    setForm({
      code: coupon.code,
      type: coupon.type as "percentage" | "fixed",
      value: String(coupon.value),
      minPurchase: coupon.minPurchase != null ? String(coupon.minPurchase) : "",
      maxDiscount: coupon.maxDiscount != null ? String(coupon.maxDiscount) : "",
      usageLimit: coupon.usageLimit != null ? String(coupon.usageLimit) : "",
      expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : "",
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  }

  async function handleSave() {
    if (!form.code.trim() || !form.value) return;
    setSaving(true);
    try {
      const payload = {
        code: form.code.trim(),
        type: form.type,
        value: Number(form.value),
        minPurchase: form.minPurchase ? Number(form.minPurchase) : undefined,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        expiresAt: form.expiresAt || undefined,
      };

      const res = await fetch(
        editing ? `/api/marketing?id=${editing.id}` : "/api/marketing",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed");

      if (editing) {
        setCoupons((prev) => prev.map((c) => (c.id === editing.id ? data.coupon : c)));
        toast.success("Discount updated");
      } else {
        setCoupons((prev) => [data.coupon, ...prev]);
        toast.success("Discount created");
      }
      closeDialog();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/marketing?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      toast.success("Deleted");
    }
  }

  return (
    <div className="space-y-4">
      <MarketingSectionNav />

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

      <div className="flex justify-end">
        <Button onClick={openCreate} className="bg-[#007AFF] hover:bg-[#007AFF]/90">
          <Plus className="h-4 w-4 mr-2" /> New discount
        </Button>
      </div>

      <section className={dashboardCard}>
        <div className={`${dashboardCardPad} border-b border-border/70`}>
          <h3 className="text-base font-semibold tracking-[-0.02em]">Discount codes</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Codes customers enter at checkout. Track usage and limits below.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-5 py-3 font-medium">Code</th>
                <th className="px-5 py-3 font-medium">Discount</th>
                <th className="px-5 py-3 font-medium">Rules</th>
                <th className="px-5 py-3 font-medium">Used</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 w-20" />
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    No discount codes yet. Create one to offer promotions at checkout.
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-5 py-3.5 font-mono font-semibold">{coupon.code}</td>
                    <td className="px-5 py-3.5">{formatDiscount(coupon, currency)}</td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs">
                      {coupon.minPurchase != null && (
                        <span className="block">
                          Min {formatCurrency(coupon.minPurchase, currency)}
                        </span>
                      )}
                      {coupon.expiresAt && (
                        <span className="block">
                          Expires {new Date(coupon.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                      {!coupon.minPurchase && !coupon.expiresAt && "—"}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {coupon.usedCount}
                      {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={getCouponStatus(coupon)} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(coupon)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit discount" : "Create discount"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div>
              <Label>Code</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="SUMMER20"
                className="font-mono uppercase"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm((f) => ({ ...f, type: v as "percentage" | "fixed" }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Value</Label>
                <Input
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Min purchase</Label>
                <Input
                  type="number"
                  value={form.minPurchase}
                  onChange={(e) => setForm((f) => ({ ...f, minPurchase: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
              <div>
                <Label>Max discount</Label>
                <Input
                  type="number"
                  value={form.maxDiscount}
                  onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value }))}
                  placeholder="For % codes"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Usage limit</Label>
                <Input
                  type="number"
                  value={form.usageLimit}
                  onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
                  placeholder="Unlimited"
                />
              </div>
              <div>
                <Label className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Expires
                </Label>
                <Input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                />
              </div>
            </div>
            <Button onClick={handleSave} loading={saving} className="mt-2 bg-[#007AFF] hover:bg-[#007AFF]/90">
              {editing ? "Save changes" : "Create discount"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
