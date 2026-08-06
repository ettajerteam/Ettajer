"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Package, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductsEmptyState } from "@/components/products/products-empty-state";
import { ProductsSectionNav } from "@/components/products/products-section-nav";
import { cn } from "@/lib/utils";
import { dashboardCard, dashboardStack, dashboardSubtitle, dashboardTitle } from "@/lib/dashboard-ui";
import type { ProductsSectionCounts } from "@/types/products-stats";
import type { Product } from "@/types";
import type { PublicProductReview } from "@/lib/product-reviews";

export interface ProductReviewsRow {
  product: Product;
  reviews: PublicProductReview[];
  average: number | null;
}

interface ProductReviewsClientProps {
  rows: ProductReviewsRow[];
  counts: ProductsSectionCounts;
}

export function ProductReviewsClient({ rows, counts }: ProductReviewsClientProps) {
  const router = useRouter();

  return (
    <div className={dashboardStack}>
      <ProductsSectionNav counts={counts} reviewsCount={rows.length} />

      {rows.length === 0 ? (
        <ProductsEmptyState
          icon={Star}
          title="No reviews yet"
          description="Customer reviews from completed orders appear here. They’re no longer edited on the product form."
          action={
            <Button
              asChild
              variant="outline"
              className="h-8 rounded-md border-black/[0.06] px-3 text-[12px] dark:border-white/10"
            >
              <Link href="/dashboard/orders">
                <Package className="mr-1.5 h-3.5 w-3.5" />
                View orders
              </Link>
            </Button>
          }
          tips={[
            {
              step: "01",
              title: "Customer buys",
              body: "An order is placed and fulfilled from your store.",
            },
            {
              step: "02",
              title: "They leave feedback",
              body: "Reviews collect after purchase on eligible products.",
            },
            {
              step: "03",
              title: "You review them here",
              body: "Open a product to see ratings and manage its page.",
            },
          ]}
        />
      ) : (
        <div className={cn(dashboardCard, "overflow-hidden")}>
          <div className="border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
            <h2 className={dashboardTitle}>
              Product reviews
              <span className="ml-1.5 font-normal text-neutral-400">{rows.length}</span>
            </h2>
            <p className={dashboardSubtitle}>Tap a row to open the product</p>
          </div>
          <div className="divide-y divide-black/[0.04] dark:divide-white/5">
            {rows.map(({ product, reviews, average }) => (
              <button
                key={product.id}
                type="button"
                onClick={() => router.push(`/dashboard/products/${product.id}/edit`)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-[#F5F5F7]/80 dark:hover:bg-white/[0.03]"
              >
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-medium text-neutral-900 dark:text-white">
                    {product.title}
                  </p>
                  <p className="mt-0.5 text-[10px] text-neutral-400">
                    {reviews.length} review{reviews.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {average != null ? (
                    <span className="inline-flex items-center gap-1 text-[12px] font-medium tabular-nums text-neutral-900 dark:text-white">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {average.toFixed(1)}
                    </span>
                  ) : null}
                  <ExternalLink className="h-3.5 w-3.5 text-neutral-300" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
