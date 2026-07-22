import Link from "next/link";
import Image from "next/image";
import { getStoreCollectionUrl, getStoreCollectionsUrl } from "@/lib/storefront-urls";
import { getThemeAssets } from "@/lib/storefront-assets";
import { FadeInSection } from "@/components/storefront/motion-wrapper";
import { parseSectionVisualSettings } from "@/lib/builder/section-styles";
import type { FeaturedCollectionsSectionSettings } from "@/lib/sections/types";
import type { PublicCollection, PublicStore } from "@/types/storefront";
import { cn } from "@/lib/utils";

type Layout = NonNullable<FeaturedCollectionsSectionSettings["layout"]>;
type CardStyle = NonNullable<FeaturedCollectionsSectionSettings["cardStyle"]>;

interface FeaturedCollectionsProps {
  store: PublicStore;
  collections: PublicCollection[];
  variant?: "minimal" | "modern" | "bold";
  titleOverride?: string;
  settings?: FeaturedCollectionsSectionSettings;
}

function resolveColumns(settings: FeaturedCollectionsSectionSettings | undefined, count: number): number {
  const raw = Number(settings?.columns);
  if (raw === 2 || raw === 3 || raw === 4) return raw;
  if (count <= 2) return Math.max(count, 1);
  if (count === 4) return 4;
  return 3;
}

function gridColsClass(columns: number): string {
  if (columns <= 1) return "grid-cols-1";
  if (columns === 2) return "sm:grid-cols-2";
  if (columns === 4) return "sm:grid-cols-2 lg:grid-cols-4";
  return "sm:grid-cols-2 lg:grid-cols-3";
}

