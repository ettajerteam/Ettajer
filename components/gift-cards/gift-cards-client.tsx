"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GiftCardList } from "@/components/gift-cards/gift-card-list";
import { GiftCardSheet } from "@/components/gift-cards/gift-card-sheet";
import { cn, formatCurrency } from "@/lib/utils";
import {
  dashboardCard,
  dashboardKicker,
  dashboardMetric,
  dashboardPrimaryBtn,
  dashboardStack,
} from "@/lib/dashboard-ui";
import type { GiftCardItem } from "@/types/gift-cards";

interface GiftCardsClientProps {
  initial: GiftCardItem[];
  currency: string;
}

export function GiftCardsClient({ initial, currency }: GiftCardsClientProps) {
  const [cards, setCards] = useState(initial);
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    setCards(initial);
  }, [initial]);

  const display = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter((c) => c.code.toLowerCase().includes(q));
  }, [cards, search]);

  const hasFilters = Boolean(search.trim());

  const stats = useMemo(() => {
    let active = 0;
    let inactive = 0;
    let outstanding = 0;
    let issued = 0;
    for (const c of display) {
      if (c.active) active += 1;
      else inactive += 1;
      outstanding += Math.max(0, c.balance);
      issued += Math.max(0, c.initialBalance);
    }
    return { total: display.length, active, inactive, outstanding, issued };
  }, [display]);

  const statItems = [
    { label: "Gift cards", value: stats.total.toLocaleString() },
    { label: "Active", value: stats.active.toLocaleString() },
    {
      label: "Outstanding",
      value: formatCurrency(stats.outstanding, currency),
    },
    {
      label: "Issued value",
      value: formatCurrency(stats.issued, currency),
    },
  ];

  return (
    <div className={dashboardStack}>
      {cards.length > 0 || hasFilters ? (
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {statItems.map((stat) => (
            <div key={stat.label} className={cn(dashboardCard, "px-3.5 py-3")}>
              <p className={dashboardKicker}>{stat.label}</p>
              <p className={cn(dashboardMetric, "mt-1 truncate")}>{stat.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      <GiftCardList
        cards={display}
        currency={currency}
        hasFilters={hasFilters}
        onAdd={() => setSheetOpen(true)}
        onDeactivated={(id) =>
          setCards((prev) =>
            prev.map((c) => (c.id === id ? { ...c, active: false } : c))
          )
        }
        onClearFilters={() => setSearch("")}
        toolbar={
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search codes…"
                className="h-7 w-40 rounded-md border border-black/[0.06] bg-[#F5F5F7] pl-7 pr-7 text-[12px] outline-none focus:ring-1 focus:ring-[#007AFF]/30 sm:w-52 dark:border-white/10 dark:bg-white/[0.05]"
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

            <Button
              onClick={() => setSheetOpen(true)}
              className={cn(dashboardPrimaryBtn, "h-7 px-2.5")}
            >
              <Plus className="mr-1 h-3 w-3" />
              Create gift card
            </Button>
          </div>
        }
      />

      <GiftCardSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        currency={currency}
        onCreated={(card) => setCards((prev) => [card, ...prev])}
      />
    </div>
  );
}
