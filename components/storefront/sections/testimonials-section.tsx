import { parseSectionVisualSettings, getDeviceStyles } from "@/lib/builder/section-styles";
import type { DeviceMode } from "@/lib/builder/types";
import type { TestimonialItem, TestimonialsSectionSettings } from "@/lib/sections/types";
import type { PublicStore } from "@/types/storefront";
import { cn } from "@/lib/utils";

interface TestimonialsSectionProps {
  store: PublicStore;
  settings: TestimonialsSectionSettings;
  previewDevice?: DeviceMode;
}

type Layout = NonNullable<TestimonialsSectionSettings["layout"]>;
type CardStyle = NonNullable<TestimonialsSectionSettings["cardStyle"]>;

function normalizeTestimonialItems(settings: TestimonialsSectionSettings): TestimonialItem[] {
  if (Array.isArray(settings.items)) {
    return settings.items
      .map((item) => ({
        quote: typeof item?.quote === "string" ? item.quote.trim() : "",
        author: typeof item?.author === "string" ? item.author.trim() : "",
        role: typeof item?.role === "string" ? item.role.trim() : undefined,
      }))
      .filter((item) => item.quote || item.author);
  }
  return [];
}

function cardClass(cardStyle: CardStyle, isDark: boolean, isModern: boolean): string {
  switch (cardStyle) {
    case "soft":
      return isDark ? "rounded-xl bg-white/5 p-6" : "rounded-xl bg-neutral-50 p-6";
    case "plain":
      return "rounded-xl p-5";
    default:
      return cn(
        "rounded-xl border p-6 shadow-sm",
        isDark
          ? "border-white/10 bg-white/5"
          : isModern
            ? "border-neutral-100 bg-[#fafaf9]"
            : "border-neutral-200/80 bg-white"
      );
  }
}

function QuoteCard({
  item,
  isDark,
  isModern,
  cardStyle,
  className,
  large = false,
}: {
  item: TestimonialItem;
  isDark: boolean;
  isModern: boolean;
  cardStyle: CardStyle;
  className?: string;
  large?: boolean;
}) {
  return (
    <figure className={cn("flex h-full flex-col text-left", cardClass(cardStyle, isDark, isModern), className)}>
      <blockquote
        className={cn(
          "flex-1 leading-relaxed",
          large ? "text-lg sm:text-xl" : "text-[15px]",
          isDark ? "text-neutral-200" : "text-neutral-800"
        )}
      >
        “{item.quote || "Customer quote"}”
      </blockquote>
      <figcaption className="mt-5">
        {item.author ? (
          <p
            className={cn(
              "text-[11px] font-semibold uppercase tracking-[0.12em]",
              isDark ? "text-white/70" : "text-neutral-500"
            )}
          >
            {item.author}
          </p>
        ) : null}
        {item.role ? (
          <p className={cn("mt-1 text-xs", isDark ? "text-white/40" : "text-neutral-400")}>{item.role}</p>
        ) : null}
      </figcaption>
    </figure>
  );
}

