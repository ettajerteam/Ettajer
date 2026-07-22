import Link from "next/link";
import Image from "next/image";
import type { CSSProperties } from "react";
import { formatCurrency, cn } from "@/lib/utils";
import { getStoreProductUrl, getStoreProductsUrl, getStoreCollectionsUrl } from "@/lib/storefront-urls";
import { getProductImage } from "@/lib/storefront-assets";
import { isDemoProductId } from "@/lib/storefront-demo-products";
import { resolveSectionProducts } from "@/lib/storefront-products";
import { getStorefrontCopy } from "@/lib/storefront/storefront-i18n";
import { StaggerGrid, StaggerItem } from "@/components/storefront/motion-wrapper";
import { StorefrontQuietState } from "@/components/storefront/storefront-quiet-state";
import { getDeviceStyles } from "@/lib/builder/section-styles";
import type { DeviceMode } from "@/lib/builder/types";
import type { ProductGridSectionSettings } from "@/lib/sections/types";
import type { PublicProduct, PublicStore } from "@/types/storefront";
import type { ThemeId } from "@/lib/themes";

interface ProductGridSectionProps {
  store: PublicStore;
  products: PublicProduct[];
  settings: ProductGridSectionSettings;
  previewDevice?: DeviceMode;
}

type CardStyle = NonNullable<ProductGridSectionSettings["cardStyle"]>;
type Layout = NonNullable<ProductGridSectionSettings["layout"]>;
type ButtonStyle = NonNullable<ProductGridSectionSettings["cardButtonStyle"]>;

function buttonClass(style: ButtonStyle | "link" | undefined, size: "sm" | "md" = "sm") {
  const base =
    size === "sm"
      ? "inline-flex items-center justify-center rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition"
      : "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition";

  switch (style) {
    case "secondary":
      return cn(base, "bg-neutral-900 text-white hover:bg-neutral-800");
    case "outline":
      return cn(base, "border border-neutral-300 bg-transparent text-neutral-900 hover:border-neutral-900");
    case "ghost":
      return cn(base, "bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900");
    case "link":
      return "text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500 transition hover:text-neutral-900";
    default:
      return cn(base, "text-white hover:opacity-90");
  }
}

function buttonStyleAttr(style: ButtonStyle | "link" | undefined): CSSProperties | undefined {
  if (style === "secondary" || style === "outline" || style === "ghost" || style === "link") {
    return undefined;
  }
  return { backgroundColor: "var(--store-primary)" };
}

