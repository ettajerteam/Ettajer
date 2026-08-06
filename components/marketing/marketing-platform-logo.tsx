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
  sm: { box: "h-9 w-9 p-1.5", image: 22 },
  md: { box: "h-11 w-11 p-2", image: 26 },
  lg: { box: "h-14 w-14 p-2.5", image: 34 },
};

export function PlatformLogo({ platformId, size = "md", className }: PlatformLogoProps) {
  const platform = getMarketingPlatform(platformId);
  const dimensions = SIZES[size];

  if (!platform) return null;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-[10px] border border-black/[0.06] bg-white dark:border-white/10 dark:bg-white/[0.04]",
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
