"use client";

import Image from "next/image";
import { getProductImage } from "@/lib/storefront-assets";
import type { ProductGallerySectionSettings } from "@/lib/sections/types";
import type { BlockRenderProps } from "@/lib/builder/types";
import { cn } from "@/lib/utils";

export function ProductGallerySection({ store, product, settings }: BlockRenderProps) {
  const s = settings as ProductGallerySectionSettings;
  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-6">
        <div className="aspect-square rounded-2xl bg-neutral-100 flex items-center justify-center text-sm text-neutral-400">
          Product gallery preview
        </div>
      </div>
    );
  }

  const imageSrc = getProductImage(store.theme, product.images, product.id);
  const isBold = store.theme === "bold";

  return (
    <div className="max-w-6xl mx-auto px-6">
      <div
        className={cn(
          "aspect-square rounded-2xl overflow-hidden relative",
          isBold ? "bg-zinc-900" : "bg-gray-50"
        )}
      >
        <Image
          src={imageSrc}
          alt={product.title}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      {s.showThumbnails !== false && product.images.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {product.images.slice(0, 4).map((img, i) => (
            <div key={i} className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-neutral-100">
              <Image src={img} alt="" fill className="object-cover" sizes="64px" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
