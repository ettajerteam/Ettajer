"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import { AdminUserActions } from "@/components/admin/admin-user-actions";
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
import { formatFounderNumber } from "@/lib/founder/constants";
import { cn } from "@/lib/utils";
import {
  homeCard,
  homeCardPad,
  homeKicker,
  homeMetric,
  homeSubtitle,
} from "@/components/dashboard/home/home-ui";

export interface AdminUserRow {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  status: string;
  role: string;
  founderNumber: number | null;
  emailVerified: string | Date | null;
  lastLoginAt: string | Date | null;
  lastLoginIp: string | null;
  failedLoginAttempts: number;
  lockedUntil: string | Date | null;
  createdAt: string | Date;
  storeCount: number;
  productCount: number;
  orderCount: number;
}

type StatusFilter = "all" | "active" | "waiting" | "locked" | "unverified";
type RoleFilter = "all" | "merchant" | "admin" | "founder";
type SortKey =
  | "newest"
  | "oldest"
  | "name"
  | "stores"
  | "lastLogin"
  | "founder";

function formatDate(value: string | Date | null, withTime = false) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(value));
}

function toTime(value: string | Date | null) {
  if (!value) return 0;
  return new Date(value).getTime();
}

function isLocked(user: AdminUserRow) {
  return Boolean(user.lockedUntil && new Date(user.lockedUntil) > new Date());
}

function initials(user: AdminUserRow) {
  return (user.name || user.email)
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name", label: "Name A–Z" },
  { value: "stores", label: "Most stores" },
  { value: "lastLogin", label: "Recent login" },
  { value: "founder", label: "Founder #" },
];

function StatusBadge({ user }: { user: AdminUserRow }) {
  if (isLocked(user)) {
    return (
      <span className="inline-flex rounded bg-rose-50 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
        Locked
      </span>
    );
  }
  if (user.status === "waiting") {
    return (
      <span className="inline-flex rounded bg-amber-50 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
        Waiting
      </span>
    );
  }
  return (
    <span className="inline-flex rounded bg-emerald-50 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
      Active
    </span>
  );
}

