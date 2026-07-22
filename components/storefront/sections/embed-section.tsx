import { parseSectionVisualSettings } from "@/lib/builder/section-styles";
import type { DeviceMode } from "@/lib/builder/types";
import type { EmbedSectionSettings } from "@/lib/sections/types";
import type { PublicStore } from "@/types/storefront";

interface EmbedSectionProps {
  store: PublicStore;
  settings: EmbedSectionSettings;
  previewDevice?: DeviceMode;
}

const ALLOWED_HOST_FRAGMENTS = [
  "google.com/maps",
  "maps.google.",
  "youtube.com",
  "youtube-nocookie.com",
  "youtu.be",
  "player.vimeo.com",
  "vimeo.com",
  "instagram.com",
  "www.instagram.com",
];

function isAllowedEmbedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    const full = `${parsed.hostname}${parsed.pathname}`;
    return ALLOWED_HOST_FRAGMENTS.some(
      (fragment) =>
        parsed.hostname.includes(fragment.replace(/\/.*/, "")) || full.includes(fragment)
    );
  } catch {
    return false;
  }
}

export function EmbedSection({ settings }: EmbedSectionProps) {
  const visual = parseSectionVisualSettings(settings as Record<string, unknown>);
  const title = settings.title?.trim();
  const url = settings.url?.trim() ?? "";
  const aspectRatio = settings.aspectRatio?.trim() || "16 / 9";
  const allowed = url ? isAllowedEmbedUrl(url) : false;

  return (
    <section
      className="px-6 py-10"
      style={{
        padding: visual.padding,
        margin: visual.margin,
        backgroundColor: visual.backgroundColor,
      }}
    >
      <div className="mx-auto max-w-5xl">
        {title ? (
          <h2 className="mb-6 text-center text-2xl font-semibold tracking-tight text-neutral-900">
            {title}
          </h2>
        ) : null}
        {!url ? (
          <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50 text-sm text-neutral-400">
            Paste an embed URL (Maps, YouTube, Vimeo, Instagram)
          </div>
        ) : !allowed ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-6 text-center text-sm text-amber-800">
            This URL is not on the allowlist. Use Google Maps, YouTube, Vimeo, or Instagram embed links.
          </div>
        ) : (
          <div
            className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 shadow-sm"
            style={{ aspectRatio }}
          >
            <iframe
              src={url}
              title={title || "Embedded content"}
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </section>
  );
}
