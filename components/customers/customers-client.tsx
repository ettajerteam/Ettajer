"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  X,
  MoreHorizontal,
  ChevronRight,
  Mail,
  CircleOff,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductsEmptyState } from "@/components/products/products-empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  dashboardCard,
  dashboardKicker,
  dashboardMetric,
  dashboardStack,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import type { CustomerListItem, CustomerSort } from "@/types/customers";

interface CustomersClientProps {
  initialCustomers: CustomerListItem[];
  currency: string;
}

const SORT_OPTIONS: { value: CustomerSort; label: string }[] = [
  { value: "recent", label: "Most recent" },
  { value: "spent", label: "Highest spend" },
  { value: "orders", label: "Most orders" },
  { value: "name", label: "Name (A–Z)" },
];

export function CustomersClient({ initialCustomers, currency }: CustomersClientProps) {
  const router = useRouter();
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<CustomerSort>("recent");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCustomers(initialCustomers);
  }, [initialCustomers]);

  const hasFilters = Boolean(search.trim()) || sort !== "recent";

  const stats = useMemo(() => {
    const total = customers.length;
    const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const avgPerCustomer = total > 0 ? totalSpent / total : 0;
    const totalOrders = customers.reduce((sum, c) => sum + c.orderCount, 0);
    return { total, totalSpent, avgPerCustomer, totalOrders };
  }, [customers]);

  const fetchCustomers = useCallback(async (query: string, sortBy: CustomerSort) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("search", query.trim());
      params.set("sort", sortBy);
      const res = await fetch(`/api/customers?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (res.ok) setCustomers(data.customers ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim() || sort !== "recent") {
        void fetchCustomers(search, sort);
      } else {
        setCustomers(initialCustomers);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [search, sort, fetchCustomers, initialCustomers]);

  async function copyEmail(email: string) {
    try {
      await navigator.clipboard.writeText(email);
      toast.success("Email copied");
    } catch {
      toast.error("Could not copy email");
    }
  }

  const statItems = [
    { label: "Customers", value: stats.total.toLocaleString() },
    { label: "Total spent", value: formatCurrency(stats.totalSpent, currency) },
    {
      label: "Avg. per customer",
      value: formatCurrency(stats.avgPerCustomer, currency),
    },
    { label: "Orders", value: stats.totalOrders.toLocaleString() },
  ];

  const toolbar = (
    <div className="flex flex-wrap items-center gap-1.5">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or email…"
          className="h-7 w-44 rounded-md border border-black/[0.06] bg-[#F5F5F7] pl-7 pr-7 text-[12px] outline-none focus:ring-1 focus:ring-[#007AFF]/30 sm:w-56 dark:border-white/10 dark:bg-white/[0.05]"
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
      <Select value={sort} onValueChange={(v) => setSort(v as CustomerSort)}>
        <SelectTrigger className="h-7 w-[140px] rounded-md border-black/[0.06] bg-white text-[12px] dark:border-white/10">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const showStats = customers.length > 0 || hasFilters;

  return (
    <div className={dashboardStack}>
      {showStats ? (
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {statItems.map((stat) => (
            <div key={stat.label} className={cn(dashboardCard, "px-3.5 py-3")}>
              <p className={dashboardKicker}>{stat.label}</p>
              <p className={cn(dashboardMetric, "mt-1 truncate")}>{stat.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      {loading && customers.length === 0 ? (
        <CustomersTableSkeleton toolbar={toolbar} />
      ) : customers.length === 0 && !hasFilters ? (
        <ProductsEmptyState
          icon={Users}
          title="No customers yet"
          description="Customers appear here automatically after their first order from your storefront."
          tips={[
            {
              step: "01",
              title: "Get an order",
              body: "Share your store link so shoppers can place their first purchase.",
            },
            {
              step: "02",
              title: "Profiles build themselves",
              body: "Name, email, and spend roll up from each completed order.",
            },
            {
              step: "03",
              title: "Follow up",
              body: "Open a customer to see order history and reach out by email or phone.",
            },
          ]}
        />
      ) : customers.length === 0 ? (
        <div className={cn(dashboardCard, "overflow-hidden")}>
          <div className="flex flex-col gap-2.5 border-b border-black/[0.05] px-4 py-3 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className={dashboardTitle}>Customers</h2>
              <p className={dashboardSubtitle}>No people match your search</p>
            </div>
            {toolbar}
          </div>
          <ProductsEmptyState
            icon={CircleOff}
            title="No matches"
            description="Try another name, email, or clear filters."
            action={
              <Button
                type="button"
                variant="outline"
                className="h-8 rounded-md border-black/[0.06] px-3 text-[12px] dark:border-white/10"
                onClick={() => {
                  setSearch("");
                  setSort("recent");
                }}
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
                Customers
                <span className="ml-1.5 font-normal text-neutral-400">
                  {loading ? "Updating…" : customers.length}
                </span>
              </h2>
              <p className={dashboardSubtitle}>People who have ordered from your store</p>
            </div>
            {toolbar}
          </div>

          {/* Mobile */}
          <div className="divide-y divide-black/[0.04] dark:divide-white/5 md:hidden">
            {customers.map((customer) => (
              <button
                key={customer.id}
                type="button"
                onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
                className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#F5F5F7]/80 dark:hover:bg-white/[0.03]"
              >
                <Avatar initial={customer.name.charAt(0)} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium text-neutral-900 dark:text-white">
                    {customer.name}
                  </p>
                  <p className="truncate text-[10px] text-neutral-400">{customer.email}</p>
                  <p className="mt-1 text-[10px] text-neutral-400">
                    {customer.orderCount} order{customer.orderCount === 1 ? "" : "s"} ·{" "}
                    {formatCurrency(customer.totalSpent, currency)}
                  </p>
                </div>
                <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-neutral-300" />
              </button>
            ))}
          </div>

          {/* Desktop */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-black/[0.05] text-left text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-400 dark:border-white/10">
                  <th className="px-4 py-2.5">Customer</th>
                  <th className="px-4 py-2.5">Orders</th>
                  <th className="px-4 py-2.5">Total spent</th>
                  <th className="px-4 py-2.5">Last order</th>
                  <th className="px-4 py-2.5 text-right"> </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
                    className="cursor-pointer border-b border-black/[0.04] last:border-0 transition-colors duration-150 hover:bg-[#F5F5F7]/80 dark:border-white/5 dark:hover:bg-white/[0.03]"
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Avatar initial={customer.name.charAt(0)} />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-neutral-900 dark:text-white">
                            {customer.name}
                          </p>
                          <p className="truncate text-[10px] text-neutral-400">
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-neutral-500">
                      {customer.orderCount}
                    </td>
                    <td className="px-4 py-2.5 font-medium tabular-nums text-neutral-900 dark:text-white">
                      {formatCurrency(customer.totalSpent, currency)}
                    </td>
                    <td className="px-4 py-2.5 text-neutral-400">
                      <span suppressHydrationWarning>
                        {formatDate(customer.lastOrderAt)}
                      </span>
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
                            className="h-7 w-7 text-neutral-400"
                            aria-label="Actions"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/customers/${customer.id}`}>
                              View customer
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => void copyEmail(customer.email)}>
                            <Mail className="mr-2 h-3.5 w-3.5" />
                            Copy email
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Avatar({ initial }: { initial: string }) {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F5F5F7] text-[11px] font-semibold text-neutral-600 dark:bg-white/[0.08] dark:text-neutral-300">
      {initial.toUpperCase()}
    </div>
  );
}

function CustomersTableSkeleton({ toolbar }: { toolbar: ReactNode }) {
  return (
    <div className={cn(dashboardCard, "overflow-hidden")}>
      <div className="flex flex-col gap-2.5 border-b border-black/[0.05] px-4 py-3 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3 w-40" />
        </div>
        {toolbar}
      </div>
      <div className="hidden md:block">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-black/[0.05] text-left text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-400 dark:border-white/10">
              <th className="px-4 py-2.5">Customer</th>
              <th className="px-4 py-2.5">Orders</th>
              <th className="px-4 py-2.5">Total spent</th>
              <th className="px-4 py-2.5">Last order</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr
                key={i}
                className="border-b border-black/[0.04] last:border-0 dark:border-white/5"
              >
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3.5 w-28" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <Skeleton className="h-3.5 w-8" />
                </td>
                <td className="px-4 py-2.5">
                  <Skeleton className="h-3.5 w-16" />
                </td>
                <td className="px-4 py-2.5">
                  <Skeleton className="h-3 w-20" />
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Skeleton className="ml-auto h-7 w-7 rounded-md" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="divide-y divide-black/[0.04] md:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-36" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
