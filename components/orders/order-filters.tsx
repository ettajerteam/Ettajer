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

export function OrderFiltersBar({ filters, onChange, compact }: OrderFiltersBarProps) {
  const update = (partial: Partial<OrderFilters>) => {
    onChange({ ...filters, ...partial });
  };

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            placeholder="Search orders..."
            className="h-9 w-44 rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/30 sm:w-52"
          />
        </div>
        <Select value={filters.status} onValueChange={(v) => update({ status: v })}>
          <SelectTrigger className="h-9 w-[130px] rounded-lg border-border text-sm">
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
        <div className="hidden items-center gap-1.5 md:flex">
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => update({ dateFrom: e.target.value })}
            className="h-9 w-[130px] rounded-lg text-sm"
          />
          <span className="text-xs text-muted-foreground">–</span>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => update({ dateTo: e.target.value })}
            className="h-9 w-[130px] rounded-lg text-sm"
          />
        </div>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground md:hidden"
          aria-label="Date filters"
        >
          <Calendar className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by order # or customer email..."
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          className="pl-10"
        />
      </div>

      <Select value={filters.status} onValueChange={(v) => update({ status: v })}>
        <SelectTrigger className="w-full lg:w-[180px]">
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

      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="flex items-center gap-2">
          <div>
            <Label htmlFor="dateFrom" className="sr-only">From</Label>
            <Input
              id="dateFrom"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => update({ dateFrom: e.target.value })}
              className="w-[140px]"
            />
          </div>
          <span className="text-muted-foreground text-sm">to</span>
          <div>
            <Label htmlFor="dateTo" className="sr-only">To</Label>
            <Input
              id="dateTo"
              type="date"
              value={filters.dateTo}
              onChange={(e) => update({ dateTo: e.target.value })}
              className="w-[140px]"
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
        "flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground",
        active && "bg-muted text-foreground"
      )}
      aria-label="Filters"
    >
      <SlidersHorizontal className="h-4 w-4" />
    </button>
  );
}
