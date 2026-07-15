"use client";

import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { getStoreProductUrl } from "@/lib/storefront-urls";
import { getProductImage } from "@/lib/storefront-assets";
import type { ProductRelatedSectionSettings } from "@/lib/sections/types";
import type { BlockRenderProps } from "@/lib/builder/types";
import { cn } from "@/lib/utils";

export function ProductRelatedSection({ store, product, products = [], settings }: BlockRenderProps) {
  const s = settings as ProductRelatedSectionSettings;
  const isBold = store.theme === "bold";
  const title = s.title ?? "You may also like";
  const limit = typeof s.limit === "number" ? s.limit : 4;
  const related = products.filter((p) => p.id !== product?.id).slice(0, limit);

  return (
    <div className="max-w-6xl mx-auto px-6 pb-8">
      <h2
        className={cn(
          "text-lg font-semibold mb-6",
          isBold ? "text-white uppercase tracking-widest text-sm" : "text-gray-900"
        )}
      >
        {title}
      </h2>
      {related.length === 0 ? (
        <p className={cn("text-sm", isBold ? "text-white/40" : "text-gray-400")}>
          Related products will appear here
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {related.map((item) => (
            <Link
              key={item.id}
              href={getStoreProductUrl(store.slug, item.slug)}
              className="group block"
            >
              <div
                className={cn(
                  "aspect-square rounded-xl overflow-hidden mb-3 relative",
                  isBold ? "bg-zinc-900" : "bg-gray-50"
                )}
              >
                <Image
                  src={getProductImage(store.theme, item.images, item.id)}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <p className="text-sm font-medium truncate">{item.title}</p>
              <p className="text-sm" style={{ color: "var(--store-primary)" }}>
                {formatCurrency(item.price, store.currency)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
