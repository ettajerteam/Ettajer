"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  AdminFilterBar,
  AdminFilterPill,
  AdminMeta,
  AdminTableShell,
  adminHoverLink,
  adminLink,
  adminTd,
  adminTh,
  adminThead,
  adminTr,
} from "@/components/admin/admin-ui";
import { cn } from "@/lib/utils";

export interface AdminStoreRow {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  category: string | null;
  primaryColor: string | null;
  currency: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  lastOrderAt: string | Date | null;
  user: {
    id: string;
    email: string;
    name: string | null;
    founderNumber: number | null;
    status: string;
  };
  products: number;
  customers: number;
  realOrders: number;
  testOrders: number;
  totalOrders: number;
  realGmv: number;
  testGmv: number;
}

type SortKey =
  | "newest"
  | "oldest"
  | "orders"
  | "realOrders"
  | "products"
  | "gmv"
  | "name"
  | "lastOrder";

type ActivityFilter = "all" | "withOrders" | "noOrders" | "withProducts" | "empty";

function formatDate(value: string | Date | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function toTime(value: string | Date | null) {
  if (!value) return 0;
  return new Date(value).getTime();
}

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "orders", label: "Most orders" },
  { value: "realOrders", label: "Most real orders" },
  { value: "products", label: "Most products" },
  { value: "gmv", label: "Highest GMV" },
  { value: "lastOrder", label: "Latest order" },
  { value: "name", label: "Name A–Z" },
];

const ACTIVITY_OPTIONS: { value: ActivityFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "withOrders", label: "With orders" },
  { value: "noOrders", label: "No orders" },
  { value: "withProducts", label: "With products" },
  { value: "empty", label: "Empty" },
];