export function AdminUsersTable({ users }: { users: AdminUserRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [sort, setSort] = useState<SortKey>("newest");

  const stats = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return {
      total: users.length,
      active: users.filter((u) => u.status === "active" && !isLocked(u)).length,
      waiting: users.filter((u) => u.status === "waiting").length,
      founders: users.filter((u) => u.founderNumber != null).length,
      admins: users.filter((u) => u.role === "admin").length,
      unverified: users.filter((u) => !u.emailVerified).length,
      new7d: users.filter((u) => toTime(u.createdAt) >= weekAgo).length,
      neverLogin: users.filter((u) => !u.lastLoginAt).length,
    };
  }, [users]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = users.filter((user) => {
      if (statusFilter === "active" && (user.status !== "active" || isLocked(user)))
        return false;
      if (statusFilter === "waiting" && user.status !== "waiting") return false;
      if (statusFilter === "locked" && !isLocked(user)) return false;
      if (statusFilter === "unverified" && user.emailVerified) return false;

      if (roleFilter === "admin" && user.role !== "admin") return false;
      if (roleFilter === "merchant" && user.role === "admin") return false;
      if (roleFilter === "founder" && user.founderNumber == null) return false;

      if (!q) return true;
      return (
        user.email.toLowerCase().includes(q) ||
        (user.name?.toLowerCase().includes(q) ?? false) ||
        String(user.founderNumber ?? "").includes(q) ||
        (user.lastLoginIp?.includes(q) ?? false)
      );
    });

    rows = [...rows].sort((a, b) => {
      switch (sort) {
        case "oldest":
          return toTime(a.createdAt) - toTime(b.createdAt);
        case "name":
          return (a.name || a.email).localeCompare(b.name || b.email);
        case "stores":
          return (
            b.storeCount - a.storeCount || toTime(b.createdAt) - toTime(a.createdAt)
          );
        case "lastLogin":
          return toTime(b.lastLoginAt) - toTime(a.lastLoginAt);
        case "founder":
          return (a.founderNumber ?? 999999) - (b.founderNumber ?? 999999);
        case "newest":
        default:
          return toTime(b.createdAt) - toTime(a.createdAt);
      }
    });

    return rows;
  }, [users, query, statusFilter, roleFilter, sort]);

  function openProfile(userId: string) {
    router.push(`/admin/users/${userId}`);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        <div className={cn(homeCard, homeCardPad)}>
          <p className={homeKicker}>Total users</p>
          <p className={cn(homeMetric, "mt-1")}>{stats.total}</p>
          <p className={cn(homeSubtitle, "mt-1.5")}>+{stats.new7d} last 7 days</p>
        </div>
        <div className={cn(homeCard, homeCardPad)}>
          <p className={homeKicker}>Active / waiting</p>
          <p className={cn(homeMetric, "mt-1 text-[#007AFF]")}>
            {stats.active} / {stats.waiting}
          </p>
          <p className={cn(homeSubtitle, "mt-1.5")}>
            {stats.neverLogin} never logged in
          </p>
        </div>
        <div className={cn(homeCard, homeCardPad)}>
          <p className={homeKicker}>Founders</p>
          <p className={cn(homeMetric, "mt-1")}>{stats.founders}</p>
          <p className={cn(homeSubtitle, "mt-1.5")}>{stats.admins} platform admins</p>
        </div>
        <div className={cn(homeCard, homeCardPad)}>
          <p className={homeKicker}>Unverified email</p>
          <p
            className={cn(
              homeMetric,
              "mt-1",
              stats.unverified > 0 ? "text-amber-700 dark:text-amber-400" : ""
            )}
          >
            {stats.unverified}
          </p>
          <p className={cn(homeSubtitle, "mt-1.5")}>Need attention</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, founder #, or IP"
            className="h-9 w-full rounded-lg border border-black/[0.06] bg-white pl-8 pr-3 text-[12px] outline-none transition focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/15 dark:border-white/10 dark:bg-[#1C1C1E]"
          />
        </div>
        <label className="flex items-center gap-2 text-[11px] text-neutral-500">
          <span className="shrink-0">Sort</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-9 rounded-lg border border-black/[0.06] bg-white px-2.5 text-[11px] font-medium text-neutral-800 outline-none focus:border-[#007AFF] dark:border-white/10 dark:bg-[#1C1C1E] dark:text-neutral-200"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <AdminFilterBar>
          {(
            [
              ["all", "All"],
              ["active", "Active"],
              ["waiting", "Waiting"],
              ["locked", "Locked"],
              ["unverified", "Unverified"],
            ] as const
          ).map(([value, label]) => (
            <AdminFilterPill
              key={value}
              active={statusFilter === value}
              onClick={() => setStatusFilter(value)}
            >
              {label}
            </AdminFilterPill>
          ))}
        </AdminFilterBar>
        <AdminFilterBar>
          {(
            [
              ["all", "All roles"],
              ["merchant", "Merchants"],
              ["founder", "Founders"],
              ["admin", "Admins"],
            ] as const
          ).map(([value, label]) => (
            <AdminFilterPill
              key={value}
              active={roleFilter === value}
              onClick={() => setRoleFilter(value)}
            >
              {label}
            </AdminFilterPill>
          ))}
        </AdminFilterBar>
      </div>

      <AdminMeta>
        Showing {filtered.length} of {users.length} users — click a row to open
        the profile
      </AdminMeta>

      <AdminTableShell>
        <table className="w-full min-w-[1080px] text-left text-[12px]">
          <thead className={adminThead}>
            <tr>
              <th className={adminTh}>User</th>
              <th className={adminTh}>Founder</th>
              <th className={adminTh}>Status</th>
              <th className={adminTh}>Role</th>
              <th className={adminTh}>Stores</th>
              <th className={adminTh}>Catalog</th>
              <th className={adminTh}>Last login</th>
              <th className={adminTh}>Joined</th>
              <th className={adminTh}>Actions</th>
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
                  onClick={() => openProfile(user.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openProfile(user.id);
                    }
                  }}
                  className={cn(
                    adminTr,
                    "group cursor-pointer align-top outline-none focus-visible:bg-[#007AFF]/5"
                  )}
                >
                  <td className={adminTd}>
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#007AFF] text-[10px] font-semibold text-white">
                        {user.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          initials(user)
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="inline-flex items-center gap-1 font-medium text-neutral-900 group-hover:text-[#007AFF] dark:text-white">
                          <span className="truncate">{user.name ?? "—"}</span>
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition group-hover:opacity-100" />
                        </p>
                        <p className="truncate text-[11px] text-neutral-400">
                          {user.email}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {!user.emailVerified ? (
                            <span className="text-[10px] text-amber-600">
                              Unverified
                            </span>
                          ) : null}
                          {user.failedLoginAttempts > 0 ? (
                            <span className="text-[10px] text-rose-600">
                              {user.failedLoginAttempts} failed logins
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className={adminTd}>
                    {user.founderNumber != null
                      ? formatFounderNumber(user.founderNumber)
                      : "—"}
                  </td>
                  <td className={adminTd}>
                    <StatusBadge user={user} />
                  </td>
                  <td className={adminTd}>
                    <span
                      className={cn(
                        "inline-flex rounded px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide",
                        user.role === "admin"
                          ? "bg-[#007AFF]/10 text-[#007AFF]"
                          : "bg-black/[0.04] text-neutral-500 dark:bg-white/10 dark:text-neutral-300"
                      )}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className={cn(adminTd, "tabular-nums")}>{user.storeCount}</td>
                  <td className={adminTd}>
                    <p className="tabular-nums">{user.productCount} products</p>
                    <p className="text-[10px] text-neutral-400">
                      {user.orderCount} orders
                    </p>
                  </td>
                  <td className={cn(adminTd, "text-[11px] text-neutral-400")}>
                    <p>{formatDate(user.lastLoginAt, true)}</p>
                    {user.lastLoginIp ? (
                      <p className="font-mono text-[10px]">{user.lastLoginIp}</p>
                    ) : null}
                  </td>
                  <td className={cn(adminTd, "text-[11px] text-neutral-400")}>
                    {formatDate(user.createdAt)}
                  </td>
                  <td
                    className={adminTd}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <div className="flex flex-col items-start gap-1.5">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="inline-flex h-7 items-center rounded-md bg-[#007AFF] px-2.5 text-[11px] font-medium text-white transition hover:bg-[#0066D6]"
                      >
                        View profile
                      </Link>
                      <AdminUserActions
                        userId={user.id}
                        status={user.status}
                        role={user.role}
                      />
                    </div>
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
