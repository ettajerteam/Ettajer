"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  FilePlus2,
  Mail,
  MoreHorizontal,
  Search,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import {
  dashboardCard,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import type { AbandonedCheckoutRow } from "@/lib/abandoned";

interface AbandonedClientProps {
  initial: AbandonedCheckoutRow[];
  currency: string;
  storeSlug?: string;
}

function AbandonedEmptyState({ storeSlug }: { storeSlug?: string }) {
  const storeHref = storeSlug ? `/store/${storeSlug}` : null;

  return (
    <div className={cn(dashboardCard, "overflow-hidden")}>
      <div className="px-6 py-10 text-center sm:px-10 sm:py-12">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5F5F7] dark:bg-white/[0.06]">
          <ShoppingCart className="h-5 w-5 text-neutral-400" />
        </div>
        <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
          No abandoned checkouts
        </h3>
        <p className="mx-auto mt-2 max-w-md text-[12px] leading-relaxed text-neutral-400">
          When a shopper enters their details and leaves before paying, their cart
          shows up here so you can recover the sale.
        </p>
        {storeHref ? (
          <Button
            asChild
            variant="outline"
            className="mt-5 h-8 rounded-md border-black/[0.06] px-3 text-[12px] dark:border-white/10"
          >
            <Link href={storeHref} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Open storefront
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-px border-t border-black/[0.05] bg-black/[0.04] dark:border-white/10 dark:bg-white/[0.06] sm:grid-cols-3">
        {[
          {
            step: "01",
            title: "Customer starts checkout",
            body: "Email or phone is entered on your store checkout.",
          },
          {
            step: "02",
            title: "They leave unfinished",
            body: "Cart is saved automatically if payment isn’t completed.",
          },
          {
            step: "03",
            title: "You recover the sale",
            body: "Send a recovery email or turn the cart into a draft order.",
          },
        ].map((tip) => (
          <div
            key={tip.step}
            className="bg-white px-5 py-4 text-left dark:bg-[#1C1C1E]"
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-300">
              {tip.step}
            </p>
            <p className={cn(dashboardTitle, "mt-1.5")}>{tip.title}</p>
            <p className={cn(dashboardSubtitle, "mt-1 leading-relaxed")}>{tip.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AbandonedClient({
  initial,
  currency,
  storeSlug,
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

  async function handleRecover(id: string) {
    setActionId(id);
    try {
      const res = await fetch(`/api/abandoned/${id}/recover-email`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? "Failed to send email");
      toast.success("Recovery email sent");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send email");
    } finally {
      setActionId(null);
    }
  }

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

  if (!loading && rows.length === 0 && !search) {
    return <AbandonedEmptyState storeSlug={storeSlug} />;
  }

  return (
    <div className={cn(dashboardCard, "overflow-hidden")}>
      <div className="flex flex-col gap-2.5 border-b border-black/[0.05] px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
        <h2 className={dashboardTitle}>
          Abandoned checkouts
          <span className="ml-1.5 font-normal text-neutral-400">
            {loading ? "…" : rows.length}
          </span>
        </h2>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email or name…"
            className="h-7 w-44 rounded-md border border-black/[0.06] bg-[#F5F5F7] pl-7 pr-2.5 text-[12px] outline-none focus:ring-1 focus:ring-[#007AFF]/30 sm:w-52 dark:border-white/10 dark:bg-white/[0.05]"
          />
        </div>
      </div>

      {loading ? (
        <div className="px-4 py-10 text-center text-[12px] text-neutral-400">
          Loading checkouts…
        </div>
      ) : rows.length === 0 ? (
        <div className="px-4 py-10 text-center text-[12px] text-neutral-400">
          No checkouts match “{search}”
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-black/[0.05] text-left text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-400 dark:border-white/10">
                <th className="px-4 py-2.5">Customer</th>
                <th className="px-4 py-2.5">Items</th>
                <th className="px-4 py-2.5">Cart value</th>
                <th className="hidden px-4 py-2.5 md:table-cell">Products</th>
                <th className="px-4 py-2.5">Last updated</th>
                <th className="px-4 py-2.5 text-right"> </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-black/[0.04] last:border-0 transition-colors duration-150 hover:bg-[#F5F5F7]/80 dark:border-white/5 dark:hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {row.customerName ?? "Guest"}
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      {row.email ?? "—"}
                      {row.phone ? ` · ${row.phone}` : ""}
                    </p>
                  </td>
                  <td className="px-4 py-2.5 text-neutral-500">{row.items.length}</td>
                  <td className="px-4 py-2.5 font-medium text-neutral-900 dark:text-white">
                    {formatCurrency(row.subtotal, currency)}
                  </td>
                  <td className="hidden max-w-[220px] px-4 py-2.5 md:table-cell">
                    <p className="truncate text-[10px] text-neutral-400">
                      {row.items.map((i) => i.title).join(", ") || "—"}
                    </p>
                  </td>
                  <td className="px-4 py-2.5 text-neutral-400">
                    <span suppressHydrationWarning>{formatDateTime(row.updatedAt)}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={actionId === row.id}
                          className="h-7 w-7 text-neutral-400"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          disabled={actionId === row.id}
                          onClick={() => void handleCreateDraft(row.id)}
                        >
                          <FilePlus2 className="mr-2 h-3.5 w-3.5" />
                          Create draft
                        </DropdownMenuItem>
                        {row.email ? (
                          <DropdownMenuItem
                            disabled={actionId === row.id}
                            onClick={() => void handleRecover(row.id)}
                          >
                            <Mail className="mr-2 h-3.5 w-3.5" />
                            Send recovery email
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          disabled={actionId === row.id}
                          className="text-red-600 focus:text-red-600"
                          onClick={() => void handleDelete(row.id)}
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