export function AdminStoresTable({ stores }: { stores: AdminStoreRow[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [activity, setActivity] = useState<ActivityFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = stores.filter((store) => {
      if (activity === "withOrders" && store.totalOrders === 0) return false;
      if (activity === "noOrders" && store.totalOrders > 0) return false;
      if (activity === "withProducts" && store.products === 0) return false;
      if (activity === "empty" && (store.products > 0 || store.totalOrders > 0))
        return false;

      if (!q) return true;
      return (
        store.name.toLowerCase().includes(q) ||
        store.slug.toLowerCase().includes(q) ||
        store.user.email.toLowerCase().includes(q) ||
        (store.user.name?.toLowerCase().includes(q) ?? false) ||
        (store.category?.toLowerCase().includes(q) ?? false)
      );
    });

    rows = [...rows].sort((a, b) => {
      switch (sort) {
        case "oldest":
          return toTime(a.createdAt) - toTime(b.createdAt);
        case "orders":
          return b.totalOrders - a.totalOrders || b.realGmv - a.realGmv;
        case "realOrders":
          return b.realOrders - a.realOrders || b.realGmv - a.realGmv;
        case "products":
          return b.products - a.products || a.name.localeCompare(b.name);
        case "gmv":
          return b.realGmv - a.realGmv || b.realOrders - a.realOrders;
        case "lastOrder":
          return toTime(b.lastOrderAt) - toTime(a.lastOrderAt);
        case "name":
          return a.name.localeCompare(b.name);
        case "newest":
        default:
          return toTime(b.createdAt) - toTime(a.createdAt);
      }
    });

    return rows;
  }, [stores, query, sort, activity]);

  const totals = useMemo(
    () => ({
      stores: filtered.length,
      products: filtered.reduce((n, s) => n + s.products, 0),
      realOrders: filtered.reduce((n, s) => n + s.realOrders, 0),
      testOrders: filtered.reduce((n, s) => n + s.testOrders, 0),
      realGmv: filtered.reduce((n, s) => n + s.realGmv, 0),
    }),
    [filtered]
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search store, slug, owner, or category"
          className="h-9 max-w-md rounded-lg border-black/[0.06] bg-white text-[12px] dark:border-white/10"
        />
        <div className="flex flex-wrap items-center gap-2">
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
      </div>

      <AdminFilterBar>
        {ACTIVITY_OPTIONS.map((opt) => (
          <AdminFilterPill
            key={opt.value}
            active={activity === opt.value}
            onClick={() => setActivity(opt.value)}
          >
            {opt.label}
          </AdminFilterPill>
        ))}
      </AdminFilterBar>

      <AdminMeta>
        Showing {filtered.length} of {stores.length} stores · {totals.products}{" "}
        products · {totals.realOrders} real / {totals.testOrders} test orders ·{" "}
        {totals.realGmv.toLocaleString()} real GMV
      </AdminMeta>

      <AdminTableShell>
        <table className="w-full min-w-[1180px] text-left text-[12px]">
          <thead className={adminThead}>
            <tr>
              <th className={adminTh}>Store</th>
              <th className={adminTh}>Owner</th>
              <th className={adminTh}>Products</th>
              <th className={adminTh}>Customers</th>
              <th className={adminTh}>Real orders</th>
              <th className={adminTh}>Test orders</th>
              <th className={adminTh}>Real GMV</th>
              <th className={adminTh}>Last order</th>
              <th className={adminTh}>Created</th>
              <th className={adminTh}>Link</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-8 text-center text-neutral-400"
                >
                  No stores match your filters
                </td>
              </tr>
            ) : (
              filtered.map((store) => (
                <tr key={store.id} className={cn(adminTr, "group align-top")}>
                  <td className={adminTd}>
                    <Link
                      href={`/admin/stores/${store.id}`}
                      className="flex items-start gap-3 rounded-md outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#007AFF]/40"
                    >
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl text-[11px] font-semibold text-white"
                        style={{
                          backgroundColor: store.primaryColor || "#007AFF",
                        }}
                      >
                        {store.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={store.logo}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          store.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <p
                          className={cn(
                            "inline-flex items-center gap-1 font-medium text-neutral-900 dark:text-white",
                            adminHoverLink
                          )}
                        >
                          <span className="truncate">{store.name}</span>
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition group-hover:opacity-100" />
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          /{store.slug}
                        </p>
                        <p className="mt-0.5 text-[10px] text-neutral-400">
                          {store.category || "No category"} · {store.currency}
                        </p>
                      </div>
                    </Link>
                  </td>
                  <td className={adminTd}>
                    <Link
                      href={`/admin/users/${store.user.id}`}
                      className="block rounded-md outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#007AFF]/40"
                    >
                      <p className="font-medium text-neutral-900 hover:text-[#007AFF] dark:text-white">
                        {store.user.name ?? "—"}
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        {store.user.email}
                      </p>
                      <p className="mt-0.5 text-[10px] capitalize text-neutral-400">
                        {store.user.status}
                        {store.user.founderNumber
                          ? ` · #${store.user.founderNumber}`
                          : ""}
                      </p>
                    </Link>
                  </td>
                  <td className={cn(adminTd, "tabular-nums")}>{store.products}</td>
                  <td className={cn(adminTd, "tabular-nums")}>
                    {store.customers}
                  </td>
                  <td className={adminTd}>
                    <p className="tabular-nums font-medium text-emerald-700">
                      {store.realOrders}
                    </p>
                    {store.testGmv > 0 || store.realOrders > 0 ? (
                      <p className="text-[10px] text-neutral-400">
                        of {store.totalOrders} total
                      </p>
                    ) : null}
                  </td>
                  <td className={cn(adminTd, "tabular-nums text-amber-700")}>
                    {store.testOrders}
                  </td>
                  <td className={adminTd}>
                    <p className="tabular-nums font-medium">
                      {store.realGmv.toLocaleString()} {store.currency}
                    </p>
                    {store.testGmv > 0 ? (
                      <p className="text-[10px] tabular-nums text-neutral-400">
                        test {store.testGmv.toLocaleString()}
                      </p>
                    ) : null}
                  </td>
                  <td className={cn(adminTd, "text-[11px] text-neutral-400")}>
                    {formatDate(store.lastOrderAt)}
                  </td>
                  <td className={cn(adminTd, "text-[11px] text-neutral-400")}>
                    {formatDate(store.createdAt)}
                  </td>
                  <td className={adminTd}>
                    <div className="flex flex-col gap-1">
                      <Link
                        href={`/admin/stores/${store.id}`}
                        className={cn(adminLink, "text-[11px] font-medium")}
                      >
                        View details
                      </Link>
                      <Link
                        href={`/store/${store.slug}`}
                        className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:underline"
                        target="_blank"
                      >
                        Storefront
                        <ExternalLink className="h-3 w-3" />
                      </Link>
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
