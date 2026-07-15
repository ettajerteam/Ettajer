"use client";

import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import type { HomeTopProductCard } from "@/types/dashboard";
import { formatCurrency } from "@/lib/utils";
import { HomeEmptyState } from "./home-empty-state";
import { homeCard, homeCardPad, homeSubtitle, homeTitle } from "./home-ui";

interface HomeTopProductsProps {
  products: HomeTopProductCard[];
  currency: string;
}

export function HomeTopProducts({ products, currency }: HomeTopProductsProps) {
  return (
    <section id="products" className={`${homeCard} ${homeCardPad} scroll-mt-24`}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className={homeTitle}>Top products</h2>
        <Link href="/dashboard/products" className="text-xs font-medium text-[#007AFF]">
          View all
        </Link>
      </div>

      {products.length === 0 ? (
        <HomeEmptyState
          icon={Package}
          title="No sales yet"
          description="Top products will appear here."
          actionLabel="Add product"
          actionHref="/dashboard/products"
        />
      ) : (
        <ul className="divide-y divide-neutral-200/80 dark:divide-white/10">
          {products.slice(0, 5).map((product) => (
            <li key={product.id}>
              <Link
                href="/dashboard/products"
                className="flex items-center gap-3 py-2.5 transition-colors hover:bg-neutral-50 dark:hover:bg-white/[0.02]"
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                  <Image src={product.image} alt="" fill className="object-cover" sizes="40px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                    {product.title}
                  </p>
                  <p className={homeSubtitle}>
                    {product.unitsSold} sold · {product.stock} in stock
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {formatCurrency(product.revenue, currency)}
                  </p>
                  <p
                    className={`text-[11px] font-medium ${
                      product.growth >= 0 ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {product.growth >= 0 ? "+" : ""}
                    {product.growth.toFixed(1)}%
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
