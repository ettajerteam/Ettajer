"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Copy,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
  CircleOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductsEmptyState } from "@/components/products/products-empty-state";
import { DiscountSheet } from "@/components/marketing/discount-sheet";
import { cn, formatCurrency } from "@/lib/utils";
import {
  dashboardCard,
  dashboardKicker,
  dashboardMetric,
  dashboardPill,
  dashboardPillActive,
  dashboardPillGroup,
  dashboardPillInactive,
  dashboardStack,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import type { CouponRow, CouponStats } from "@/lib/marketing";
import { getCouponStatus } from "@/lib/marketing";

type StatusFilter = "all" | "active" | "expired" | "depleted";

interface MarketingClientProps {
  initial: CouponRow[];
  stats: CouponStats;
  currency: string;
}

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
    expired: "bg-[#F5F5F7] text-neutral-500 dark:bg-white/[0.08] dark:text-neutral-400",
    depleted: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  };
  const labels = {
    active: "Active",
    expired: "Expired",
    depleted: "Limit reached",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-medium",
        styles[status]
      )}
    >
      {labels[status]}
    </span>
  );
}

const primaryBtnClass =
  "h-7 rounded-md bg-[#007AFF] px-2.5 text-[12px] font-medium text-white shadow-none [background-image:none] hover:scale-100 hover:bg-[#0071EB] hover:shadow-none";

