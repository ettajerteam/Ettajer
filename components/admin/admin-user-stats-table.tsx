"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatFounderNumber } from "@/lib/founder/constants";
import type { UserStatRow } from "@/lib/admin/user-stats";
import {
  AdminFilterBar,
  AdminFilterPill,
  AdminMeta,
  AdminTableShell,
  adminTd,
  adminTh,
  adminThead,
  adminTr,
} from "@/components/admin/admin-ui";
import { cn } from "@/lib/utils";

type CardFilter = "all" | "with" | "without";
type PlanFilter = "all" | "free" | "paid";

function formatDate(value: string | Date | null, withTime = false) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime
      ? { hour: "2-digit", minute: "2-digit" as const }
      : {}),
  });
}

function CardBadge({ hasCard }: { hasCard: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex min-w-[2.5rem] justify-center rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
        hasCard
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
          : "bg-neutral-100 text-neutral-500 dark:bg-white/10 dark:text-neutral-400",
      )}
      title={hasCard ? "Founder card assigned" : "No founder card"}
    >
      {hasCard ? "Yes" : "No"}
    </span>
  );
}

export function AdminUserStatsTable({
  users,
}: {
  users: UserStatRow[];
}) {
  const router = useRouter();
  const [cardFilter, setCardFilter] = useState<CardFilter>("all");
  const [planFilter, setPlanFilter] = useState<PlanFilter>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (cardFilter === "with" && !u.hasCard) return false;
      if (cardFilter === "without" && u.hasCard) return false;
      if (planFilter === "free" && u.plan !== "free") return false;
      if (planFilter === "paid" && u.plan === "free") return false;
      if (!q) return true;
      return (
        u.email.toLowerCase().includes(q) ||
        (u.name?.toLowerCase().includes(q) ?? false) ||
        String(u.founderNumber ?? "").includes(q) ||
        u.plan.toLowerCase().includes(q)
      );
    });
  }, [users, cardFilter, planFilter, query]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email, plan, founder #"
          className="h-9 w-full max-w-md rounded-lg border border-black/[0.06] bg-white px-3 text-[12px] outline-none transition focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/15 dark:border-white/10 dark:bg-[#1C1C1E]"
        />
      </div>

      <AdminFilterBar>
        {(
          [
            ["all", "All cards"],
            ["with", "Has card"],
            ["without", "No card"],
          ] as const
        ).map(([value, label]) => (
          <AdminFilterPill
            key={value}
            active={cardFilter === value}
            onClick={() => setCardFilter(value)}
          >
            {label}
          </AdminFilterPill>
        ))}
      </AdminFilterBar>

      <AdminFilterBar>
        {(
          [
            ["all", "All plans"],
            ["free", "Free"],
            ["paid", "Paid"],
          ] as const
        ).map(([value, label]) => (
          <AdminFilterPill
            key={value}
            active={planFilter === value}
            onClick={() => setPlanFilter(value)}
          >
            {label}
          </AdminFilterPill>
        ))}
      </AdminFilterBar>

      <AdminMeta>
        Showing {filtered.length} of {users.length} users whose first free month
        ended — click a row for the profile
      </AdminMeta>

      <AdminTableShell>
        <table className="w-full min-w-[960px] text-left text-[12px]">
          <thead className={adminThead}>
            <tr>
              <th className={adminTh}>Card</th>
              <th className={adminTh}>User</th>
              <th className={adminTh}>Plan</th>
              <th className={adminTh}>Founder #</th>
              <th className={adminTh}>Trial ended</th>
              <th className={adminTh}>Days past</th>
              <th className={adminTh}>Stores</th>
              <th className={adminTh}>Last login</th>
              <th className={adminTh}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-8 text-center text-neutral-400"
                >
                  No users match your filters
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr
                  key={user.id}
                  role="link"
                  tabIndex={0}
                  onClick={() => router.push(`/admin/users/${user.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/admin/users/${user.id}`);
                    }
                  }}
                  className={cn(
                    adminTr,
                    "cursor-pointer outline-none focus-visible:bg-[#007AFF]/5",
                  )}
                >
                  <td className={adminTd}>
                    <CardBadge hasCard={user.hasCard} />
                  </td>
                  <td className={adminTd}>
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="font-medium text-neutral-900 hover:text-[#007AFF] dark:text-white"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {user.name || "—"}
                    </Link>
                    <p className="truncate text-[11px] text-neutral-400">
                      {user.email}
                    </p>
                  </td>
                  <td className={cn(adminTd, "capitalize")}>{user.plan}</td>
                  <td className={adminTd}>
                    {user.founderNumber != null
                      ? formatFounderNumber(user.founderNumber)
                      : "—"}
                  </td>
                  <td className={cn(adminTd, "text-[11px] text-neutral-500")}>
                    {formatDate(user.trialEndedAt)}
                  </td>
                  <td className={cn(adminTd, "tabular-nums")}>
                    {user.daysPastTrial}d
                  </td>
                  <td className={cn(adminTd, "tabular-nums")}>
                    {user.storeCount}
                    <p className="text-[10px] text-neutral-400">
                      {user.productCount} products · {user.orderCount} orders
                    </p>
                  </td>
                  <td className={cn(adminTd, "text-[11px] text-neutral-400")}>
                    {formatDate(user.lastLoginAt, true)}
                  </td>
                  <td className={cn(adminTd, "text-[11px] text-neutral-400")}>
                    {formatDate(user.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </AdminTableShell>
    </div>
  );
}
