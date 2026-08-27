"use client";

import { cn } from "@/lib/utils";

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
        "text-[10px] font-medium uppercase tracking-[0.2em] text-white/30",
        className
      )}
    >
      {children}
    </p>
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
        : "bg-sky-300";
  return (
    <span className="inline-flex items-center gap-2 text-[10px] font-medium tracking-[0.14em] text-white/55">
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
      ? "text-sky-200/90"
      : tone === "amber"
        ? "text-amber-200/90"
        : tone === "red"
          ? "text-red-200/90"
          : tone === "green"
            ? "text-emerald-200/90"
            : "text-white/65";

  return (
    <span className="inline-flex items-baseline gap-1.5 text-[11px]">
      <span className="text-white/30">{label}</span>
      <span className={cn("font-medium tracking-wide", toneClass)}>{value}</span>
    </span>
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
      className={cn("h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent", className)}
    />
  );
}
