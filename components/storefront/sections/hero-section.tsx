import Image from "next/image";
import Link from "next/link";
import { getThemeAssets } from "@/lib/storefront-assets";
import { FadeInSection } from "@/components/storefront/motion-wrapper";
import { parseSectionVisualSettings, getDeviceStyles } from "@/lib/builder/section-styles";
import type { DeviceMode } from "@/lib/builder/types";
import type { HeroSectionSettings } from "@/lib/sections/types";
import type { PublicStore } from "@/types/storefront";
import type { ThemeId } from "@/lib/themes";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  store: PublicStore;
  settings: HeroSectionSettings;
  previewDevice?: DeviceMode;
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
      subtitle: "text-lg text-neutral-600 max-w-2xl leading-snug",
      textWrap: "max-w-4xl",
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

export function HeroSection({ store, settings, previewDevice }: HeroSectionProps) {
  const assets = getThemeAssets(store.theme);
  const styles = heroStyles(store.theme);
  const settingsRecord = settings as Record<string, unknown>;
  const visual = parseSectionVisualSettings(settingsRecord);
  const deviceStyles = getDeviceStyles(settingsRecord, previewDevice ?? "desktop");
  const headline = settings.headline || store.name;
  const subheadline =
    settings.subheadline ||
    (settings.showStoreDescription !== false ? store.description : null);
  const ctaText = settings.ctaText?.trim();
  const ctaLink = settings.ctaLink?.trim();
  const alignment = deviceStyles.alignment ?? settings.alignment ?? "center";
  const textAlign =
    alignment === "left" ? "text-left" : alignment === "right" ? "text-right" : "text-center";
  const textWrapAlign = alignment === "left" ? "max-w-4xl" : styles.textWrap;
  const imageSrc = visual.imageUrl || assets.hero;
  const imageAlt = settings.imageAlt?.trim() || headline;

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

  const ctaClassName =
    "mt-6 inline-flex items-center rounded-full bg-[#007AFF] px-6 py-2.5 text-sm font-medium text-white";

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
        <h1 className={styles.title} style={textStyle}>
          {headline}
        </h1>
        {subheadline ? (
          <p className={styles.subtitle} style={textStyle}>
            {subheadline}
          </p>
        ) : null}
        {ctaText ? (
          ctaLink ? (
            <Link href={ctaLink} className={ctaClassName}>
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
