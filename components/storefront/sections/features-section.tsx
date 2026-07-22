import { parseSectionVisualSettings } from "@/lib/builder/section-styles";
import type { DeviceMode } from "@/lib/builder/types";
import type { FeaturesSectionSettings } from "@/lib/sections/types";
import type { PublicStore } from "@/types/storefront";
import { cn } from "@/lib/utils";

interface FeaturesSectionProps {
  store: PublicStore;
  settings: FeaturesSectionSettings;
  previewDevice?: DeviceMode;
}

type Layout = NonNullable<FeaturesSectionSettings["layout"]>;
type CardStyle = NonNullable<FeaturesSectionSettings["cardStyle"]>;

function resolveColumns(settings: FeaturesSectionSettings, itemCount: number): number {
  const raw = Number(settings.columns);
  if (raw === 2 || raw === 3 || raw === 4) return raw;
  if (itemCount <= 2) return Math.max(itemCount, 1);
  if (itemCount === 4) return 4;
  return 3;
}

function cardShellClass(style: CardStyle, layout: Layout): string {
  if (layout === "strip" || layout === "icon-left") return "";
  switch (style) {
    case "soft":
      return "rounded-2xl bg-neutral-50 p-6";
    case "plain":
      return "rounded-2xl p-5";
    case "accent":
      return "rounded-2xl border border-[#007AFF]/15 bg-[#007AFF]/10 p-6";
    default:
      return "rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm";
  }
}

function gridColsClass(columns: number): string {
  if (columns <= 1) return "grid-cols-1";
  if (columns === 2) return "sm:grid-cols-2";
  if (columns === 4) return "sm:grid-cols-2 lg:grid-cols-4";
  return "sm:grid-cols-2 lg:grid-cols-3";
}

export function FeaturesSection({ settings }: FeaturesSectionProps) {
  const visual = parseSectionVisualSettings(settings as Record<string, unknown>);
  const title = settings.title?.trim();
  const subtitle = settings.subtitle?.trim();
  const items = settings.items ?? [];
  const layout: Layout = settings.layout ?? "cards";
  const cardStyle: CardStyle = settings.cardStyle ?? "bordered";
  const alignment = settings.alignment ?? (layout === "icon-left" ? "left" : "center");
  const showIcons = settings.showIcons !== false;
  const columns = resolveColumns(settings, items.length);
  const textAlign = alignment === "left" ? "text-left" : "text-center";
  const itemsAlign = alignment === "left" ? "items-start" : "items-center";

  return (
    <section
      className="px-6 py-14"
      style={{
        padding: visual.padding,
        margin: visual.margin,
        backgroundColor: visual.backgroundColor,
        color: visual.textColor,
      }}
    >
      <div className="mx-auto max-w-6xl">
        {(title || subtitle) && (
          <div className={cn("mb-12 max-w-2xl", alignment === "center" && "mx-auto text-center")}>
            {title ? (
              <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className="mt-2 text-sm leading-relaxed text-neutral-500 sm:text-base">{subtitle}</p>
            ) : null}
          </div>
        )}

        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-200 px-4 py-10 text-center text-sm text-neutral-400">
            Add features in the editor
          </p>
        ) : layout === "strip" ? (
          <div className="flex flex-wrap items-stretch justify-center gap-x-8 gap-y-6 sm:gap-x-12">
            {items.map((item, i) => (
              <div
                key={`${item.title}-${i}`}
                className="flex min-w-[140px] flex-1 items-start gap-3 sm:min-w-[160px]"
              >
                {showIcons && item.icon?.trim() ? (
                  <span className="text-xl" aria-hidden>
                    {item.icon.trim()}
                  </span>
                ) : (
                  <span
                    className="mt-0.5 text-[11px] font-semibold tabular-nums text-neutral-300"
                    aria-hidden
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                )}
                <div className="min-w-0">
                  {item.title?.trim() ? (
                    <p className="text-sm font-semibold text-neutral-900">{item.title.trim()}</p>
                  ) : null}
                  {item.body?.trim() ? (
                    <p className="mt-1 text-[13px] leading-relaxed text-neutral-500">
                      {item.body.trim()}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : layout === "icon-left" ? (
          <div className="mx-auto grid max-w-2xl gap-8">
            {items.map((item, i) => (
              <div key={`${item.title}-${i}`} className="flex gap-5">
                {showIcons && item.icon?.trim() ? (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center text-2xl">
                    <span aria-hidden>{item.icon.trim()}</span>
                  </div>
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center text-[12px] font-semibold tabular-nums text-neutral-300">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  {item.title?.trim() ? (
                    <h3 className="text-base font-semibold text-neutral-900">{item.title.trim()}</h3>
                  ) : null}
                  {item.body?.trim() ? (
                    <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">{item.body.trim()}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className={cn(
              "grid gap-10 sm:gap-12",
              gridColsClass(columns),
              items.length === 1 && "mx-auto max-w-md"
            )}
          >
            {items.map((item, i) => {
              const isNumbered = layout === "numbered";
              const isCenteredLayout = layout === "centered";
              const isMinimal = layout === "minimal";
              const centerCopy = isCenteredLayout || alignment === "center";
              const useCards = !isMinimal && layout !== "numbered";

              return (
                <div
                  key={`${item.title}-${i}`}
                  className={cn(
                    "flex flex-col",
                    textAlign,
                    itemsAlign,
                    useCards && cardShellClass(cardStyle, layout),
                    isMinimal && "gap-2 border-t border-neutral-200 pt-6",
                    isNumbered && "gap-3"
                  )}
                >
                  {isNumbered ? (
                    <div
                      className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-300"
                      aria-hidden
                    >
                      {String(i + 1).padStart(2, "0")}
                    </div>
                  ) : showIcons && item.icon?.trim() && !isMinimal ? (
                    <div
                      className={cn(
                        "mb-3 text-2xl",
                        isCenteredLayout &&
                          "flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-50 text-3xl ring-1 ring-neutral-100"
                      )}
                      aria-hidden
                    >
                      {item.icon.trim()}
                    </div>
                  ) : null}

                  {item.title?.trim() ? (
                    <h3
                      className={cn(
                        "font-semibold tracking-tight text-neutral-900",
                        centerCopy ? "text-lg" : "text-base sm:text-lg"
                      )}
                    >
                      {item.title.trim()}
                    </h3>
                  ) : null}
                  {item.body?.trim() ? (
                    <p
                      className={cn(
                        "leading-relaxed text-neutral-500",
                        isMinimal ? "mt-1.5 text-[13px]" : "mt-2 text-sm"
                      )}
                    >
                      {item.body.trim()}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
