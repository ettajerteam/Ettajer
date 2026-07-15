"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrdersStatGrid } from "@/components/orders/orders-stat-grid";
import { OrdersEmptyState } from "@/components/orders/orders-empty-state";
import { formatCurrency } from "@/lib/utils";
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
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<CustomerSort>("recent");
  const [loading, setLoading] = useState(false);

  const stats = useMemo(() => {
    const base = search.trim() || sort !== "recent" ? customers : initialCustomers;
    const total = base.length;
    const totalSpent = base.reduce((sum, c) => sum + c.totalSpent, 0);
    const avgPerCustomer = total > 0 ? totalSpent / total : 0;
    const totalOrders = base.reduce((sum, c) => sum + c.orderCount, 0);
    return { total, totalSpent, avgPerCustomer, totalOrders };
  }, [customers, initialCustomers, search, sort]);

  const fetchCustomers = useCallback(async (query: string, sortBy: CustomerSort) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("search", query);
      params.set("sort", sortBy);
      const res = await fetch(`/api/customers?${params.toString()}`);
      const data = await res.json();
      if (res.ok) setCustomers(data.customers);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasQuery = search.trim() !== "" || sort !== "recent";
      if (hasQuery) fetchCustomers(search, sort);
      else setCustomers(initialCustomers);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, sort, fetchCustomers, initialCustomers]);

  return (
    <div className="space-y-4">
      <OrdersStatGrid
        stats={[
          {
            icon: Users,
            label: "Total customers",
            value: stats.total.toLocaleString(),
          },
          {
            icon: Users,
            label: "Total spent",
            value: formatCurrency(stats.totalSpent, currency),
          },
          {
            icon: Users,
            label: "Avg. per customer",
            value: formatCurrency(stats.avgPerCustomer, currency),
          },
          {
            icon: Users,
            label: "Total orders",
            value: stats.totalOrders.toLocaleString(),
          },
        ]}
        columns={4}
      />

      <div className="premium-card overflow-hidden">
        <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">All customers</h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative max-w-sm flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="h-9 pl-9"
              />
            </div>
            <Select value={sort} onValueChange={(v) => setSort(v as CustomerSort)}>
              <SelectTrigger className="h-9 w-full rounded-xl sm:w-[180px]">
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
        </div>

        {loading ? (
          <div className="border-t border-border/80 px-6 py-10 text-center text-sm text-muted-foreground">
            Loading customers...
          </div>
        ) : customers.length === 0 ? (
          <div className="border-t border-border/80 px-6 py-10">
            <OrdersEmptyState
              icon={Users}
              title="No customers yet"
              description="Customers appear here automatically after their first order."
            />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Customer</th>
                    <th className="hidden px-6 py-3 font-medium sm:table-cell">Orders</th>
                    <th className="px-6 py-3 font-medium">Total spent</th>
                    <th className="hidden px-6 py-3 font-medium md:table-cell">Last order</th>
                    <th className="px-6 py-3 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer, index) => (
                    <motion.tr
                      key={customer.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="group border-b border-border/80 last:border-0 transition-colors duration-200 hover:bg-muted/35"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#007AFF]/10 text-sm font-bold text-[#007AFF]">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/dashboard/customers/${customer.id}`}
                              className="block truncate text-sm font-medium text-foreground transition-colors hover:text-[#007AFF]"
                            >
                              {customer.name}
                            </Link>
                            <p className="truncate text-xs text-muted-foreground">{customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-6 py-4 text-sm text-muted-foreground sm:table-cell">
                        {customer.orderCount}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        {formatCurrency(customer.totalSpent, currency)}
                      </td>
                      <td className="hidden px-6 py-4 text-sm text-muted-foreground md:table-cell">
                        {new Date(customer.lastOrderAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/customers/${customer.id}`}
                          className="text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
