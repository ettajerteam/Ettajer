"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CircleOff,
  Copy,
  Download,
  ListFilter,
  Mail,
  MoreHorizontal,
  PenLine,
  Search,
  Trash2,
  UserMinus,
  UserPlus,
  X,
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
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductsEmptyState } from "@/components/products/products-empty-state";
import { NewsletterComposeSheet } from "@/components/newsletter/newsletter-compose-sheet";
import { cn } from "@/lib/utils";
import {
  formatNewsletterSource,
  formatSubscriberStatusLabel,
  type NewsletterSendRow,
  type NewsletterSubscriberRow,
} from "@/lib/newsletter";

type StatusFilter =
  | "all"
  | "active"
  | "unsubscribed"
  | "bounced"
  | "complained";

interface NewsletterSubscribersClientProps {
  initial: NewsletterSubscriberRow[];
  initialSends?: NewsletterSendRow[];
  storeSlug: string;
  storeName: string;
  storePrimaryColor?: string | null;
  emailTemplates?: { id: string; name: string; subject: string }[];
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    unsubscribed:
      "bg-[#F5F5F7] text-neutral-500 dark:bg-white/[0.08] dark:text-neutral-400",
    bounced: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    complained: "bg-red-500/10 text-red-700 dark:text-red-400",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-medium",
        styles[status] ?? styles.unsubscribed
      )}
    >
      {formatSubscriberStatusLabel(status)}
    </span>
  );
}

