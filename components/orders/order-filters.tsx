"use client";

import { Search, Calendar, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ORDER_STATUSES } from "@/types/orders";
import { cn } from "@/lib/utils";

export interface OrderFilters {
  status: string;
  dateFrom: string;
  dateTo: string;
  search: string;
}

interface OrderFiltersBarProps {
  filters: OrderFilters;
  onChange: (filters: OrderFilters) => void;
  compact?: boolean;
}

const controlClass =
  "h-7 rounded-md border-black/[0.06] bg-[#F5F5F7] text-[12px] shadow-none focus-visible:ring-1 focus-visible:ring-[#007AFF]/30 dark:border-white/10 dark:bg-white/[0.05]";

export function OrderFiltersBar({ filters, onChange, compact }: OrderFiltersBarProps) {
  const update = (partial: Partial<OrderFilters>) => {
    onChange({ ...filters, ...partial });
  };

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            placeholder="Search…"
            className="h-7 w-36 rounded-md border border-black/[0.06] bg-[#F5F5F7] pl-7 pr-2.5 text-[12px] outline-none transition-colors focus:ring-1 focus:ring-[#007AFF]/30 sm:w-48 dark:border-white/10 dark:bg-white/[0.05]"
          />
        </div>
        <Select value={filters.status} onValueChange={(v) => update({ status: v })}>
          <SelectTrigger className={cn(controlClass, "w-[130px]")}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ORDER_STATUSES.filter((s) => s.value !== "draft").map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="hidden items-center gap-1 md:flex">
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => update({ dateFrom: e.target.value })}
            className={cn(controlClass, "w-[120px]")}
          />
          <span className="text-[10px] text-neutral-400">–</span>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => update({ dateTo: e.target.value })}
            className={cn(controlClass, "w-[120px]")}
          />
        </div>
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-black/[0.06] text-neutral-400 transition-colors hover:text-neutral-700 md:hidden dark:border-white/10"
          aria-label="Date filters"
        >
          <Calendar className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative max-w-sm flex-1">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
        <Input
          placeholder="Search by order #, name, email, or phone…"
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          className={cn(controlClass, "pl-8")}
        />
      </div>

      <Select value={filters.status} onValueChange={(v) => update({ status: v })}>
        <SelectTrigger className={cn(controlClass, "w-full lg:w-[160px]")}>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {ORDER_STATUSES.filter((s) => s.value !== "draft").map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1.5">
        <Calendar className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
        <div className="flex items-center gap-1.5">
          <div>
            <Label htmlFor="dateFrom" className="sr-only">
              From
            </Label>
            <Input
              id="dateFrom"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => update({ dateFrom: e.target.value })}
              className={cn(controlClass, "w-[130px]")}
            />
          </div>
          <span className="text-[11px] text-neutral-400">to</span>
          <div>
            <Label htmlFor="dateTo" className="sr-only">
              To
            </Label>
            <Input
              id="dateTo"
              type="date"
              value={filters.dateTo}
              onChange={(e) => update({ dateTo: e.target.value })}
              className={cn(controlClass, "w-[130px]")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function OrderFiltersToggle({ active }: { active: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-md border border-black/[0.06] text-neutral-400 transition-colors hover:text-neutral-700 dark:border-white/10",
        active && "bg-[#F5F5F7] text-neutral-700 dark:bg-white/10 dark:text-white"
      )}
      aria-label="Filters"
    >
      <SlidersHorizontal className="h-3.5 w-3.5" />
    </button>
  );
}
