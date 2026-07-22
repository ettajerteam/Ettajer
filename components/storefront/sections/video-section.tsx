import { parseSectionVisualSettings, getDeviceStyles } from "@/lib/builder/section-styles";
import type { DeviceMode } from "@/lib/builder/types";
import type { VideoSectionSettings } from "@/lib/sections/types";
import type { PublicStore } from "@/types/storefront";
import { cn } from "@/lib/utils";

interface VideoSectionProps {
  store: PublicStore;
  settings: VideoSectionSettings;
  previewDevice?: DeviceMode;
}

export function resolveVideoEmbed(url: string):
  | { kind: "iframe"; src: string }
  | { kind: "video"; src: string }
  | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);

    if (
      parsed.hostname.includes("youtube.com") ||
      parsed.hostname.includes("youtube-nocookie.com") ||
      parsed.hostname === "youtu.be"
    ) {
      let id = "";
      if (parsed.hostname === "youtu.be") {
        id = parsed.pathname.slice(1).split("/")[0] ?? "";
      } else if (parsed.pathname.startsWith("/embed/")) {
        id = parsed.pathname.split("/")[2] ?? "";
      } else if (parsed.pathname.startsWith("/shorts/")) {
        id = parsed.pathname.split("/")[2] ?? "";
      } else {
        id = parsed.searchParams.get("v") ?? "";
      }
      if (id) {
        return { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${id}` };
      }
    }

    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean).pop();
      if (id && /^\d+$/.test(id)) {
        return { kind: "iframe", src: `https://player.vimeo.com/video/${id}` };
      }
    }

    if (/\.(mp4|webm|ogg)(\?|$)/i.test(parsed.pathname)) {
      return { kind: "video", src: trimmed };
    }
  } catch {
    return null;
  }

  return null;
}

export function VideoSection({ store, settings, previewDevice }: VideoSectionProps) {
  const settingsRecord = settings as Record<string, unknown>;
  const visual = parseSectionVisualSettings(settingsRecord);
  const deviceStyles = getDeviceStyles(settingsRecord, previewDevice ?? "desktop");
  const title = settings.title?.trim();
  const embed = resolveVideoEmbed(settings.videoUrl ?? "");
  const aspect = settings.aspectRatio ?? "16/9";
  const radius = visual.borderRadius ?? "0.75rem";
  const isDark =
    visual.backgroundColor?.toLowerCase() === "#0a0a0a" ||
    visual.textColor?.toLowerCase() === "#ffffff";

  return (
    <section
      className="px-6 py-12 sm:py-16"
      style={{
        padding: visual.padding,
        margin: visual.margin,
        backgroundColor: visual.backgroundColor,
      }}
    >
      <div className="mx-auto max-w-4xl">
        {title ? (
          <h2
            className={cn(
              "mb-6 text-center text-2xl font-semibold tracking-tight sm:text-3xl",
              isDark ? "text-white" : "text-neutral-900"
            )}
            style={{ color: visual.textColor, fontSize: deviceStyles.fontSize ?? visual.fontSize }}
          >
            {title}
          </h2>
        ) : null}

        {!embed ? (
          <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50 text-sm text-neutral-400">
            Paste a YouTube, Vimeo, or MP4 URL in the editor
          </div>
        ) : (
          <div
            className="relative w-full overflow-hidden bg-black"
            style={{ aspectRatio: aspect, borderRadius: radius }}
          >
            {embed.kind === "iframe" ? (
              <iframe
                src={embed.src}
                title={title || `${store.name} video`}
                className="absolute inset-0 h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            ) : (
              <video
                src={embed.src}
                controls
                playsInline
                poster={settings.posterUrl?.trim() || undefined}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
