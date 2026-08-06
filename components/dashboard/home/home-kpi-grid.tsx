"use client";

import {
  DollarSign,
  ShoppingBag,
  Users,
  UserRound,
} from "lucide-react";
import type { HomeKpiCardData } from "@/types/dashboard";
import { HomeKpiCard } from "./home-kpi-card";

const ICONS = {
  revenue: DollarSign,
  orders: ShoppingBag,
  visitors: Users,
  customers: UserRound,
} as const;

interface HomeKpiGridProps {
  kpis: HomeKpiCardData[];
  rangeLabel: string;
}

export function HomeKpiGrid({ kpis, rangeLabel }: HomeKpiGridProps) {
  return (
    <section aria-label="Business KPIs">
      <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.08em] text-neutral-400">
        {rangeLabel}
      </p>
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = ICONS[kpi.id as keyof typeof ICONS] ?? DollarSign;
          return <HomeKpiCard key={kpi.id} data={kpi} icon={Icon} />;
        })}
      </div>
    </section>
  );
}
