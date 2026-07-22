import { getDeviceStyles, parseSectionVisualSettings } from "@/lib/builder/section-styles";
import type { DeviceMode } from "@/lib/builder/types";
import type { RichTextSectionSettings } from "@/lib/sections/types";
import type { PublicStore } from "@/types/storefront";
import { NewsletterSignupForm } from "@/components/storefront/newsletter-signup-form";
import { builderFocusAttrs } from "@/lib/builder/builder-focus";
import { cn } from "@/lib/utils";

interface RichTextSectionProps {
  store: PublicStore;
  settings: RichTextSectionSettings;
  previewDevice?: DeviceMode;
  builderMode?: boolean;
  sectionId?: string;
}

function looksLikeHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function extractParagraphs(html: string): string[] {
  const matches = html.match(/<p[^>]*>[\s\S]*?<\/p>/gi);
  if (!matches?.length) return [html];
  return matches;
}

export function RichTextSection({
  store,
  settings,
  previewDevice,
  builderMode,
  sectionId,
}: RichTextSectionProps) {
  const settingsRecord = settings as Record<string, unknown>;
  const deviceStyles = getDeviceStyles(settingsRecord, previewDevice ?? "desktop");
  const alignment = deviceStyles.alignment ?? settings.alignment ?? "center";
  const layout = settings.layout ?? "default";
  const isBold = store.theme === "bold";
  const isModern = store.theme === "modern";
  const visual = parseSectionVisualSettings(settingsRecord);
  const content = settings.content?.trim() ?? "";
  const textFocus = builderMode ? builderFocusAttrs(sectionId, "text", "content") : undefined;
  const isDark =
    visual.backgroundColor?.toLowerCase() === "#0a0a0a" ||
    visual.backgroundColor?.toLowerCase() === "#0f172a" ||
    visual.backgroundColor?.toLowerCase() === "#171717" ||
    visual.textColor?.toLowerCase() === "#e5e5e5" ||
    visual.textColor?.toLowerCase() === "#ffffff";

  const alignClass =
    alignment === "center"
      ? "text-center"
      : alignment === "right"
        ? "text-right"
        : "text-left";

  const textStyle = {
    color: visual.textColor,
    fontSize: deviceStyles.fontSize ?? visual.fontSize,
    fontWeight: visual.fontWeight,
  };

  const sectionStyle = {
    padding: visual.padding,
    margin: visual.margin,
    backgroundColor: visual.backgroundColor,
  };

  if (layout === "intro") {
    return (
      <section className="px-6 py-16 sm:py-24" style={sectionStyle}>
        <div className="mx-auto max-w-2xl text-center sm:max-w-3xl">
          {settings.title ? (
            <p
              className={cn(
                "mb-5 text-[11px] font-semibold uppercase tracking-[0.22em]",
                isDark ? "text-white/40" : "text-neutral-400"
              )}
            >
              {settings.title}
            </p>
          ) : null}
          {content ? (
            <div
              className={cn(
                "text-[1.65rem] font-medium leading-[1.25] tracking-[-0.02em] text-neutral-800 sm:text-3xl sm:leading-[1.22]",
                isModern && "font-normal text-neutral-700 [&_em]:font-serif [&_em]:italic",
                isDark && "text-white/90",
                "[&_p]:mb-0"
              )}
              style={textStyle}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : null}
        </div>
      </section>
    );
  }

  if (layout === "strip") {
    return (
      <section className="border-y border-white/8" style={sectionStyle}>
        <div
          className={cn(
            "mx-auto max-w-5xl px-6 py-4 text-center text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400 sm:py-5",
            "[&_em]:not-italic [&_p]:m-0 [&_strong]:font-semibold [&_strong]:text-neutral-200"
          )}
          style={textStyle}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </section>
    );
  }

  if (layout === "testimonials" && looksLikeHtml(content)) {
    const quotes = extractParagraphs(content);
    return (
      <section className="px-6 py-16 sm:py-20" style={sectionStyle}>
        <div className="mx-auto max-w-6xl">
          {settings.title ? (
            <h2
              className={cn(
                "mb-10 text-center text-xs font-semibold uppercase tracking-[0.22em] text-neutral-900",
                isBold && !visual.textColor && "text-white"
              )}
              style={textStyle}
            >
              {settings.title}
            </h2>
          ) : null}
          <div className="grid gap-10 md:grid-cols-3 md:gap-12">
            {quotes.map((quote, i) => (
              <div key={i} className="text-left">
                <div
                  className="text-[15px] leading-relaxed text-neutral-700 [&_em]:block [&_em]:not-italic [&_em]:text-[15px] [&_em]:leading-relaxed [&_em]:text-neutral-800 [&_strong]:mt-5 [&_strong]:block [&_strong]:text-[11px] [&_strong]:font-semibold [&_strong]:uppercase [&_strong]:tracking-[0.12em] [&_strong]:text-neutral-400"
                  dangerouslySetInnerHTML={{ __html: quote }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (layout === "stats" && looksLikeHtml(content)) {
    const items = extractParagraphs(content);
    return (
      <section className="px-6 py-16 sm:py-20" style={sectionStyle}>
        <div className="mx-auto max-w-5xl">
          {settings.title ? (
            <h2
              className={cn(
                "mb-12 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400",
                isBold && !visual.textColor && "text-white/40"
              )}
            >
              {settings.title}
            </h2>
          ) : null}
          <div
            className={cn(
              "grid gap-10 sm:grid-cols-3 sm:gap-0",
              "sm:divide-x sm:divide-neutral-200/90"
            )}
          >
            {items.map((item, i) => (
              <div
                key={i}
                className={cn(
                  "text-center sm:px-8",
                  alignment === "left" && "sm:text-left",
                  "[&_p]:m-0 [&_p]:text-[13px] [&_p]:leading-relaxed [&_p]:text-neutral-500"
                )}
                dangerouslySetInnerHTML={{
                  __html: item.replace(
                    /<strong>([^<]+)<\/strong>/i,
                    '<strong class="mb-2 block text-3xl font-semibold tracking-[-0.03em] text-neutral-900 sm:text-4xl">$1</strong>'
                  ),
                }}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (layout === "newsletter") {
    return (
      <section className="px-6 py-16 sm:py-20" style={sectionStyle}>
        <div className="mx-auto max-w-xl text-center">
          {settings.title ? (
            <h2
              className={cn(
                "mb-4 text-3xl font-semibold tracking-tight sm:text-4xl",
                isDark ? "text-white" : "text-neutral-900",
                isBold && !visual.textColor && "text-white"
              )}
              style={textStyle}
            >
              {settings.title}
            </h2>
          ) : null}
          {content ? (
            <div
              className={cn(
                "mb-8 space-y-3 text-sm leading-relaxed sm:text-base",
                isDark
                  ? "text-neutral-400 [&_strong]:text-white"
                  : "text-neutral-600 [&_strong]:text-neutral-900",
                "[&_em]:italic [&_p]:mb-2 [&_p:last-child]:mb-0"
              )}
              style={textStyle}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : null}
          <NewsletterSignupForm
            storeSlug={store.slug}
            source="newsletter"
            buttonText="Join"
            variant={isDark || isBold ? "dark" : "light"}
          />
        </div>
      </section>
    );
  }

  // Default essay / story body — one reading column, quiet type
  return (
    <section
      className={cn("mx-auto px-6 py-12 sm:py-16", alignment === "center" ? "max-w-2xl" : "max-w-xl sm:max-w-2xl")}
      style={sectionStyle}
    >
      {settings.title ? (
        <h2
          className={cn(
            "mb-6 text-2xl font-semibold tracking-tight sm:text-3xl",
            isModern && "text-3xl font-medium tracking-[-0.03em] sm:text-4xl",
            alignClass,
            isBold && !visual.textColor && "text-white"
          )}
          style={textStyle}
        >
          {settings.title}
        </h2>
      ) : null}
      {content ? (
        looksLikeHtml(content) ? (
          <div
            className={cn(
              "space-y-5 text-[15px] leading-[1.75] text-neutral-600 sm:text-base sm:leading-[1.8]",
              visual.textColor ? "[&_strong]:text-current" : "[&_strong]:text-neutral-900",
              isModern && "text-neutral-500",
              alignClass,
              isBold && !visual.textColor && "text-zinc-400 [&_strong]:text-white",
              "[&_em]:italic [&_p]:mb-0",
              "[&_h2]:mt-10 [&_h2]:mb-2.5 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-neutral-900 [&_h2:first-child]:mt-0",
              "[&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:tracking-tight [&_h3]:text-neutral-900",
              isBold &&
                !visual.textColor &&
                "[&_h2]:text-white [&_h3]:text-white"
            )}
            style={textStyle}
            dangerouslySetInnerHTML={{ __html: content }}
            {...textFocus}
          />
        ) : (
          <p
            className={cn(
              "whitespace-pre-wrap text-[15px] leading-[1.75] text-neutral-600 sm:text-base",
              alignClass,
              isBold && !visual.textColor && "text-zinc-400"
            )}
            style={textStyle}
            {...textFocus}
          >
            {content}
          </p>
        )
      ) : null}
    </section>
  );
}
