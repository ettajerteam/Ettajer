"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { AdminUserActions } from "@/components/admin/admin-user-actions";
import { AdminTableShell } from "@/components/admin/admin-ui";

export interface AdminUserRow {
  id: string;
  email: string;
  name: string | null;
  status: string;
  role: string;
  founderNumber: number | null;
  emailVerified: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  storeCount: number;
}

function formatDate(value: Date | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function AdminUsersTable({ users }: { users: AdminUserRow[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "waiting">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((user) => {
      if (statusFilter !== "all" && user.status !== statusFilter) return false;
      if (!q) return true;
      return (
        user.email.toLowerCase().includes(q) ||
        (user.name?.toLowerCase().includes(q) ?? false) ||
        String(user.founderNumber ?? "").includes(q)
      );
    });
  }, [users, query, statusFilter]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, or founder #"
          className="max-w-md"
        />
        <div className="flex gap-1 rounded-lg border border-neutral-200/80 bg-white p-0.5 dark:border-white/10 dark:bg-[#161616]">
          {(["all", "active", "waiting"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                statusFilter === value
                  ? "bg-violet-600 text-white"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-neutral-500">
        Showing {filtered.length} of {users.length} users
      </p>

      <AdminTableShell>
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="border-b bg-neutral-50/80 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Founder #</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Stores</th>
              <th className="px-4 py-3 font-medium">Last login</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                  No users match your filters
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} className="border-b last:border-0 align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium">{user.name ?? "—"}</p>
                    <p className="text-xs text-neutral-500">{user.email}</p>
                    {!user.emailVerified ? (
                      <p className="text-[11px] text-amber-600">Email not verified</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{user.founderNumber ?? "—"}</td>
                  <td className="px-4 py-3">{user.status}</td>
                  <td className="px-4 py-3">{user.storeCount}</td>
                  <td className="px-4 py-3 text-xs">{formatDate(user.lastLoginAt)}</td>
                  <td className="px-4 py-3 text-xs">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    <AdminUserActions userId={user.id} status={user.status} role={user.role} />
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