function formatJoined(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function NewsletterSubscribersClient({
  initial,
  initialSends = [],
  storeSlug,
  storeName,
  storePrimaryColor,
  emailTemplates = [],
}: NewsletterSubscribersClientProps) {
  const [subscribers, setSubscribers] = useState(initial);
  const [sends, setSends] = useState(initialSends);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [composeOpen, setComposeOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<NewsletterSubscriberRow | null>(
    null
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setSubscribers(initial);
  }, [initial]);

  useEffect(() => {
    setSends(initialSends);
  }, [initialSends]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return subscribers.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (!q) return true;
      const source = (row.source ?? "").toLowerCase();
      return row.email.toLowerCase().includes(q) || source.includes(q);
    });
  }, [subscribers, search, statusFilter]);

  const hasFilters = Boolean(search.trim()) || statusFilter !== "all";

  const stats = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    let active = 0;
    let unsubscribed = 0;
    let bounced = 0;
    let complained = 0;
    let thisWeek = 0;
    for (const row of subscribers) {
      if (row.status === "active") active += 1;
      else if (row.status === "bounced") bounced += 1;
      else if (row.status === "complained") complained += 1;
      else unsubscribed += 1;
      if (new Date(row.createdAt).getTime() >= weekAgo) thisWeek += 1;
    }
    return {
      total: subscribers.length,
      active,
      unsubscribed,
      bounced,
      complained,
      thisWeek,
    };
  }, [subscribers]);

  const statItems = [
    { label: "Subscribers", value: stats.total.toLocaleString() },
    { label: "Active", value: stats.active.toLocaleString() },
    { label: "Unsubscribed", value: stats.unsubscribed.toLocaleString() },
    {
      label: "Suppressed",
      value: (stats.bounced + stats.complained).toLocaleString(),
    },
  ];

  async function copyEmail(email: string) {
    try {
      await navigator.clipboard.writeText(email);
      toast.success("Email copied");
    } catch {
      toast.error("Could not copy email");
    }
  }

  function exportCsv() {
    const rows = filtered.length ? filtered : subscribers;
    if (rows.length === 0) {
      toast.message("No subscribers to export");
      return;
    }
    const header = ["email", "status", "source", "joined"];
    const lines = [
      header.join(","),
      ...rows.map((row) =>
        [
          row.email,
          row.status,
          formatNewsletterSource(row.source),
          row.createdAt.slice(0, 10),
        ]
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${storeSlug}-newsletter.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} subscriber${rows.length === 1 ? "" : "s"}`);
  }

  async function setStatus(
    row: NewsletterSubscriberRow,
    status: "active" | "unsubscribed" | "bounced" | "complained"
  ) {
    setBusyId(row.id);
    try {
      const res = await fetch("/api/newsletter", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id, status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.message === "string" ? data.message : "Update failed"
        );
      }
      setSubscribers((prev) =>
        prev.map((s) => (s.id === row.id ? data.subscriber : s))
      );
      toast.success(
        status === "active"
          ? "Subscriber reactivated"
          : `Marked ${formatSubscriberStatusLabel(status).toLowerCase()}`
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/newsletter?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.message === "string" ? data.message : "Delete failed"
        );
      }
      setSubscribers((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      toast.success("Subscriber removed");
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
    { id: "unsubscribed", label: "Unsubscribed" },
    { id: "bounced", label: "Bounced" },
    { id: "complained", label: "Complained" },
  ];

  const activeStatusLabel =
    statusPills.find((p) => p.id === statusFilter)?.label ?? "All";

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          className="h-8 w-44 rounded-full border border-neutral-200 bg-white pl-8 pr-8 text-[12px] outline-none placeholder:text-neutral-400 focus:border-neutral-400 sm:w-52 dark:border-white/15 dark:bg-transparent"
        />
        {search ? (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-2 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100"
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </button>
        ) : null}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn(
              "relative h-8 w-8 rounded-full border-neutral-200 dark:border-white/15",
              statusFilter !== "all" &&
                "border-neutral-950 bg-neutral-950 text-white hover:bg-neutral-800 hover:text-white dark:border-white dark:bg-white dark:text-neutral-950",
            )}
            aria-label={`Filter by status: ${activeStatusLabel}`}
            title={`Status: ${activeStatusLabel}`}
          >
            <ListFilter className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44 text-[12px]">
          <DropdownMenuLabel className="text-[11px] text-neutral-400">
            Status
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            {statusPills.map((pill) => (
              <DropdownMenuRadioItem key={pill.id} value={pill.id}>
                {pill.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        type="button"
        variant="outline"
        className="h-8 rounded-full border-neutral-200 px-3 text-[12px] dark:border-white/15"
        onClick={exportCsv}
        disabled={subscribers.length === 0}
      >
        <Download className="mr-1 h-3 w-3" />
        Export
      </Button>

      <Button
        type="button"
        className="h-8 rounded-full bg-neutral-950 px-3 text-[12px] font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-950"
        onClick={() => setComposeOpen(true)}
        disabled={stats.active === 0}
        title={
          stats.active === 0 ? "Need at least one active subscriber" : undefined
        }
      >
        <PenLine className="mr-1 h-3 w-3" />
        Quick send
      </Button>
    </div>
  );

  function RowActions({ row }: { row: NewsletterSubscriberRow }) {
    const busy = busyId === row.id;
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md text-neutral-400 hover:text-neutral-700"
            disabled={busy}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 text-[12px]">
          <DropdownMenuItem onClick={() => void copyEmail(row.email)}>
            <Copy className="mr-2 h-3.5 w-3.5" />
            Copy email
          </DropdownMenuItem>
          {row.status === "active" ? (
            <>
              <DropdownMenuItem onClick={() => void setStatus(row, "unsubscribed")}>
                <UserMinus className="mr-2 h-3.5 w-3.5" />
                Mark unsubscribed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => void setStatus(row, "bounced")}>
                Mark bounced
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => void setStatus(row, "complained")}>
                Mark complained
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem onClick={() => void setStatus(row, "active")}>
              <UserPlus className="mr-2 h-3.5 w-3.5" />
              Reactivate (explicit)
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onClick={() => setDeleteTarget(row)}
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {subscribers.length > 0 || hasFilters ? (
        <div className="grid grid-cols-2 gap-x-8 gap-y-5 border-b border-neutral-100 pb-6 sm:grid-cols-4 dark:border-white/10">
          {statItems.map((stat) => (
            <div key={stat.label}>
              <p className="text-[11px] text-neutral-400">{stat.label}</p>
              <p className="mt-1 text-[22px] font-semibold tabular-nums tracking-[-0.04em] text-neutral-950 dark:text-white">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {subscribers.length === 0 && !hasFilters ? (
        <ProductsEmptyState
          icon={Mail}
          title="No subscribers yet"
          description="Add a Newsletter block in the theme builder. New signups show up here — then send from Campaigns."
          tips={[
            {
              step: "01",
              title: "Add a signup block",
              body: "Place a Newsletter section on your homepage.",
            },
            {
              step: "02",
              title: "Collect emails",
              body: "Visitors opt in from the storefront.",
            },
            {
              step: "03",
              title: "Send",
              body: "Turn on automations or send a campaign.",
            },
          ]}
        />
      ) : filtered.length === 0 ? (
        <div className="overflow-hidden rounded-2xl border border-neutral-100 dark:border-white/10">
          <div className="flex flex-col gap-3 border-b border-neutral-100 px-4 py-3 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] font-medium text-neutral-950 dark:text-white">
              No matches
            </p>
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
                className="h-8 rounded-full border-neutral-200 px-3 text-[12px] dark:border-white/15"
                onClick={clearFilters}
              >
                Clear filters
              </Button>
            }
            embedded
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-100 dark:border-white/10">
          <div className="flex flex-col gap-3 border-b border-neutral-100 px-4 py-3 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] font-medium text-neutral-950 dark:text-white">
              {filtered.length.toLocaleString()}
              <span className="ml-1.5 font-normal text-neutral-400">people</span>
            </p>
            {toolbar}
          </div>

          {/* Mobile */}
          <div className="divide-y divide-neutral-100 dark:divide-white/10 md:hidden">
            {filtered.map((row) => (
              <div key={row.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => void copyEmail(row.email)}
                      className="group/mail inline-flex max-w-full items-center gap-1.5 text-left"
                      title="Copy email"
                    >
                      <span className="truncate text-[13px] font-medium text-neutral-950 dark:text-white">
                        {row.email}
                      </span>
                      <Copy className="h-3 w-3 shrink-0 text-neutral-400 opacity-0 transition group-hover/mail:opacity-100" />
                    </button>
                    <p className="mt-0.5 text-[11px] text-neutral-400">
                      {formatNewsletterSource(row.source)}
                      {" · "}
                      {formatJoined(row.createdAt)}
                    </p>
                    <div className="mt-2">
                      <StatusBadge status={row.status} />
                    </div>
                  </div>
                  <RowActions row={row} />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-neutral-100 text-left text-[11px] text-neutral-400 dark:border-white/10">
                  <th className="px-4 py-2.5 font-medium">Email</th>
                  <th className="px-4 py-2.5 font-medium">Source</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Joined</th>
                  <th className="px-4 py-2.5 text-right"> </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-neutral-50 last:border-0 transition-colors hover:bg-neutral-50/80 dark:border-white/5 dark:hover:bg-white/[0.03]"
                  >
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => void copyEmail(row.email)}
                        className="group/mail inline-flex max-w-full items-center gap-1.5 text-left"
                        title="Copy email"
                      >
                        <span className="truncate font-medium text-neutral-950 dark:text-white">
                          {row.email}
                        </span>
                        <Copy className="h-3 w-3 shrink-0 text-neutral-400 opacity-0 transition group-hover/mail:opacity-100" />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-neutral-400">
                      {formatNewsletterSource(row.source)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3 text-neutral-400">
                      {formatJoined(row.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <RowActions row={row} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="max-w-sm rounded-xl border-black/[0.06] p-0 dark:border-white/10 sm:rounded-xl">
          <DialogHeader className="border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
            <DialogTitle className="text-[14px]">Delete subscriber?</DialogTitle>
            <DialogDescription className="text-[12px]">
              {deleteTarget ? (
                <>
                  Remove{" "}
                  <span className="font-medium text-neutral-700 dark:text-neutral-200">
                    {deleteTarget.email}
                  </span>{" "}
                  from your list. They can subscribe again from the storefront.
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

      <NewsletterComposeSheet
        open={composeOpen}
        onOpenChange={setComposeOpen}
        storeName={storeName}
        storeSlug={storeSlug}
        storePrimaryColor={storePrimaryColor}
        activeCount={stats.active}
        savedTemplates={emailTemplates}
        onSent={(send) => setSends((prev) => [send, ...prev].slice(0, 8))}
      />
    </div>
  );
}
