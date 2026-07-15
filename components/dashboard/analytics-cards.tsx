"use client";

import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { cn, formatCurrency } from "@/lib/utils";
import {
  dashboardCard,
  dashboardCardPad,
  dashboardCardInteractive,
  dashboardKicker,
  dashboardMetric,
} from "@/lib/dashboard-ui";
import type { AnalyticsData } from "@/types";

interface AnalyticsCardsProps {
  data: AnalyticsData;
  currency?: string;
}

const cards = [
  { key: "totalSales" as const, label: "Total Sales", icon: DollarSign, format: "currency" },
  { key: "orders" as const, label: "Orders", icon: ShoppingCart, format: "number" },
  { key: "visitors" as const, label: "Visitors", icon: Users, format: "number" },
  { key: "conversionRate" as const, label: "Conversion Rate", icon: TrendingUp, format: "percent" },
];

export function AnalyticsCards({ data, currency = "MAD" }: AnalyticsCardsProps) {
  const formatValue = (key: keyof AnalyticsData, format: string) => {
    const value = data[key];
    if (format === "currency") return formatCurrency(value, currency);
    if (format === "percent") return `${value.toFixed(1)}%`;
    return value.toLocaleString();
  };

  return (
    <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <StaggerItem key={card.key}>
          <div
            className={cn(
              dashboardCard,
              dashboardCardPad,
              dashboardCardInteractive,
              "premium-card-hover"
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <span className={dashboardKicker}>{card.label}</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#007AFF]/10">
                <card.icon className="h-4 w-4 text-[#007AFF]" />
              </div>
            </div>
            <p className={dashboardMetric}>
              {formatValue(card.key, card.format)}
            </p>
          </div>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}

export function AnalyticsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={cn(dashboardCard, dashboardCardPad, "animate-pulse")}>
          <div className="h-4 w-24 bg-muted rounded mb-4" />
          <div className="h-8 w-32 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}