export function MarketingClient({
  initial,
  stats: initialStats,
  currency,
}: MarketingClientProps) {
  const [coupons, setCoupons] = useState(initial);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<CouponRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CouponRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [discountGiven] = useState(initialStats.revenueDiscounted);
  const [redemptions, setRedemptions] = useState(initialStats.totalRedemptions);

  useEffect(() => {
    setCoupons(initial);
  }, [initial]);

  useEffect(() => {
    setRedemptions(initialStats.totalRedemptions);
  }, [initialStats.totalRedemptions]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return coupons.filter((coupon) => {
      const status = getCouponStatus(coupon);
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (!q) return true;
      return coupon.code.toLowerCase().includes(q);
    });
  }, [coupons, search, statusFilter]);

  const hasFilters = Boolean(search.trim()) || statusFilter !== "all";

  const liveStats = useMemo(() => {
    let active = 0;
    let redemptionsFromCodes = 0;
    for (const coupon of coupons) {
      if (getCouponStatus(coupon) === "active") active += 1;
      redemptionsFromCodes += coupon.usedCount;
    }
    return {
      total: coupons.length,
      active,
      redemptions: Math.max(redemptions, redemptionsFromCodes),
      discountGiven,
    };
  }, [coupons, redemptions, discountGiven]);

  const statItems = [
    { label: "Codes", value: liveStats.total.toLocaleString() },
    { label: "Active", value: liveStats.active.toLocaleString() },
    { label: "Redemptions", value: liveStats.redemptions.toLocaleString() },
    {
      label: "Discount given",
      value: formatCurrency(liveStats.discountGiven, currency),
    },
  ];

  function openCreate() {
    setEditing(null);
    setSheetOpen(true);
  }

  function openEdit(coupon: CouponRow) {
    setEditing(coupon);
    setSheetOpen(true);
  }

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code copied");
    } catch {
      toast.error("Could not copy code");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/marketing?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          typeof data.message === "string" ? data.message : "Failed to delete"
        );
      }
      setCoupons((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      toast.success("Discount deleted");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
  }

  const statusPills: { id: StatusFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "expired", label: "Expired" },
    { id: "depleted", label: "Limit reached" },
  ];

  const toolbar = (
    <div className="flex flex-wrap items-center gap-1.5">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search codes…"
          className="h-7 w-40 rounded-md border border-black/[0.06] bg-[#F5F5F7] pl-7 pr-7 text-[12px] outline-none focus:ring-1 focus:ring-[#007AFF]/30 sm:w-52 dark:border-white/10 dark:bg-white/[0.05]"
        />
        {search ? (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-1.5 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-neutral-400 hover:bg-black/[0.05]"
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </button>
        ) : null}
      </div>

      <div className={dashboardPillGroup}>
        {statusPills.map((pill) => (
          <button
            key={pill.id}
            type="button"
            onClick={() => setStatusFilter(pill.id)}
            className={cn(
              dashboardPill,
              statusFilter === pill.id
                ? dashboardPillActive
                : dashboardPillInactive
            )}
          >
            {pill.label}
          </button>
        ))}
      </div>

      <Button type="button" onClick={openCreate} className={primaryBtnClass}>
        <Plus className="mr-1 h-3 w-3" />
        New discount
      </Button>
    </div>
  );

  function RowActions({ coupon }: { coupon: CouponRow }) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md text-neutral-400 hover:text-neutral-700"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 text-[12px]">
          <DropdownMenuItem onClick={() => void copyCode(coupon.code)}>
            <Copy className="mr-2 h-3.5 w-3.5" />
            Copy code
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openEdit(coupon)}>
            <Pencil className="mr-2 h-3.5 w-3.5" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onClick={() => setDeleteTarget(coupon)}
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className={dashboardStack}>
      {coupons.length > 0 || hasFilters ? (
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {statItems.map((stat) => (
            <div key={stat.label} className={cn(dashboardCard, "px-3.5 py-3")}>
              <p className={dashboardKicker}>{stat.label}</p>
              <p className={cn(dashboardMetric, "mt-1 truncate")}>{stat.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      {coupons.length === 0 && !hasFilters ? (
        <ProductsEmptyState
          icon={Tag}
          title="No discount codes yet"
          description="Create promo codes customers can enter at checkout — percentage or fixed amount, with optional limits and expiry."
          action={
            <Button type="button" onClick={openCreate} className={primaryBtnClass}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Create discount
            </Button>
          }
          tips={[
            {
              step: "01",
              title: "Pick a code",
              body: "Use a short memorable code like SUMMER20 or WELCOME10.",
            },
            {
              step: "02",
              title: "Set the offer",
              body: "Choose percentage or fixed amount, plus min purchase if needed.",
            },
            {
              step: "03",
              title: "Share at checkout",
              body: "Customers apply the code on your storefront checkout page.",
            },
          ]}
        />
      ) : filtered.length === 0 ? (
        <div className={cn(dashboardCard, "overflow-hidden")}>
          <div className="flex flex-col gap-2.5 border-b border-black/[0.05] px-4 py-3 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className={dashboardTitle}>Discount codes</h2>
              <p className={dashboardSubtitle}>No codes match your filters</p>
            </div>
            {toolbar}
          </div>
          <ProductsEmptyState
            icon={CircleOff}
            title="No matches"
            description="Try another search or clear filters."
            action={
              <Button
                type="button"
                variant="outline"
                className="h-8 rounded-md border-black/[0.06] px-3 text-[12px] dark:border-white/10"
                onClick={clearFilters}
              >
                Clear filters
              </Button>
            }
            embedded
          />
        </div>
      ) : (
        <div className={cn(dashboardCard, "overflow-hidden")}>
          <div className="flex flex-col gap-2.5 border-b border-black/[0.05] px-4 py-3 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className={dashboardTitle}>
                Discount codes
                <span className="ml-1.5 font-normal text-neutral-400">
                  {filtered.length}
                </span>
              </h2>
              <p className={dashboardSubtitle}>
                Copy, edit, or delete from ···
              </p>
            </div>
            {toolbar}
          </div>

          {/* Mobile */}
          <div className="divide-y divide-black/[0.04] dark:divide-white/5 md:hidden">
            {filtered.map((coupon) => {
              const status = getCouponStatus(coupon);
              return (
                <div key={coupon.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => void copyCode(coupon.code)}
                        className="group/code inline-flex max-w-full items-center gap-1.5 rounded-md px-0.5 py-0.5 text-left"
                        title="Copy code"
                      >
                        <span className="truncate font-mono text-[12px] font-semibold text-neutral-900 dark:text-white">
                          {coupon.code}
                        </span>
                        <Copy className="h-3 w-3 shrink-0 text-neutral-400 opacity-0 transition group-hover/code:opacity-100" />
                      </button>
                      <p className="mt-0.5 text-[11px] text-neutral-500">
                        {formatDiscount(coupon, currency)}
                        {" · "}
                        {coupon.usedCount}
                        {coupon.usageLimit != null
                          ? ` / ${coupon.usageLimit}`
                          : ""}{" "}
                        used
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <StatusBadge status={status} />
                        {coupon.expiresAt ? (
                          <span className="text-[10px] text-neutral-400">
                            Expires{" "}
                            {new Date(coupon.expiresAt).toLocaleDateString()}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <RowActions coupon={coupon} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-black/[0.05] text-left text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-400 dark:border-white/10">
                  <th className="px-4 py-2.5">Code</th>
                  <th className="px-4 py-2.5">Discount</th>
                  <th className="px-4 py-2.5">Rules</th>
                  <th className="px-4 py-2.5">Used</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right"> </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((coupon) => {
                  const status = getCouponStatus(coupon);
                  return (
                    <tr
                      key={coupon.id}
                      className="border-b border-black/[0.04] last:border-0 transition-colors duration-150 hover:bg-[#F5F5F7]/80 dark:border-white/5 dark:hover:bg-white/[0.03]"
                    >
                      <td className="px-4 py-2.5">
                        <button
                          type="button"
                          onClick={() => void copyCode(coupon.code)}
                          className="group/code inline-flex max-w-full items-center gap-1.5 rounded-md px-1 py-0.5 text-left transition hover:bg-black/[0.04]"
                          title="Copy code"
                        >
                          <span className="truncate font-mono text-[12px] font-semibold text-neutral-900 dark:text-white">
                            {coupon.code}
                          </span>
                          <Copy className="h-3 w-3 shrink-0 text-neutral-400 opacity-0 transition group-hover/code:opacity-100" />
                        </button>
                      </td>
                      <td className="px-4 py-2.5 font-medium tabular-nums text-neutral-900 dark:text-white">
                        {formatDiscount(coupon, currency)}
                      </td>
                      <td className="px-4 py-2.5 text-[11px] text-neutral-400">
                        {coupon.minPurchase != null ? (
                          <span className="block">
                            Min {formatCurrency(coupon.minPurchase, currency)}
                          </span>
                        ) : null}
                        {coupon.expiresAt ? (
                          <span className="block">
                            Expires{" "}
                            {new Date(coupon.expiresAt).toLocaleDateString()}
                          </span>
                        ) : null}
                        {!coupon.minPurchase && !coupon.expiresAt ? "—" : null}
                      </td>
                      <td className="px-4 py-2.5 tabular-nums text-neutral-500">
                        {coupon.usedCount}
                        {coupon.usageLimit != null
                          ? ` / ${coupon.usageLimit}`
                          : ""}
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={status} />
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <RowActions coupon={coupon} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <DiscountSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setEditing(null);
        }}
        currency={currency}
        editing={editing}
        onSaved={(coupon, mode) => {
          if (mode === "update") {
            setCoupons((prev) =>
              prev.map((c) => (c.id === coupon.id ? coupon : c))
            );
          } else {
            setCoupons((prev) => [coupon, ...prev]);
          }
        }}
      />

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="max-w-sm rounded-xl border-black/[0.06] p-0 dark:border-white/10 sm:rounded-xl">
          <DialogHeader className="border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
            <DialogTitle className="text-[14px]">Delete discount?</DialogTitle>
            <DialogDescription className="text-[12px]">
              {deleteTarget ? (
                <>
                  Remove{" "}
                  <span className="font-mono font-medium text-neutral-700 dark:text-neutral-200">
                    {deleteTarget.code}
                  </span>
                  . Customers will no longer be able to use it at checkout.
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-1.5 border-t border-black/[0.05] px-4 py-3 dark:border-white/10 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              className="h-8 rounded-md border-black/[0.06] px-3 text-[12px] dark:border-white/10"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-8 rounded-md bg-red-600 px-3 text-[12px] text-white shadow-none [background-image:none] hover:scale-100 hover:bg-red-700 hover:shadow-none"
              loading={deleting}
              onClick={() => void handleDelete()}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
