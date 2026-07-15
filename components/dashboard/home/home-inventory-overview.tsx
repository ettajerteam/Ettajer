import Link from "next/link";
import {
  Package,
  Layers,
  AlertTriangle,
  TrendingDown,
  Trophy,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { homeCard, homeCardPad, homeSubtitle, homeTitle } from "./home-ui";

interface HomeInventoryOverviewProps {
  totalProducts: number;
  collectionCount: number;
  outOfStock: number;
  lowStock: number;
  bestSellerName: string;
  inventoryValue: number;
  currency: string;
}

const STATS: {
  key: keyof HomeInventoryOverviewProps | "bestSeller";
  label: string;
  icon: LucideIcon;
  href: string;
}[] = [
  { key: "totalProducts", label: "Products", icon: Package, href: "/dashboard/products" },
  { key: "collectionCount", label: "Collections", icon: Layers, href: "/dashboard/collections" },
  { key: "outOfStock", label: "Out of stock", icon: AlertTriangle, href: "/dashboard/products/inventory" },
  { key: "lowStock", label: "Low stock", icon: TrendingDown, href: "/dashboard/products/inventory" },
  { key: "bestSeller", label: "Best seller", icon: Trophy, href: "/dashboard/products" },
  { key: "inventoryValue", label: "Value", icon: Wallet, href: "/dashboard/products/inventory" },
];

export function HomeInventoryOverview({
  totalProducts,
  collectionCount,
  outOfStock,
  lowStock,
  bestSellerName,
  inventoryValue,
  currency,
}: HomeInventoryOverviewProps) {
  const values: Record<string, string> = {
    totalProducts: totalProducts.toLocaleString(),
    collectionCount: collectionCount.toLocaleString(),
    outOfStock: outOfStock.toLocaleString(),
    lowStock: lowStock.toLocaleString(),
    bestSeller: bestSellerName,
    inventoryValue: formatCurrency(inventoryValue, currency),
  };

  return (
    <section id="inventory" className={cn(homeCard, homeCardPad, "scroll-mt-24")}>
      <h2 className={homeTitle}>Inventory</h2>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.key}
              href={stat.href}
              className="flex items-center gap-2.5 rounded-lg border border-neutral-200/80 bg-neutral-50/50 px-3 py-2.5 transition-colors hover:bg-neutral-100 dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
            >
              <Icon className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
              <div className="min-w-0">
                <p className={homeSubtitle}>{stat.label}</p>
                <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                  {values[stat.key]}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
