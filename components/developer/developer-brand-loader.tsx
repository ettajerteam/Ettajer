import Image from "next/image";
import { cn } from "@/lib/utils";

const BRAND_ICON = "/brand/App-Logo.png";

type DeveloperBrandLoaderProps = {
  className?: string;
  /** Full-viewport route loading vs inline content loading */
  fullPage?: boolean;
  label?: string;
};

/** Branded loading state — logo, name, and moving dots under the mark. */
export function DeveloperBrandLoader({
  className,
  fullPage = false,
  label = "Ettajer for Developers",
}: DeveloperBrandLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className={cn(
        "flex flex-col items-center justify-center",
        fullPage ? "min-h-0 w-full flex-1 px-4" : "py-16",
        className,
      )}
    >
      <div className="flex flex-col items-center">
        <Image
          src={BRAND_ICON}
          alt=""
          width={44}
          height={44}
          className="h-11 w-11 rounded-[11px]"
          priority
        />
        <div className="mt-3.5 flex items-center gap-1.5" aria-hidden>
          <Dot delay="0ms" />
          <Dot delay="160ms" />
          <Dot delay="320ms" />
        </div>
      </div>
      <p className="mt-4 text-[14px] font-semibold text-neutral-900">
        Ettajer
        <span className="font-normal text-neutral-400"> for Developers</span>
      </p>
      <span className="sr-only">{label} is loading</span>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="h-1.5 w-1.5 rounded-full bg-[#007AFF] motion-safe:animate-[dev-dot-bounce_1.05s_ease-in-out_infinite]"
      style={{ animationDelay: delay }}
    />
  );
}
