"use client";

import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import type { HomeTopProductCard } from "@/types/dashboard";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { homeCard, homeCardPad, homeSubtitle, homeTitle } from "./home-ui";
import { useHomeCopy } from "./home-i18n";

interface HomeTopProductsProps {
  products: HomeTopProductCard[];
  currency: string;
}

export function HomeTopProducts({ products, currency }: HomeTopProductsProps) {
  const t = useHomeCopy();
  return (
    <section id="products" className={`${homeCard} ${homeCardPad} scroll-mt-24 h-full`}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className={homeTitle}>{t.bestSelling}</h2>
        <Link
          href="/dashboard/products"
          className="text-[13px] font-medium text-neutral-900 underline-offset-2 hover:underline dark:text-white"
        >
          {t.viewAll}
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-xl border border-dashed border-black/[0.06] px-3 py-3 dark:border-white/10"
            >
              <div className="h-10 w-10 animate-pulse rounded-lg bg-neutral-100 dark:bg-white/5" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3 w-2/3 animate-pulse rounded bg-neutral-100 dark:bg-white/5" />
                <div className="h-2.5 w-1/3 animate-pulse rounded bg-neutral-100 dark:bg-white/5" />
              </div>
            </div>
          ))}
          <div className="pt-2 text-center">
            <Package className="mx-auto h-5 w-5 text-neutral-300" />
            <p className="mt-2 text-[14px] font-medium text-neutral-900 dark:text-white">
              {t.noSalesYet}
            </p>
            <p className={`mt-1 ${homeSubtitle}`}>
              {t.bestSellingHint}
            </p>
            <Button
              asChild
              size="sm"
              className="mt-3 h-8 rounded-full bg-neutral-900 px-3.5 text-xs text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
            >
              <Link href="/dashboard/products/new">{t.addProduct}</Link>
            </Button>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-black/[0.05] dark:divide-white/10">
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
