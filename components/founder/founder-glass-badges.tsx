"use client";

import { Sparkles, BadgeCheck, FlaskConical } from "lucide-react";
import { formatFounderNumber } from "@/lib/founder/constants";
import { cn } from "@/lib/utils";

interface FounderGlassBadgesProps {
  founderNumber: number;
  tierLabel: string;
  statusLabel: string;
  className?: string;
}

function GlassPill({
  icon: Icon,
  children,
}: {
  icon: typeof Sparkles;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-black/[0.04] bg-white px-3 py-1.5 text-[12px] font-medium text-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] md:border-white/80 md:bg-white/60 md:shadow-[0_1px_3px_rgba(0,0,0,0.04)] md:backdrop-blur-md">
      <Icon className="h-3.5 w-3.5 text-[#007AFF]" strokeWidth={2} />
      {children}
    </span>
  );
}

export function FounderGlassBadges({
  founderNumber,
  tierLabel,
  statusLabel,
  className,
}: FounderGlassBadgesProps) {
  return (
    <div className={cn("flex justify-center", className)}>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [-webkit-overflow-scrolling:touch] md:mx-0 md:justify-center md:overflow-visible md:px-0">
        <div className="inline-flex gap-2 md:rounded-full md:border md:border-white/70 md:bg-white/40 md:p-1.5 md:shadow-[0_4px_20px_rgba(0,0,0,0.05)] md:backdrop-blur-xl">
          <GlassPill icon={Sparkles}>{formatFounderNumber(founderNumber)}</GlassPill>
          <GlassPill icon={FlaskConical}>{statusLabel}</GlassPill>
          <GlassPill icon={BadgeCheck}>{tierLabel}</GlassPill>
        </div>
      </div>
    </div>
  );
}

export function FounderGlassBadge({
  founderNumber,
  className,
}: {
  founderNumber: number;
  className?: string;
}) {
  return (
    <div className={cn("flex justify-center", className)}>
      <GlassPill icon={Sparkles}>{formatFounderNumber(founderNumber)}</GlassPill>
    </div>
  );
}