function CollectionCard({
  store,
  collection,
  coverFallback,
  cardStyle,
  showDescription,
  aspectClass,
  className,
  titleClassName,
}: {
  store: PublicStore;
  collection: PublicCollection;
  coverFallback: string;
  cardStyle: CardStyle;
  showDescription: boolean;
  aspectClass: string;
  className?: string;
  titleClassName?: string;
}) {
  const href = getStoreCollectionUrl(store.slug, collection.slug);
  const imageSrc = collection.image ?? coverFallback;

  if (cardStyle === "below" || cardStyle === "bordered") {
    return (
      <Link
        href={href}
        className={cn(
          "group flex min-w-0 flex-col overflow-hidden transition",
          cardStyle === "bordered" && "rounded-2xl border border-neutral-200 bg-white shadow-sm hover:shadow-md",
          cardStyle === "below" && "rounded-2xl",
          className
        )}
      >
        <div className={cn("relative overflow-hidden bg-neutral-100", aspectClass, cardStyle === "below" && "rounded-2xl")}>
          <Image
            src={imageSrc}
            alt={collection.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
        <div className={cn("min-w-0", cardStyle === "bordered" ? "p-4" : "pt-3")}>
          <h3 className={cn("font-semibold text-neutral-900", titleClassName)}>{collection.name}</h3>
          {showDescription && collection.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-neutral-500">{collection.description}</p>
          ) : null}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-neutral-900 transition hover:shadow-lg",
        className
      )}
    >
      <div className={cn("relative", aspectClass)}>
        <Image
          src={imageSrc}
          alt={collection.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3 className={cn("font-semibold text-white", titleClassName)}>{collection.name}</h3>
          {showDescription && collection.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-white/75">{collection.description}</p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

export function FeaturedCollections({
  store,
  collections,
  variant = "minimal",
  titleOverride,
  settings,
}: FeaturedCollectionsProps) {
  if (collections.length === 0) return null;

  const isBold = variant === "bold";
  const isModern = variant === "modern";
  const assets = getThemeAssets(store.theme);
  const visual = parseSectionVisualSettings((settings ?? {}) as Record<string, unknown>);

  const layout: Layout = settings?.layout ?? "grid";
  const cardStyle: CardStyle = settings?.cardStyle ?? "overlay";
  const showDescription = settings?.showDescription !== false;
  const showViewAll = settings?.showViewAll ?? isModern;
  const columns = resolveColumns(settings, collections.length);
  const title =
    titleOverride ??
    settings?.title ??
    (isModern ? "Collections" : isBold ? "// Collections" : "Featured Collections");
  const subtitle = settings?.subtitle?.trim();

  const titleClass = cn(
    variant === "minimal" && "text-xs font-medium uppercase tracking-widest text-gray-400",
    isModern && "text-xs font-semibold uppercase tracking-[0.22em] text-neutral-900",
    isBold && "text-xs font-bold uppercase tracking-[0.4em]"
  );

  const cardTitleClass = cn(isModern && "text-sm font-medium uppercase tracking-[0.14em]");

  return (
    <FadeInSection
      className={cn("mb-16 sm:mb-24", isModern && !settings && "mx-auto max-w-7xl px-6")}
      style={{
        padding: visual.padding,
        margin: visual.margin,
        backgroundColor: visual.backgroundColor,
        color: visual.textColor,
      }}
    >
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div className="max-w-xl">
          <h2 className={titleClass} style={isBold ? { color: "var(--store-primary)" } : undefined}>
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-2 text-sm leading-relaxed text-neutral-500">{subtitle}</p>
          ) : null}
        </div>
        {showViewAll ? (
          <Link
            href={getStoreCollectionsUrl(store.slug)}
            className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500 transition hover:text-neutral-900"
          >
            View all
          </Link>
        ) : null}
      </div>

      {layout === "carousel" ? (
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {collections.map((collection) => (
            <div key={collection.id} className="w-[78%] shrink-0 snap-start sm:w-[42%] lg:w-[30%]">
              <CollectionCard
                store={store}
                collection={collection}
                coverFallback={assets.collectionCover}
                cardStyle={cardStyle}
                showDescription={showDescription}
                aspectClass="aspect-[4/5]"
                titleClassName={cardTitleClass}
              />
            </div>
          ))}
        </div>
      ) : layout === "editorial" ? (
        <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
          {collections[0] ? (
            <CollectionCard
              store={store}
              collection={collections[0]}
              coverFallback={assets.collectionCover}
              cardStyle={cardStyle}
              showDescription={showDescription}
              aspectClass="aspect-[4/5] lg:aspect-auto lg:min-h-[420px]"
              titleClassName={cn(cardTitleClass, "text-xl sm:text-2xl")}
            />
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:gap-6">
            {collections.slice(1, 4).map((collection) => (
              <CollectionCard
                key={collection.id}
                store={store}
                collection={collection}
                coverFallback={assets.collectionCover}
                cardStyle={cardStyle}
                showDescription={showDescription}
                aspectClass="aspect-[16/10]"
                titleClassName={cardTitleClass}
              />
            ))}
          </div>
        </div>
      ) : layout === "mosaic" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {collections.map((collection, index) => (
            <CollectionCard
              key={collection.id}
              store={store}
              collection={collection}
              coverFallback={assets.collectionCover}
              cardStyle={cardStyle}
              showDescription={showDescription}
              aspectClass={index === 0 ? "aspect-[4/5] sm:h-full sm:min-h-[360px] sm:aspect-auto" : "aspect-[16/10]"}
              className={index === 0 ? "sm:row-span-2" : undefined}
              titleClassName={cn(cardTitleClass, index === 0 && "text-xl")}
            />
          ))}
        </div>
      ) : layout === "list" ? (
        <div className="flex flex-col gap-3">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={getStoreCollectionUrl(store.slug, collection.slug)}
              className="group flex items-center gap-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-2.5 transition hover:shadow-md"
            >
              <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:h-24 sm:w-36">
                <Image
                  src={collection.image ?? assets.collectionCover}
                  alt={collection.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="144px"
                />
              </div>
              <div className="min-w-0 flex-1 pr-2">
                <h3 className={cn("font-semibold text-neutral-900", cardTitleClass)}>{collection.name}</h3>
                {showDescription && collection.description ? (
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-500">{collection.description}</p>
                ) : null}
              </div>
              <span className="hidden shrink-0 pr-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400 sm:inline">
                Shop
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-4 sm:gap-5 lg:gap-6",
            gridColsClass(columns),
            layout === "overlay" && "gap-5"
          )}
        >
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              store={store}
              collection={collection}
              coverFallback={assets.collectionCover}
              cardStyle={layout === "overlay" ? "overlay" : cardStyle}
              showDescription={showDescription}
              aspectClass={layout === "overlay" ? "aspect-[3/4]" : isModern ? "aspect-[4/5]" : "aspect-[16/10]"}
              className={cn(
                isBold && cardStyle === "overlay" && "rounded-2xl border border-white/10 bg-white/5 hover:border-[var(--store-primary)]",
                isModern && cardStyle === "overlay" && "rounded-sm"
              )}
              titleClassName={cardTitleClass}
            />
          ))}
        </div>
      )}
    </FadeInSection>
  );
}
