import Image from "next/image";
import Link from "next/link";
import { parseSectionVisualSettings } from "@/lib/builder/section-styles";
import type { DeviceMode } from "@/lib/builder/types";
import type { ColumnItem, ColumnsSectionSettings } from "@/lib/sections/types";
import { resolveStoreNavHref } from "@/lib/storefront-urls";
import type { PublicStore } from "@/types/storefront";
import { cn } from "@/lib/utils";

interface ColumnsSectionProps {
  store: PublicStore;
  settings: ColumnsSectionSettings;
  previewDevice?: DeviceMode;
}

function looksLikeHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function BodyCopy({ content, centered }: { content: string; centered?: boolean }) {
  if (!content) return null;
  if (looksLikeHtml(content)) {
    return (
      <div
        className={cn(
          "prose prose-neutral max-w-none text-sm leading-relaxed text-neutral-600",
          centered && "mx-auto prose-headings:text-center prose-p:text-center"
        )}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
  return (
    <p
      className={cn(
        "whitespace-pre-wrap text-sm leading-relaxed text-neutral-600",
        centered && "text-center"
      )}
    >
      {content}
    </p>
  );
}

function ColumnCell({
  store,
  col,
  layout,
  cardStyle,
  alignment,
}: {
  store: PublicStore;
  col: ColumnItem;
  layout: NonNullable<ColumnsSectionSettings["layout"]>;
  cardStyle: NonNullable<ColumnsSectionSettings["cardStyle"]>;
  alignment: "left" | "center";
}) {
  const cellType =
    col.cellType ??
    (col.imageUrl
      ? col.buttonText
        ? "cta"
        : "image-text"
      : col.buttonText
        ? "cta"
        : "text");
  const title = col.title?.trim() ?? "";
  const content = col.content?.trim() ?? "";
  const imageUrl = col.imageUrl?.trim() ?? "";
  const imageAlt = col.imageAlt?.trim() || title || "Column image";
  const buttonText = col.buttonText?.trim() ?? "";
  const buttonLink = col.buttonLink?.trim() || "/products";
  const centered = alignment === "center";
  const mediaTall = layout === "media" || cellType === "image";

  const shell = cn(
    "min-w-0 h-full",
    layout === "cards" || layout === "cta"
      ? cn(
          "flex flex-col p-5 sm:p-6",
          cardStyle === "bordered" && "rounded-2xl border border-neutral-200 bg-white",
          cardStyle === "soft" && "rounded-2xl bg-neutral-50",
          cardStyle === "plain" && "rounded-2xl"
        )
      : layout === "media"
        ? "flex flex-col"
        : null,
    centered && "text-center"
  );

  const imageBlock =
    imageUrl && (cellType === "image-text" || cellType === "image" || cellType === "cta") ? (
      <div
        className={cn(
          "relative mb-4 w-full overflow-hidden rounded-xl bg-neutral-100",
          mediaTall ? "aspect-[4/5]" : "aspect-[4/3]",
          cellType === "image" && "mb-0",
          centered && "mx-auto"
        )}
      >
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
    ) : null;

  const ctaButton =
    buttonText && (cellType === "cta" || cellType === "image-text") ? (
      <Link
        href={resolveStoreNavHref(store.slug, buttonLink)}
        className={cn(
          "mt-auto inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90",
          layout === "cta" && "w-full",
          centered && "mx-auto",
          "pt-4"
        )}
        style={{ backgroundColor: "var(--store-primary)" }}
      >
        {buttonText}
      </Link>
    ) : null;

  if (cellType === "image" && imageBlock) {
    return (
      <div className={shell}>
        {imageBlock}
        {title ? (
          <p className={cn("mt-3 text-sm font-medium text-neutral-800", centered && "text-center")}>
            {title}
          </p>
        ) : null}
      </div>
    );
  }

  const empty =
    !title && !content && !imageUrl && !buttonText ? (
      <p className="rounded-lg border border-dashed border-neutral-200 px-3 py-6 text-center text-xs text-neutral-400">
        Empty column — add content in the inspector
      </p>
    ) : null;

  return (
    <div className={shell}>
      {imageBlock}
      {title ? (
        <h3
          className={cn(
            "mb-2 text-lg font-semibold tracking-tight text-neutral-900",
            cellType === "cta" && layout === "cta" && "text-xl"
          )}
        >
          {title}
        </h3>
      ) : null}
      <BodyCopy content={content} centered={centered} />
      {ctaButton}
      {empty}
    </div>
  );
}

export function ColumnsSection({ store, settings }: ColumnsSectionProps) {
  const visual = parseSectionVisualSettings(settings as Record<string, unknown>);
  const count = Math.min(4, Math.max(2, Number(settings.columnCount) || 2));
  const gap = settings.gap ?? "1.5rem";
  const layout = settings.layout ?? "plain";
  const cardStyle = settings.cardStyle ?? (layout === "cards" || layout === "cta" ? "bordered" : "plain");
  const alignment = settings.alignment ?? "left";
  const columns = (settings.columns ?? []).slice(0, count);
  while (columns.length < count) {
    columns.push({ cellType: "text", title: "", content: "" });
  }

  const gridClass =
    count === 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : count === 3
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : "sm:grid-cols-2";

  return (
    <section
      className="px-6 py-10 sm:py-14"
      style={{
        padding: visual.padding,
        margin: visual.margin,
        backgroundColor: visual.backgroundColor,
        color: visual.textColor,
      }}
    >
      <div className={cn("mx-auto grid max-w-6xl", gridClass)} style={{ gap }}>
        {columns.map((col, i) => (
          <ColumnCell
            key={i}
            store={store}
            col={col}
            layout={layout}
            cardStyle={cardStyle}
            alignment={alignment}
          />
        ))}
      </div>
    </section>
  );
}
