import Image from "next/image";
import type { MarketingPlatformId } from "@/lib/marketing-integrations";
import { getMarketingPlatform } from "@/lib/marketing-integrations";
import { cn } from "@/lib/utils";

interface PlatformLogoProps {
  platformId: MarketingPlatformId;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: { box: "h-10 w-10 p-2", image: 24 },
  md: { box: "h-12 w-12 p-2.5", image: 28 },
  lg: { box: "h-16 w-16 p-3", image: 40 },
};

export function PlatformLogo({ platformId, size = "md", className }: PlatformLogoProps) {
  const platform = getMarketingPlatform(platformId);
  const dimensions = SIZES[size];

  if (!platform) return null;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-2xl border border-neutral-200/90 bg-white shadow-sm dark:border-white/10 dark:bg-[#1a1a1a]",
        dimensions.box,
        className
      )}
    >
      <Image
        src={platform.logo}
        alt={`${platform.name} logo`}
        width={dimensions.image}
        height={dimensions.image}
        className="h-full w-full object-contain"
        unoptimized
      />
    </div>
  );
}
