import Image from "next/image";
import Link from "next/link";
import { getThemeAssets } from "@/lib/storefront-assets";
import { FadeInSection } from "@/components/storefront/motion-wrapper";
import { HeroOverlay } from "@/components/storefront/hero-overlay";
import { parseSectionVisualSettings, getDeviceStyles } from "@/lib/builder/section-styles";
import type { DeviceMode } from "@/lib/builder/types";
import type { HeroSectionSettings } from "@/lib/sections/types";
import type { PublicStore } from "@/types/storefront";
import type { ThemeId } from "@/lib/themes";
import { resolveStoreNavHref } from "@/lib/storefront-urls";
import { builderFocusAttrs } from "@/lib/builder/builder-focus";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  store: PublicStore;
  settings: HeroSectionSettings;
  previewDevice?: DeviceMode;
  builderMode?: boolean;
  sectionId?: string;
}

function heroStyles(theme: string) {
  const id = theme as ThemeId;
  if (id === "bold") {
    return {
      wrap: "relative max-w-6xl mx-auto px-6 pt-8 pb-16",
      image: "relative h-56 sm:h-72 rounded-2xl overflow-hidden mb-10 ring-1 ring-white/10",
      title: "text-5xl sm:text-6xl font-black tracking-tighter text-white mb-4",
      subtitle: "text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed",
      textWrap: "text-center relative z-10",
    };
  }
  if (id === "modern") {
    return {
      wrap: "relative max-w-7xl mx-auto px-6 pt-6 pb-20",
      image: "relative h-64 sm:h-96 rounded-none overflow-hidden mb-8",
      title: "text-5xl sm:text-7xl font-black uppercase tracking-tighter mb-4",
      subtitle: "text-lg text-neutral-600 max-w-2xl leading-snug mx-auto",
      textWrap: "max-w-4xl mx-auto",
    };
  }
  return {
    wrap: "relative max-w-6xl mx-auto px-6 pt-8 pb-16",
    image: "relative h-48 sm:h-64 rounded-3xl overflow-hidden mb-10",
    title: "text-5xl sm:text-6xl font-bold tracking-tight text-gray-900 mb-4",
    subtitle: "text-lg text-gray-500 font-light max-w-xl mx-auto leading-relaxed",
    textWrap: "text-center -mt-24 relative z-10",
  };
}

