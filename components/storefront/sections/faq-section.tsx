import { parseSectionVisualSettings, getDeviceStyles } from "@/lib/builder/section-styles";
import type { DeviceMode } from "@/lib/builder/types";
import type { FaqItem, FaqSectionSettings } from "@/lib/sections/types";
import type { PublicStore } from "@/types/storefront";
import { cn } from "@/lib/utils";

interface FaqSectionProps {
  store: PublicStore;
  settings: FaqSectionSettings;
  previewDevice?: DeviceMode;
}

type Layout = NonNullable<FaqSectionSettings["layout"]>;

function normalizeFaqItems(settings: FaqSectionSettings): FaqItem[] {
  if (Array.isArray(settings.items)) {
    return settings.items
      .map((item) => ({
        question: typeof item?.question === "string" ? item.question.trim() : "",
        answer: typeof item?.answer === "string" ? item.answer.trim() : "",
      }))
      .filter((item) => item.question || item.answer);
  }
  return [];
}

function AccordionItem({
  item,
  index,
  openFirst,
  isDark,
  compact,
}: {
  item: FaqItem;
  index: number;
  openFirst: boolean;
  isDark: boolean;
  compact?: boolean;
}) {
  return (
    <details className="group" open={openFirst && index === 0}>
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center justify-between gap-3 text-left font-medium transition marker:content-none [&::-webkit-details-marker]:hidden",
          compact ? "px-3 py-3 text-[13px]" : "px-4 py-4 text-sm",
          isDark ? "text-white hover:bg-white/5" : "text-neutral-900 hover:bg-neutral-50"
        )}
      >
        <span>{item.question || "Question"}</span>
        <span
          className={cn(
            "shrink-0 text-lg leading-none transition group-open:rotate-45",
            isDark ? "text-white/40" : "text-neutral-400"
          )}
          aria-hidden
        >
          +
        </span>
      </summary>
      {item.answer ? (
        <div
          className={cn(
            "leading-relaxed",
            compact ? "px-3 pb-3 text-[13px]" : "px-4 pb-4 text-sm",
            isDark ? "text-neutral-400" : "text-neutral-600"
          )}
        >
          {item.answer}
        </div>
      ) : null}
    </details>
  );
}

export function FaqSection({ store, settings, previewDevice }: FaqSectionProps) {
  const settingsRecord = settings as Record<string, unknown>;
  const visual = parseSectionVisualSettings(settingsRecord);
  const deviceStyles = getDeviceStyles(settingsRecord, previewDevice ?? "desktop");
  const items = normalizeFaqItems(settings);
  const title = settings.title?.trim() || "Frequently asked questions";
  const subtitle = settings.subtitle?.trim();
  const layout: Layout = settings.layout ?? "accordion";
  const openFirst = settings.openFirst !== false;
  const isBold = store.theme === "bold";
  const isModern = store.theme === "modern";
  const isDark =
    visual.backgroundColor?.toLowerCase() === "#0a0a0a" ||
    visual.textColor?.toLowerCase() === "#ffffff" ||
    isBold;

  const shell = cn(
    "divide-y overflow-hidden rounded-xl border",
    isDark ? "divide-white/10 border-white/10" : "divide-neutral-100 border-neutral-200 bg-white"
  );

  return (
    <section
      className="px-6 py-14 sm:py-20"
      style={{
        padding: visual.padding,
        margin: visual.margin,
        backgroundColor: visual.backgroundColor,
      }}
    >
      <div
        className={cn(
          "mx-auto",
          layout === "two-column" ? "max-w-5xl" : "max-w-2xl"
        )}
      >
        <div className="mb-8 text-center">
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
            Add questions in the editor
          </p>
        ) : layout === "two-column" ? (
          <div className="grid gap-4 md:grid-cols-2 md:gap-5">
            {[0, 1].map((col) => {
              const colItems = items.filter((_, i) => i % 2 === col);
              return (
                <div key={col} className={shell}>
                  {colItems.map((item, index) => (
                    <AccordionItem
                      key={`${item.question}-${index}`}
                      item={item}
                      index={index}
                      openFirst={openFirst && col === 0}
                      isDark={isDark}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        ) : layout === "stacked" ? (
          <div className="flex flex-col gap-4">
            {items.map((item, index) => (
              <div
                key={`${item.question}-${index}`}
                className={cn(
                  "rounded-xl border p-5",
                  isDark ? "border-white/10 bg-white/5" : "border-neutral-200 bg-white"
                )}
              >
                <h3
                  className={cn(
                    "text-sm font-semibold",
                    isDark ? "text-white" : "text-neutral-900"
                  )}
                >
                  {item.question || "Question"}
                </h3>
                {item.answer ? (
                  <p
                    className={cn(
                      "mt-2 text-sm leading-relaxed",
                      isDark ? "text-neutral-400" : "text-neutral-600"
                    )}
                  >
                    {item.answer}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className={shell}>
            {items.map((item, index) => (
              <AccordionItem
                key={`${item.question}-${index}`}
                item={item}
                index={index}
                openFirst={openFirst}
                isDark={isDark}
                compact={layout === "compact"}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
