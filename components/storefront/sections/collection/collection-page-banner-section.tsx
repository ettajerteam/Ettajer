"use client";

import Image from "next/image";
import { StorefrontBreadcrumb } from "@/components/storefront/storefront-breadcrumb";
import { getThemeAssets } from "@/lib/storefront-assets";
import { getStoreUrl } from "@/lib/storefront-urls";
import type { CollectionPageBannerSectionSettings } from "@/lib/sections/types";
import type { BlockRenderProps } from "@/lib/builder/types";
import type { ThemeId } from "@/lib/themes";
import { cn } from "@/lib/utils";

export function CollectionPageBannerSection({
  store,
  collection,
  settings,
}: BlockRenderProps) {
  const s = settings as CollectionPageBannerSectionSettings;
  const themeId = (store.theme in { minimal: 1, modern: 1, bold: 1 } ? store.theme : "minimal") as ThemeId;
  const isBold = themeId === "bold";
  const isModern = themeId === "modern";
  const assets = getThemeAssets(store.theme);
  const coverImage = s.imageUrl || collection?.image || assets.categoryCover;
  const label = collection?.name ?? "Collection";
  const layout = s.layout ?? "hero";
  const showTitle = s.showTitle !== false;
  const minHeight =
    s.minHeight ?? (layout === "hero" ? "42vh" : layout === "minimal" ? "140px" : "280px");

  const breadcrumb =
    s.showBreadcrumb !== false ? (
      <StorefrontBreadcrumb
        variant={themeId}
        items={[
          { label: store.name, href: getStoreUrl(store.slug) },
          { label: "Shop", href: getStoreUrl(store.slug) + "/products" },
          { label },
        ]}
      />
    ) : null;

  if (layout === "hero") {
    return (
      <section className="relative w-full overflow-hidden" style={{ minHeight }}>
        <Image
          src={coverImage}
          alt={label}
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/20" />
        <div
          className={cn(
            "relative z-10 mx-auto flex h-full min-h-[inherit] flex-col justify-between px-6 py-8 sm:px-10 lg:px-16",
            isModern ? "max-w-7xl" : "max-w-6xl"
          )}
        >
          <div className="pt-2 text-white/80 [&_nav]:mb-0 [&_a]:text-white/70 [&_a:hover]:text-white [&_span]:text-white/90">
            {breadcrumb}
          </div>
          {showTitle ? (
            <div className="pb-4 pt-16 sm:pb-8 sm:pt-24">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
                Collection
              </p>
              <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl">
                {label}
              </h1>
            </div>
          ) : (
            <div />
          )}
        </div>
      </section>
    );
  }

  if (layout === "split") {
    return (
      <div className={cn("mx-auto px-6", isModern ? "max-w-7xl" : "max-w-6xl")}>
        {breadcrumb ? <div className="pt-6">{breadcrumb}</div> : null}
        <div
          className={cn(
            "mt-5 grid overflow-hidden sm:grid-cols-2",
            isModern ? "rounded-sm" : "rounded-2xl",
            isBold ? "border border-white/10" : "border border-neutral-200/80"
          )}
        >
          <div className="relative min-h-[240px] sm:min-h-[320px]">
            <Image src={coverImage} alt={label} fill className="object-cover" sizes="50vw" priority />
          </div>
          <div
            className={cn(
              "flex flex-col justify-center px-8 py-12 sm:px-12",
              isBold ? "bg-zinc-900 text-white" : isModern ? "bg-[#fafaf8]" : "bg-neutral-50"
            )}
          >
            <p
              className={cn(
                "mb-3 text-[11px] font-semibold uppercase tracking-[0.2em]",
                isBold ? "text-white/40" : "text-neutral-400"
              )}
            >
              Collection
            </p>
            {showTitle ? (
              <h1
                className={cn(
                  "text-3xl font-semibold tracking-tight sm:text-4xl",
                  isBold && "uppercase tracking-[0.04em]"
                )}
              >
                {label}
              </h1>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (layout === "minimal") {
    return (
      <div className={cn("mx-auto px-6", isModern ? "max-w-7xl" : "max-w-6xl")}>
        {breadcrumb ? <div className="pt-6">{breadcrumb}</div> : null}
        <div
          className={cn(
            "relative mt-5 overflow-hidden",
            isModern ? "rounded-sm" : "rounded-xl"
          )}
          style={{ minHeight }}
        >
          <Image src={coverImage} alt={label} fill className="object-cover" sizes="1152px" priority />
          <div className="absolute inset-0 bg-black/40" />
          {showTitle ? (
            <div className="absolute inset-0 flex items-end px-6 py-6 sm:items-center">
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {label}
              </h1>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("mx-auto px-6", isModern ? "max-w-7xl" : "max-w-6xl")}>
      {breadcrumb ? <div className="pt-6">{breadcrumb}</div> : null}
      <div
        className={cn(
          "relative mt-5 overflow-hidden",
          isModern ? "rounded-sm" : "rounded-2xl"
        )}
        style={{ minHeight }}
      >
        <Image
          src={coverImage}
          alt={label}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 1152px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
        {showTitle ? (
          <div className="absolute inset-x-0 bottom-0 px-6 py-8 sm:px-10">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
              Collection
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {label}
            </h1>
          </div>
        ) : null}
      </div>
    </div>
  );
}
