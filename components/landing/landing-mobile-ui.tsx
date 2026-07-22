"use client";

import Link from "next/link";
import { LandingChevronForward } from "@/components/landing/landing-direction-icon";
import { cn } from "@/lib/utils";

export const LANDING_MOBILE_SECTION_SCROLL =
  "scroll-mt-[calc(3.25rem+env(safe-area-inset-top))] md:scroll-mt-24";

/** Consistent horizontal inset on mobile (12px / Tailwind 3). */
export const LANDING_MOBILE_GUTTER = "px-3";

/** Standard landing content width with mobile side inset. */
export const LANDING_MOBILE_CONTAINER = "mx-auto max-w-6xl px-3 md:px-6";

/** Carousel breakout matching {@link LANDING_MOBILE_GUTTER} — edge-to-edge swipe within a section. */
export const LANDING_MOBILE_CAROUSEL_BREAKOUT = "-mx-3 md:mx-0";

/** Standard mobile section spacing with safe-area bottom inset. */
export const LANDING_MOBILE_SECTION =
  "border-b border-black/[0.04] py-12 pb-[calc(2rem+env(safe-area-inset-bottom))] md:border-neutral-200 md:py-20 md:pb-20";

export const LANDING_MOBILE_SECTION_MUTED =
  "border-b border-black/[0.04] bg-[#F2F2F7] py-12 pb-[calc(2rem+env(safe-area-inset-bottom))] md:border-neutral-200 md:bg-neutral-50 md:py-20 md:pb-20";

export function LandingMobileGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[0.875rem] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_6px_20px_rgba(0,0,0,0.05)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function LandingMobileSectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-[13px] font-semibold uppercase tracking-wide text-[#8E8E93]",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function LandingMobileSectionLead({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("mt-1 text-[15px] leading-snug text-neutral-600", className)}>
      {children}
    </p>
  );
}

/** Inset mobile blocks (stats, lists, CTAs) — not for carousels. */
export function LandingMobileInsetStack({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-5 sm:gap-6", className)}>{children}</div>
  );
}

export function LandingMobileBriefHeader({
  eyebrow,
  title,
  subtitle,
  className,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <LandingMobileSectionLabel>{eyebrow}</LandingMobileSectionLabel>
      <h2 className="mt-2 text-[1.65rem] font-bold leading-[1.12] tracking-[-0.02em] text-neutral-900 sm:text-[1.85rem]">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-2.5 text-[15px] leading-relaxed text-neutral-600 sm:text-[16px]">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

export function LandingMobileFeatureGrid({
  items,
}: {
  items: readonly {
    icon: React.ComponentType<{ className?: string; strokeWidth?: number | string }>;
    label: string;
  }[];
}) {
  return (
    <LandingMobileGroup className="overflow-visible p-2.5 sm:p-3">
      <ul className="flex flex-col gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li
              key={item.label}
              className="flex min-w-0 items-center gap-3 rounded-[0.65rem] bg-[#F2F2F7] px-3 py-3"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#007AFF]/10">
                <Icon className="h-4 w-4 text-[#007AFF]" strokeWidth={2.25} />
              </span>
              <span className="min-w-0 flex-1 text-[15px] font-semibold leading-snug text-neutral-800">
                {item.label}
              </span>
            </li>
          );
        })}
      </ul>
    </LandingMobileGroup>
  );
}

export function LandingMobileListRow({
  href,
  title,
  subtitle,
  onClick,
  external,
}: {
  href: string;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  external?: boolean;
}) {
  const className =
    "flex items-center justify-between gap-4 border-b border-[#E5E5EA] px-4 py-3.5 transition-colors last:border-0 active:bg-[#F2F2F7]/80";

  const inner = (
    <>
      <div className="min-w-0 flex-1">
        <p className="text-[17px] font-medium text-neutral-900">{title}</p>
        {subtitle ? (
          <p className="mt-0.5 text-[14px] text-[#8E8E93]">{subtitle}</p>
        ) : null}
      </div>
      <LandingChevronForward className="h-5 w-5 shrink-0 text-[#C7C7CC]" />
    </>
  );

  if (external || href.startsWith("mailto:")) {
    return (
      <a href={href} className={className} onClick={onClick}>
        {inner}
      </a>
    );
  }

  if (href.startsWith("#")) {
    return (
      <a href={href} className={className} onClick={onClick}>
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={className} onClick={onClick}>
      {inner}
    </Link>
  );
}

export function LandingMobilePill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-[#007AFF]/10 px-3.5 py-1.5 text-[13px] font-semibold text-[#007AFF]",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function LandingMobileStatStrip({
  items,
}: {
  items: { value: React.ReactNode; label: string }[];
}) {
  return (
    <LandingMobileGroup className="overflow-visible p-0">
      <div className="grid min-w-0 grid-cols-3 divide-x divide-[#E5E5EA]">
        {items.map((item) => (
          <div key={item.label} className="min-w-0 px-2 py-4 text-center sm:px-3 sm:py-5">
            <p className="text-[1.2rem] font-bold leading-none tracking-tight text-neutral-900 sm:text-[1.35rem]">
              {item.value}
            </p>
            <p className="mt-1.5 text-[10px] font-medium leading-tight text-[#8E8E93] sm:text-[11px]">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </LandingMobileGroup>
  );
}
