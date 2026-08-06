"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Copy,
  FileText,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { OrdersEmptyState } from "@/components/orders/orders-empty-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { dashboardCard, dashboardTitle } from "@/lib/dashboard-ui";
import type { DraftListItem } from "@/types/drafts";

interface DraftsClientProps {
  initialDrafts: DraftListItem[];
  currency: string;
}

export function DraftsClient({ initialDrafts, currency }: DraftsClientProps) {
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

  async function copyDraftNumber(orderNumber: string) {
    try {
      await navigator.clipboard.writeText(orderNumber);
      toast.success("Draft number copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  if (!loading && drafts.length === 0 && !search) {
    return (
      <OrdersEmptyState
        icon={FileText}
        title="No draft orders"
        description="Create a draft for phone, WhatsApp, or in-person sales — then convert it when ready."
        action={
          <Button
            asChild
            className="h-8 rounded-md bg-neutral-900 px-3 text-[12px] text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
          >
            <Link href="/dashboard/orders/drafts/new">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Create draft
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className={cn(dashboardCard, "overflow-hidden")}>
      <div className="flex flex-col gap-2.5 border-b border-black/[0.05] px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
        <h2 className={dashboardTitle}>
          Draft orders
          <span className="ml-1.5 font-normal text-neutral-400">
            {loading ? "…" : drafts.length}
          </span>
        </h2>
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search drafts…"
              className="h-7 w-36 rounded-md border border-black/[0.06] bg-[#F5F5F7] pl-7 pr-2.5 text-[12px] outline-none focus:ring-1 focus:ring-[#007AFF]/30 sm:w-44 dark:border-white/10 dark:bg-white/[0.05]"
            />
          </div>
          <Button
            asChild
            size="sm"
            className="h-7 rounded-md bg-neutral-900 px-2.5 text-[11px] text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
          >
            <Link href="/dashboard/orders/drafts/new">
              <Plus className="mr-1 h-3 w-3" />
              New draft
            </Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="px-4 py-10 text-center text-[12px] text-neutral-400">Loading drafts…</div>
      ) : drafts.length === 0 ? (
        <div className="px-4 py-10 text-center text-[12px] text-neutral-400">
          No drafts match “{search}”
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-black/[0.05] text-left text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-400 dark:border-white/10">
                <th className="px-4 py-2.5">Draft</th>
                <th className="px-4 py-2.5">Customer</th>
                <th className="px-4 py-2.5">Items</th>
                <th className="px-4 py-2.5">Total</th>
                <th className="hidden px-4 py-2.5 md:table-cell">Updated</th>
                <th className="px-4 py-2.5 text-right"> </th>
              </tr>
            </thead>
            <tbody>
              {drafts.map((draft) => (
                <tr
                  key={draft.id}
                  onClick={() => router.push(`/dashboard/orders/drafts/${draft.id}`)}
                  className="cursor-pointer border-b border-black/[0.04] last:border-0 transition-colors duration-150 hover:bg-[#F5F5F7]/80 dark:border-white/5 dark:hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {draft.orderNumber}
                    </p>
                  </td>
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {draft.customerName}
                    </p>
                    <p className="text-[10px] text-neutral-400">{draft.customerEmail}</p>
                  </td>
                  <td className="px-4 py-2.5 text-neutral-500">{draft.itemCount}</td>
                  <td className="px-4 py-2.5 font-medium text-neutral-900 dark:text-white">
                    {formatCurrency(draft.total, currency)}
                  </td>
                  <td className="hidden px-4 py-2.5 text-neutral-400 md:table-cell">
                    <span suppressHydrationWarning>{formatDate(draft.updatedAt)}</span>
                  </td>
                  <td
                    className="px-4 py-2.5 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={actionId === draft.id}
                          className="h-7 w-7 text-neutral-400"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          onClick={() => router.push(`/dashboard/orders/drafts/${draft.id}`)}
                        >
                          Open draft
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => void copyDraftNumber(draft.orderNumber)}>
                          <Copy className="mr-2 h-3.5 w-3.5" />
                          Copy number
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={actionId === draft.id}
                          onClick={() => void handleComplete(draft.id)}
                        >
                          <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                          Complete order
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          disabled={actionId === draft.id}
                          className="text-red-600 focus:text-red-600"
                          onClick={() => void handleDelete(draft.id)}
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Delete
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
