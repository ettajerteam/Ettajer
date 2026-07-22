import Link from "next/link";
import { parseSectionVisualSettings, getDeviceStyles } from "@/lib/builder/section-styles";
import type { DeviceMode } from "@/lib/builder/types";
import type { CtaSectionSettings } from "@/lib/sections/types";
import type { PublicStore } from "@/types/storefront";
import { resolveStoreNavHref } from "@/lib/storefront-urls";
import { cn } from "@/lib/utils";

interface CtaSectionProps {
  store: PublicStore;
  settings: CtaSectionSettings;
  previewDevice?: DeviceMode;
}

type Layout = NonNullable<CtaSectionSettings["layout"]>;

export function CtaSection({ store, settings, previewDevice }: CtaSectionProps) {
  const visual = parseSectionVisualSettings(settings as Record<string, unknown>);
  const deviceStyles = getDeviceStyles(settings as Record<string, unknown>, previewDevice ?? "desktop");
  const layout: Layout = settings.layout ?? "banner";
  const alignment = deviceStyles.alignment ?? settings.alignment ?? (layout === "split" ? "left" : "center");
  const title = settings.title?.trim() || "Ready to shop?";
  const subtitle = settings.subtitle?.trim();
  const buttonText = settings.buttonText?.trim() || "Shop now";
  const buttonLink = settings.buttonLink?.trim() || "/products";
  const secondaryText = settings.secondaryButtonText?.trim();
  const secondaryLink = settings.secondaryButtonLink?.trim() || "/products";

  const bg = visual.backgroundColor ?? "#0a0a0a";
  const fg = visual.textColor ?? "#ffffff";
  const isDark =
    bg.toLowerCase() === "#0a0a0a" ||
    bg.toLowerCase() === "#111827" ||
    fg.toLowerCase() === "#ffffff" ||
    fg.toLowerCase() === "#f9fafb";

  const primaryBtn = cn(
    "inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-medium transition",
    isDark ? "bg-white text-neutral-900 hover:bg-neutral-100" : "bg-neutral-900 text-white hover:bg-neutral-800"
  );
  const secondaryBtn = cn(
    "inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-medium transition",
    isDark
      ? "border border-white/30 text-white hover:bg-white/10"
      : "border border-neutral-300 text-neutral-900 hover:bg-neutral-100"
  );

  const actions = (
    <div className={cn("flex flex-wrap gap-3", layout === "stacked" && "w-full flex-col sm:flex-row")}>
      <Link
        href={resolveStoreNavHref(store.slug, buttonLink)}
        className={cn(primaryBtn, layout === "stacked" && "w-full sm:w-auto")}
      >
        {buttonText}
      </Link>
      {secondaryText ? (
        <Link
          href={resolveStoreNavHref(store.slug, secondaryLink)}
          className={cn(secondaryBtn, layout === "stacked" && "w-full sm:w-auto")}
        >
          {secondaryText}
        </Link>
      ) : null}
    </div>
  );

  const muted = isDark ? "text-white/70" : "text-neutral-600";

  return (
    <section
      className={cn(
        "px-6",
        layout === "strip" ? "py-6" : "py-16",
        layout === "card" && "bg-transparent"
      )}
      style={{
        padding: visual.padding,
        margin: visual.margin,
        backgroundColor: layout === "card" ? undefined : bg,
        color: layout === "card" ? undefined : fg,
      }}
    >
      {layout === "card" ? (
        <div
          className="mx-auto max-w-4xl rounded-3xl px-8 py-12 text-center shadow-sm sm:px-12"
          style={{ backgroundColor: bg, color: fg }}
        >
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
          {subtitle ? <p className={cn("mx-auto mt-3 max-w-xl text-base leading-relaxed", muted)}>{subtitle}</p> : null}
          <div className="mt-8 flex justify-center">{actions}</div>
        </div>
      ) : layout === "split" ? (
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div className="min-w-0 max-w-xl text-left">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
            {subtitle ? <p className={cn("mt-3 text-base leading-relaxed", muted)}>{subtitle}</p> : null}
          </div>
          <div className="shrink-0">{actions}</div>
        </div>
      ) : layout === "strip" ? (
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row sm:gap-6">
          <div
            className={cn(
              "min-w-0 text-center sm:text-left",
              alignment === "right" && "sm:text-right"
            )}
          >
            <h2 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h2>
            {subtitle ? <p className={cn("mt-1 text-sm", muted)}>{subtitle}</p> : null}
          </div>
          <div className="shrink-0">{actions}</div>
        </div>
      ) : layout === "stacked" ? (
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h2>
          {subtitle ? <p className={cn("mt-4 text-base leading-relaxed sm:text-lg", muted)}>{subtitle}</p> : null}
          <div className="mt-10 flex justify-center">{actions}</div>
        </div>
      ) : (
        <div
          className={cn(
            "mx-auto max-w-3xl",
            alignment === "left" && "text-left",
            alignment === "center" && "text-center",
            alignment === "right" && "text-right"
          )}
        >
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
          {subtitle ? <p className={cn("mt-3 text-base leading-relaxed", muted)}>{subtitle}</p> : null}
          <div
            className={cn(
              "mt-8 flex",
              alignment === "center" && "justify-center",
              alignment === "right" && "justify-end"
            )}
          >
            {actions}
          </div>
        </div>
      )}
    </section>
  );
}
