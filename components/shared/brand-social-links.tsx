import {
  Facebook,
  Instagram,
  Music2,
  Pin,
  Youtube,
  type LucideIcon,
} from "lucide-react";
import {
  BRAND_SOCIAL_LINKS,
  type BrandSocialNetwork,
} from "@/lib/brand/social-links";
import { cn } from "@/lib/utils";

const ICONS: Record<BrandSocialNetwork, LucideIcon> = {
  instagram: Instagram,
  facebook: Facebook,
  tiktok: Music2,
  youtube: Youtube,
  pinterest: Pin,
};

type BrandSocialLinksProps = {
  className?: string;
  iconClassName?: string;
  /** Accessible label for the link group */
  ariaLabel?: string;
};

export function BrandSocialLinks({
  className,
  iconClassName,
  ariaLabel = "Ettajer on social media",
}: BrandSocialLinksProps) {
  return (
    <nav aria-label={ariaLabel} className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {BRAND_SOCIAL_LINKS.map((link) => {
        const Icon = ICONS[link.id];
        return (
          <a
            key={link.id}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            title={link.label}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition-colors duration-200 hover:bg-neutral-200/70 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20",
              iconClassName
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </a>
        );
      })}
    </nav>
  );
}
