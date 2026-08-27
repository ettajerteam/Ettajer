"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

/** Academy-quiet kicker — soft weight, not ultra tracking */
export function SaraLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-[12px] font-medium tracking-[-0.01em] text-white/40",
        className
      )}
    >
      {children}
    </p>
  );
}

export function SaraSectionHeading({
  id,
  children,
  className,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      id={id}
      className={cn(
        "mt-3 text-[22px] font-semibold tracking-tight text-white sm:text-[24px]",
        className
      )}
    >
      {children}
    </h2>
  );
}

export function SaraSectionLead({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("mt-2 max-w-xl text-[14px] leading-relaxed text-white/45", className)}>
      {children}
    </p>
  );
}

export function SaraGlass({
  children,
  className,
  strong = false,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  strong?: boolean;
  as?: "div" | "section" | "article";
}) {
  return (
    <Tag
      className={cn(
        strong ? "sara-glass-strong" : "sara-glass",
        "rounded-[24px]",
        className
      )}
    >
      {children}
    </Tag>
  );
}

export function PresenceDot({
  label,
  tone = "sky",
}: {
  label: string;
  tone?: "sky" | "amber" | "emerald";
}) {
  const color =
    tone === "amber"
      ? "bg-amber-300"
      : tone === "emerald"
        ? "bg-emerald-300"
        : "bg-[#5AC8FA]";
  return (
    <span className="sara-glass-chip text-[11px] font-medium tracking-[-0.01em] text-white/65">
      <span className="relative flex h-1.5 w-1.5">
        <span
          className={cn(
            "absolute inset-0 rounded-full opacity-40 motion-safe:animate-ping",
            color
          )}
        />
        <span className={cn("relative h-1.5 w-1.5 rounded-full", color)} />
      </span>
      {label}
    </span>
  );
}

export function MetaChip({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "blue" | "amber" | "red" | "green";
}) {
  const toneClass =
    tone === "blue"
      ? "text-[#5AC8FA]"
      : tone === "amber"
        ? "text-amber-200/90"
        : tone === "red"
          ? "text-red-200/90"
          : tone === "green"
            ? "text-emerald-200/90"
            : "text-white/75";

  return (
    <span className="sara-glass-chip text-[11px]">
      <span className="text-white/35">{label}</span>
      <span className={cn("font-medium tracking-[-0.01em]", toneClass)}>{value}</span>
    </span>
  );
}

export function SaraCta({
  href,
  children,
  className,
  ghost = false,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  ghost?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(ghost ? "sara-cta-ghost" : "sara-cta", className)}
    >
      {children}
    </Link>
  );
}

export function riskTone(level: string): "red" | "amber" | "neutral" {
  if (/critical|high/i.test(level)) return "red";
  if (/medium|watch|attention/i.test(level)) return "amber";
  return "neutral";
}

export function SoftDivider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "h-px w-full bg-gradient-to-r from-transparent via-white/12 to-transparent",
        className
      )}
    />
  );
}