export function TestimonialsSection({ store, settings, previewDevice }: TestimonialsSectionProps) {
  const settingsRecord = settings as Record<string, unknown>;
  const visual = parseSectionVisualSettings(settingsRecord);
  const deviceStyles = getDeviceStyles(settingsRecord, previewDevice ?? "desktop");
  const items = normalizeTestimonialItems(settings);
  const title = settings.title?.trim() || "What customers say";
  const subtitle = settings.subtitle?.trim();
  const layout: Layout = settings.layout ?? "cards";
  const cardStyle: CardStyle = settings.cardStyle ?? "bordered";
  const columns = Number(settings.columns) === 2 ? 2 : 3;
  const isBold = store.theme === "bold";
  const isModern = store.theme === "modern";
  const isDark =
    visual.backgroundColor?.toLowerCase() === "#0a0a0a" ||
    visual.textColor?.toLowerCase() === "#ffffff" ||
    isBold;

  return (
    <section
      className="px-6 py-14 sm:py-20"
      style={{
        padding: visual.padding,
        margin: visual.margin,
        backgroundColor: visual.backgroundColor,
      }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2
            className={cn(
              "text-2xl font-semibold tracking-tight sm:text-3xl",
              isModern && "tracking-[-0.03em]",
              isDark ? "text-white" : "text-neutral-900"
            )}
            style={{
              color: visual.textColor,
              fontSize: deviceStyles.fontSize ?? visual.fontSize,
              fontWeight: visual.fontWeight,
            }}
          >
            {title}
          </h2>
          {subtitle ? (
            <p className={cn("mt-2 text-sm leading-relaxed", isDark ? "text-white/60" : "text-neutral-500")}>
              {subtitle}
            </p>
          ) : null}
        </div>

        {items.length === 0 ? (
          <p
            className={cn(
              "rounded-xl border border-dashed px-4 py-10 text-center text-sm",
              isDark ? "border-white/15 text-white/40" : "border-neutral-200 text-neutral-400"
            )}
          >
            Add quotes in the editor
          </p>
        ) : layout === "spotlight" ? (
          <div className="mx-auto max-w-2xl">
            <QuoteCard
              item={items[0]}
              isDark={isDark}
              isModern={isModern}
              cardStyle={cardStyle}
              large
            />
            {items.length > 1 ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {items.slice(1, 3).map((item, index) => (
                  <QuoteCard
                    key={`${item.author}-${index}`}
                    item={item}
                    isDark={isDark}
                    isModern={isModern}
                    cardStyle={cardStyle}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : layout === "carousel" ? (
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {items.map((item, index) => (
              <div key={`${item.author}-${index}`} className="w-[85%] shrink-0 snap-start sm:w-[45%] lg:w-[32%]">
                <QuoteCard item={item} isDark={isDark} isModern={isModern} cardStyle={cardStyle} />
              </div>
            ))}
          </div>
        ) : layout === "stacked" ? (
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            {items.map((item, index) => (
              <QuoteCard
                key={`${item.author}-${index}`}
                item={item}
                isDark={isDark}
                isModern={isModern}
                cardStyle={cardStyle}
              />
            ))}
          </div>
        ) : layout === "minimal" ? (
          <div
            className={cn(
              "grid gap-8",
              items.length === 1 && "mx-auto max-w-xl",
              items.length === 2 && "md:grid-cols-2",
              items.length >= 3 && "md:grid-cols-3"
            )}
          >
            {items.map((item, index) => (
              <figure key={`${item.author}-${index}`} className="text-center">
                <blockquote
                  className={cn(
                    "text-[15px] leading-relaxed",
                    isDark ? "text-neutral-200" : "text-neutral-800"
                  )}
                >
                  “{item.quote || "Customer quote"}”
                </blockquote>
                <figcaption className="mt-4">
                  {item.author ? (
                    <p
                      className={cn(
                        "text-[11px] font-semibold uppercase tracking-[0.12em]",
                        isDark ? "text-white/70" : "text-neutral-500"
                      )}
                    >
                      {item.author}
                    </p>
                  ) : null}
                  {item.role ? (
                    <p className={cn("mt-1 text-xs", isDark ? "text-white/40" : "text-neutral-400")}>
                      {item.role}
                    </p>
                  ) : null}
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div
            className={cn(
              "grid gap-5",
              items.length === 1 && "mx-auto max-w-xl",
              (items.length === 2 || columns === 2) && "md:grid-cols-2",
              items.length >= 3 && columns !== 2 && "md:grid-cols-3"
            )}
          >
            {items.map((item, index) => (
              <QuoteCard
                key={`${item.author}-${index}`}
                item={item}
                isDark={isDark}
                isModern={isModern}
                cardStyle={cardStyle}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
