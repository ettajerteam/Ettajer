import Image from "next/image";
import { parseSectionVisualSettings } from "@/lib/builder/section-styles";
import type { DeviceMode } from "@/lib/builder/types";
import type { LogoWallSectionSettings } from "@/lib/sections/types";
import type { PublicStore } from "@/types/storefront";
import { cn } from "@/lib/utils";

interface LogoWallSectionProps {
  store: PublicStore;
  settings: LogoWallSectionSettings;
  previewDevice?: DeviceMode;
}

export function LogoWallSection({ settings }: LogoWallSectionProps) {
  const visual = parseSectionVisualSettings(settings as Record<string, unknown>);
  const title = settings.title?.trim();
  const grayscale = settings.grayscale !== false;
  const columns = Math.min(6, Math.max(3, Number(settings.columns) || 4));
  const logos = (settings.logos ?? []).filter((logo) => logo.url?.trim());

  const gridClass =
    columns >= 6
      ? "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6"
      : columns === 5
        ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
        : columns === 3
          ? "grid-cols-2 sm:grid-cols-3"
          : "grid-cols-2 sm:grid-cols-4";

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
      <div className="mx-auto max-w-6xl">
        {title ? (
          <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
            {title}
          </p>
        ) : null}

        {logos.length === 0 ? (
          <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50 text-sm text-neutral-400">
            Add logos in the editor
          </div>
        ) : (
          <div className={cn("grid items-center justify-items-center gap-8", gridClass)}>
            {logos.map((logo, i) => {
              const img = (
                <Image
                  src={logo.url}
                  alt={logo.alt?.trim() || `Logo ${i + 1}`}
                  width={140}
                  height={48}
                  className={cn(
                    "h-10 w-auto max-w-[140px] object-contain opacity-80 transition hover:opacity-100",
                    grayscale && "grayscale"
                  )}
                  unoptimized
                />
              );
              const href = logo.href?.trim();
              if (href) {
                return (
                  <a
                    key={`${logo.url}-${i}`}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex"
                  >
                    {img}
                  </a>
                );
              }
              return (
                <div key={`${logo.url}-${i}`} className="inline-flex">
                  {img}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