export function HeroSection({
  store,
  settings,
  previewDevice,
  builderMode,
  sectionId,
}: HeroSectionProps) {
  const assets = getThemeAssets(store.theme);
  const styles = heroStyles(store.theme);
  const settingsRecord = settings as Record<string, unknown>;
  const visual = parseSectionVisualSettings(settingsRecord);
  const deviceStyles = getDeviceStyles(settingsRecord, previewDevice ?? "desktop");
  const headline = settings.headline || store.name;
  const accentHeadline = settings.accentHeadline?.trim();
  const subheadline =
    settings.subheadline ||
    (settings.showStoreDescription !== false ? store.description : null);
  const ctaText = settings.ctaText?.trim();
  const ctaLink = settings.ctaLink?.trim();
  const secondaryCtaText = settings.secondaryCtaText?.trim();
  const secondaryCtaLink = settings.secondaryCtaLink?.trim();
  const alignment = deviceStyles.alignment ?? settings.alignment ?? "center";
  const textAlign =
    alignment === "left" ? "text-left" : alignment === "right" ? "text-right" : "text-center";
  const textWrapAlign = alignment === "left" ? "max-w-4xl" : styles.textWrap;
  const imageSrc = visual.imageUrl || assets.hero;
  const imageAlt = settings.imageAlt?.trim() || headline;
  const overlay = Boolean(settings.overlay);
  const split = settings.layout === "split";
  const editorial = settings.layout === "editorial";
  const eyebrow = settings.eyebrow?.trim();
  const textFocus = builderMode ? builderFocusAttrs(sectionId, "text", "headline") : undefined;

  const textStyle = {
    color: visual.textColor,
    fontSize: deviceStyles.fontSize ?? visual.fontSize,
    fontWeight: visual.fontWeight,
  };

  const imageStyle = {
    width: visual.width,
    height: visual.height,
    minHeight: visual.minHeight,
    borderRadius: visual.borderRadius,
    boxShadow: visual.boxShadow,
  };

  const resolvedCtaLink = ctaLink ? resolveStoreNavHref(store.slug, ctaLink) : undefined;
  const resolvedSecondaryLink = secondaryCtaLink
    ? resolveStoreNavHref(store.slug, secondaryCtaLink)
    : undefined;

  const ctaClassName = overlay
    ? store.theme === "modern"
      ? "inline-flex items-center rounded-sm bg-white px-8 py-3.5 text-sm font-semibold tracking-tight text-black transition hover:bg-neutral-100"
      : "inline-flex items-center rounded-full bg-white px-7 py-3.5 text-sm font-semibold tracking-tight text-black transition hover:bg-white/90"
    : editorial
      ? "inline-flex items-center justify-center rounded-md bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
      : split
        ? "mt-2 inline-flex items-center justify-center rounded-2xl bg-[#2563eb] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-[#1d4ed8]"
        : "mt-6 inline-flex items-center rounded-full bg-[#007AFF] px-6 py-2.5 text-sm font-medium text-white";

  if (overlay) {
    return (
      <HeroOverlay
        brandName={store.name}
        showBrand={settings.showBrand !== false}
        headline={headline}
        accentHeadline={accentHeadline}
        subheadline={subheadline}
        eyebrow={eyebrow}
        ctaText={ctaText}
        ctaHref={resolvedCtaLink}
        secondaryCtaText={secondaryCtaText}
        secondaryCtaHref={resolvedSecondaryLink}
        imageSrc={imageSrc}
        imageAlt={imageAlt}
        alignment={alignment}
        minHeight={visual.minHeight ?? "100svh"}
        backgroundColor={visual.backgroundColor ?? "#0a0a0a"}
        textStyle={textStyle}
        ctaClassName={ctaClassName}
        textFocusAttrs={textFocus}
      />
    );
  }

  if (editorial) {
    return (
      <FadeInSection
        className="w-full border-b border-neutral-200 bg-white"
        style={{ backgroundColor: visual.backgroundColor ?? "#ffffff" }}
      >
        <div className="grid items-stretch lg:grid-cols-2">
          <div className="order-2 flex flex-col justify-center px-6 py-12 sm:px-10 lg:order-1 lg:py-20 lg:pl-12 lg:pr-14 xl:pl-20">
            <div className="mx-auto w-full max-w-xl lg:mx-0">
              {eyebrow ? (
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  {eyebrow}
                </p>
              ) : null}
              <h1
                className={cn(
                  "text-balance text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl",
                  eyebrow && "mt-4",
                )}
                style={textStyle}
                {...textFocus}
              >
                {headline}
                {accentHeadline ? (
                  <>
                    <br />
                    <span className="text-neutral-500">{accentHeadline}</span>
                  </>
                ) : null}
              </h1>
              {subheadline ? (
                <p className="mt-6 max-w-prose text-pretty text-base font-light leading-relaxed text-neutral-500 sm:text-lg">
                  {subheadline}
                </p>
              ) : null}
              {ctaText ? (
                <div className="mt-9">
                  {resolvedCtaLink ? (
                    <Link href={resolvedCtaLink} className={ctaClassName}>
                      {ctaText}
                    </Link>
                  ) : (
                    <button type="button" className={ctaClassName}>
                      {ctaText}
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          <div className="relative order-1 min-h-[48vh] overflow-hidden bg-stone-100 lg:order-2 lg:min-h-[72vh]">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-cover object-center"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              unoptimized={imageSrc.startsWith("http")}
            />
          </div>
        </div>
      </FadeInSection>
    );
  }

  if (split) {
    return (
      <FadeInSection
        className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 lg:px-8"
        style={{ backgroundColor: visual.backgroundColor ?? "transparent" }}
      >
        <div
          className="relative overflow-hidden border border-slate-100 bg-white shadow-sm"
          style={{ borderRadius: visual.borderRadius ?? "32px" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-slate-50/20" />
          <div className="relative grid grid-cols-1 items-center gap-8 px-6 py-10 sm:px-12 md:py-16 lg:grid-cols-12">
            <div className="flex flex-col justify-center space-y-5 text-left lg:col-span-6">
              {eyebrow ? (
                <span className="inline-flex items-center gap-1.5 self-start rounded-2xl border border-slate-100 bg-white px-3 py-1 text-xs font-semibold tracking-wider text-[#2563eb] shadow-sm">
                  {eyebrow}
                </span>
              ) : null}
              <div className="space-y-3">
                <h1
                  className="whitespace-pre-line text-4xl font-extrabold leading-[1.12] tracking-tight text-slate-900 sm:text-5xl"
                  style={textStyle}
                  {...textFocus}
                >
                  {headline}
                  {accentHeadline ? (
                    <>
                      <br />
                      <span className="bg-gradient-to-r from-[#2563eb] to-[#4f46e5] bg-clip-text text-transparent">
                        {accentHeadline}
                      </span>
                    </>
                  ) : null}
                </h1>
                {subheadline ? (
                  <p className="max-w-xl text-sm font-light leading-relaxed text-slate-500 sm:text-base">
                    {subheadline}
                  </p>
                ) : null}
              </div>
              {ctaText ? (
                resolvedCtaLink ? (
                  <Link href={resolvedCtaLink} className={ctaClassName}>
                    {ctaText}
                  </Link>
                ) : (
                  <button type="button" className={ctaClassName}>
                    {ctaText}
                  </button>
                )
              ) : null}
            </div>

            <div className="relative flex justify-center lg:col-span-6">
              <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2563eb]/15 blur-3xl sm:h-96 sm:w-96" />
              <div
                className="relative flex aspect-square w-full max-w-md items-center justify-center border border-slate-100 bg-slate-50/60 p-6 shadow-inner sm:p-8"
                style={{
                  borderRadius: visual.borderRadius ?? "24px",
                  width: visual.width,
                  height: visual.height,
                  minHeight: visual.minHeight,
                  boxShadow: visual.boxShadow,
                }}
              >
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  width={480}
                  height={480}
                  className="max-h-[85%] max-w-[85%] object-contain drop-shadow-xl"
                  priority
                  unoptimized={imageSrc.startsWith("http")}
                />
              </div>
            </div>
          </div>
        </div>
      </FadeInSection>
    );
  }

  return (
    <FadeInSection className={styles.wrap}>
      <div className={styles.image} style={imageStyle}>
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 1152px"
          unoptimized={imageSrc.startsWith("http")}
        />
        {store.theme === "minimal" && (
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
        )}
        {store.theme === "bold" && (
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        )}
      </div>
      <div className={cn(textWrapAlign, textAlign)}>
        {eyebrow ? (
          <p
            className={cn(
              "mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500",
              alignment === "center" && "mx-auto",
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={cn(
            styles.title,
            alignment === "center" && "mx-auto",
            alignment === "right" && "ml-auto",
          )}
          style={textStyle}
          {...textFocus}
        >
          {headline}
          {accentHeadline ? (
            <>
              <br />
              <span className="text-[#2563eb]">{accentHeadline}</span>
            </>
          ) : null}
        </h1>
        {subheadline ? (
          <p
            className={cn(
              styles.subtitle,
              alignment === "center" && "mx-auto",
              alignment === "right" && "ml-auto",
            )}
            style={textStyle}
          >
            {subheadline}
          </p>
        ) : null}
        {ctaText ? (
          resolvedCtaLink ? (
            <Link href={resolvedCtaLink} className={ctaClassName}>
              {ctaText}
            </Link>
          ) : (
            <button type="button" className={ctaClassName}>
              {ctaText}
            </button>
          )
        ) : null}
      </div>
    </FadeInSection>
  );
}
