import Link from "next/link";
import Image from "next/image";
import { getStoreCollectionUrl } from "@/lib/storefront-urls";
import { getThemeAssets } from "@/lib/storefront-assets";
import { FadeInSection } from "@/components/storefront/motion-wrapper";
import type { PublicCollection, PublicStore } from "@/types/storefront";
import { cn } from "@/lib/utils";

interface FeaturedCollectionsProps {
  store: PublicStore;
  collections: PublicCollection[];
  variant?: "minimal" | "modern" | "bold";
  titleOverride?: string;
}

export function FeaturedCollections({
  store,
  collections,
  variant = "minimal",
  titleOverride,
}: FeaturedCollectionsProps) {
  if (collections.length === 0) return null;

  const isBold = variant === "bold";
  const isModern = variant === "modern";
  const assets = getThemeAssets(store.theme);

  return (
    <FadeInSection className={cn("mb-16 sm:mb-24", isModern && "max-w-7xl mx-auto px-6")}>
      <h2
        className={cn(
          "mb-8",
          isMinimalStyle(variant) && "text-xs font-medium uppercase tracking-widest text-gray-400",
          isModern && "text-2xl font-black uppercase tracking-tighter",
          isBold && "text-xs font-bold uppercase tracking-[0.4em]"
        )}
        style={isBold ? { color: "var(--store-primary)" } : undefined}
      >
        {titleOverride ??
          (isModern ? "Collections" : isBold ? "// Collections" : "Featured Collections")}
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {collections.map((collection) => (
          <Link
            key={collection.id}
            href={getStoreCollectionUrl(store.slug, collection.slug)}
            className={cn(
              "group relative overflow-hidden rounded-2xl transition-all",
              isBold
                ? "border border-white/10 bg-white/5 hover:border-[var(--store-primary)]"
                : "border bg-gray-50 hover:shadow-lg"
            )}
          >
            <div className="aspect-[16/10] relative">
              <Image
                src={collection.image ?? assets.collectionCover}
                alt={collection.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3
                  className={cn(
                    "font-semibold text-white",
                    isModern && "uppercase font-black tracking-wide"
                  )}
                >
                  {collection.name}
                </h3>
                {collection.description && (
                  <p className="text-white/70 text-sm mt-1 line-clamp-2">{collection.description}</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </FadeInSection>
  );
}

function isMinimalStyle(variant: string) {
  return variant === "minimal";
}