function ProductCard({
  store,
  product,
  editorial,
  layout,
  cardStyle,
  showCardButton,
  cardButtonText,
  cardButtonStyle,
}: {
  store: PublicStore;
  product: PublicProduct;
  editorial: boolean;
  layout: Layout;
  cardStyle: CardStyle;
  showCardButton: boolean;
  cardButtonText: string;
  cardButtonStyle: ButtonStyle;
}) {
  const imageSrc = getProductImage(store.theme, product.images, product.id);
  const isBold = store.theme === "bold";
  const isDemo = isDemoProductId(product.id);
  const isList = layout === "list";
  const isOverlay = cardStyle === "overlay" || layout === "dense";

  const media = (
    <div
      className={cn(
        "relative overflow-hidden",
        isList ? "aspect-square w-24 shrink-0 sm:w-28" : "mb-0 aspect-[3/4] w-full",
        cardStyle === "bordered" && !isOverlay && "rounded-xl ring-1 ring-neutral-200",
        editorial && !isOverlay ? "rounded-sm bg-stone-100" : !isOverlay && "rounded-xl",
        isBold && !isOverlay ? "bg-zinc-900 ring-1 ring-white/10" : !editorial && !isOverlay && "bg-neutral-100",
        isOverlay && "rounded-xl bg-neutral-900"
      )}
    >
      <Image
        src={imageSrc}
        alt={product.title}
        fill
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        sizes={isList ? "112px" : "(max-width: 768px) 50vw, 33vw"}
      />
      {isDemo ? (
        <span className="absolute left-2.5 top-2.5 rounded-full bg-black/65 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white">
          Sample
        </span>
      ) : null}
      {isOverlay ? (
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4">
          <h3 className="text-sm font-semibold tracking-tight text-white">{product.title}</h3>
          <p className="mt-1 text-sm text-white/85">
            {formatCurrency(product.price, store.currency)}
          </p>
          {showCardButton ? (
            <span
              className={cn(buttonClass(cardButtonStyle), "mt-3 self-start bg-white text-neutral-900 hover:bg-neutral-100")}
              style={undefined}
            >
              {cardButtonText}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  const meta = !isOverlay ? (
    <div className={cn(isList ? "min-w-0 flex-1" : "mt-3.5", editorial && "space-y-1")}>
      <h3
        className={cn(
          "tracking-tight transition-opacity group-hover:opacity-70",
          editorial ? "text-[13px] font-medium text-neutral-900" : "text-[15px] font-medium text-neutral-900"
        )}
      >
        {product.title}
      </h3>
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        <span
          className={cn("text-sm tabular-nums", editorial ? "text-[13px] text-neutral-600" : "text-neutral-600")}
        >
          {formatCurrency(product.price, store.currency)}
        </span>
        {product.comparePrice && product.comparePrice > product.price && (
          <span className="text-xs text-neutral-400 line-through tabular-nums">
            {formatCurrency(product.comparePrice, store.currency)}
          </span>
        )}
      </div>
      {showCardButton ? (
        <span
          className={cn(buttonClass(cardButtonStyle), "mt-3")}
          style={buttonStyleAttr(cardButtonStyle)}
        >
          {cardButtonText}
        </span>
      ) : null}
    </div>
  ) : null;

  const body = (
    <div className={cn(isList && "flex items-center gap-4")}>
      {media}
      {meta}
    </div>
  );

  if (isDemo) {
    return (
      <div className="group block cursor-default" title="Sample product — only shown in editor preview">
        {body}
      </div>
    );
  }

  return (
    <Link href={getStoreProductUrl(store.slug, product.slug)} className="group block">
      {body}
    </Link>
  );
}

function ViewAllControl({
  storeSlug,
  style,
  label,
}: {
  storeSlug: string;
  style: ProductGridSectionSettings["viewAllStyle"];
  label: string;
}) {
  const resolved = style ?? "link";
  return (
    <Link
      href={getStoreProductsUrl(storeSlug)}
      className={buttonClass(resolved === "link" ? "link" : resolved)}
      style={buttonStyleAttr(resolved === "link" ? "link" : resolved)}
    >
      {label}
    </Link>
  );
}

export function ProductGridSection({
  store,
  products,
  settings,
  previewDevice,
}: ProductGridSectionProps) {
  const t = getStorefrontCopy(store.language);
  const title = settings.title?.trim() || t.common.products;
  const subtitle = settings.subtitle?.trim();
  const theme = store.theme as ThemeId;
  const editorial = theme === "modern";
  const layout: Layout = settings.layout ?? "grid";
  const cardStyle: CardStyle = settings.cardStyle ?? "minimal";
  const showCardButton = settings.showCardButton === true;
  const cardButtonText = settings.cardButtonText?.trim() || t.common.shopNow;
  const cardButtonStyle: ButtonStyle = settings.cardButtonStyle ?? "";
  const deviceStyles = getDeviceStyles(
    settings as Record<string, unknown>,
    previewDevice ?? "desktop"
  );
  const columns = deviceStyles.columns ?? (editorial ? 4 : 3);
  const visibleProducts = resolveSectionProducts(products, settings);
  const showingSamples = visibleProducts.some((p) => isDemoProductId(p.id));

  const cardProps = {
    store,
    editorial,
    layout,
    cardStyle,
    showCardButton,
    cardButtonText,
    cardButtonStyle,
  };

  return (
    <section
      className={cn(
        "mx-auto px-6",
        editorial ? "max-w-7xl pb-20 pt-4" : "max-w-6xl pb-24"
      )}
    >
      {title || subtitle || showingSamples || settings.showViewAll !== false ? (
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 sm:mb-12">
          <div className="max-w-xl">
            {title ? (
              <h2
                className={cn(
                  theme === "modern" &&
                    "text-xs font-semibold uppercase tracking-[0.22em] text-neutral-900",
                  theme === "bold" && "text-xs font-bold uppercase tracking-[0.4em]",
                  theme === "minimal" &&
                    "text-2xl font-semibold tracking-tight text-neutral-900 sm:text-[1.75rem]"
                )}
                style={{
                  ...(theme === "bold" ? { color: "var(--store-primary)" } : undefined),
                  fontSize: theme === "minimal" ? undefined : deviceStyles.fontSize,
                }}
              >
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p
                className={cn(
                  "mt-2 leading-relaxed text-neutral-500",
                  theme === "minimal" ? "text-[15px] font-normal" : "text-sm font-light"
                )}
              >
                {subtitle}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            {showingSamples ? (
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-500">
                Preview samples
              </span>
            ) : null}
            {settings.showViewAll !== false ? (
              <ViewAllControl
                storeSlug={store.slug}
                style={settings.viewAllStyle}
                label={t.common.viewAll}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {visibleProducts.length === 0 ? (
        <StorefrontQuietState
          eyebrow="Catalog"
          title={settings.productSource === "manual" ? "No products selected" : "Nothing to show"}
          description={
            settings.productSource === "manual"
              ? "Pick products in the editor, or switch the grid to latest catalog items."
              : "Publish products in your dashboard — they’ll appear in this catalog automatically."
          }
          primaryAction={
            settings.productSource !== "manual"
              ? {
                  label: "Browse collections",
                  href: getStoreCollectionsUrl(store.slug),
                }
              : undefined
          }
          isBold={store.theme === "bold"}
          isModern={store.theme === "modern"}
          compact
        />
      ) : layout === "carousel" ? (
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {visibleProducts.map((product) => (
            <div
              key={product.id}
              className="w-[min(70vw,16rem)] shrink-0 snap-start sm:w-60"
            >
              <ProductCard {...cardProps} product={product} />
            </div>
          ))}
        </div>
      ) : layout === "list" ? (
        <div className="flex flex-col gap-4">
          {visibleProducts.map((product) => (
            <div
              key={product.id}
              className={cn(
                "rounded-2xl p-3 sm:p-4",
                cardStyle === "bordered" && "border border-neutral-200 bg-white"
              )}
            >
              <ProductCard {...cardProps} product={product} />
            </div>
          ))}
        </div>
      ) : layout === "spotlight" && visibleProducts[0] ? (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:row-span-2">
            <ProductCard {...cardProps} product={visibleProducts[0]} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {visibleProducts.slice(1, 5).map((product) => (
              <ProductCard key={product.id} {...cardProps} product={product} />
            ))}
          </div>
        </div>
      ) : (
        <StaggerGrid
          className={cn(
            "ettajer-responsive-grid grid gap-x-5 gap-y-11 md:gap-x-7 md:gap-y-14",
            layout === "dense" ? "grid-cols-2 gap-x-3 gap-y-7 md:gap-x-4 md:gap-y-9" : "grid-cols-2 md:grid-cols-3"
          )}
          style={{
            gridTemplateColumns: `repeat(${Math.min(
              layout === "dense" ? Math.min(columns, 3) : columns,
              visibleProducts.length || columns
            )}, minmax(0, 1fr))`,
          }}
        >
          {visibleProducts.map((product) => (
            <StaggerItem key={product.id}>
              <ProductCard {...cardProps} product={product} />
            </StaggerItem>
          ))}
        </StaggerGrid>
      )}
    </section>
  );
}
