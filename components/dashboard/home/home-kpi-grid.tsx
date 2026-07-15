"use client";

import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  Percent,
  Receipt,
} from "lucide-react";
import type { HomeKpiCardData } from "@/types/dashboard";
import { HomeKpiCard } from "./home-kpi-card";
import { HomeSectionHeader } from "./home-section-header";

const ICONS = {
  revenue: DollarSign,
  orders: ShoppingBag,
  "products-sold": Package,
  visitors: Users,
  conversion: Percent,
  aov: Receipt,
} as const;

interface HomeKpiGridProps {
  kpis: HomeKpiCardData[];
  rangeLabel: string;
}

export function HomeKpiGrid({ kpis, rangeLabel }: HomeKpiGridProps) {
  return (
    <section aria-label="Business KPIs">
      <HomeSectionHeader title="Performance" description={rangeLabel} compact />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi) => {
          const Icon = ICONS[kpi.id as keyof typeof ICONS] ?? DollarSign;
          return <HomeKpiCard key={kpi.id} data={kpi} icon={Icon} />;
        })}
      </div>
    </section>
  );
}
