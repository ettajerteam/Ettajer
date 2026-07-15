"use client";

import { ArrowRight, ChevronRight } from "lucide-react";
import { isLandingRtl } from "@/lib/landing/landing-i18n";
import { useLandingLocale } from "@/components/landing/landing-locale-context";
import { cn } from "@/lib/utils";

type IconProps = {
  className?: string;
  strokeWidth?: number | string;
};

export function LandingArrowForward({ className, strokeWidth }: IconProps) {
  const { locale } = useLandingLocale();
  return (
    <ArrowRight
      className={cn(className, isLandingRtl(locale) && "scale-x-[-1]")}
      strokeWidth={strokeWidth}
    />
  );
}

export function LandingChevronForward({ className, strokeWidth }: IconProps) {
  const { locale } = useLandingLocale();
  return (
    <ChevronRight
      className={cn(className, isLandingRtl(locale) && "scale-x-[-1]")}
      strokeWidth={strokeWidth}
    />
  );
}
