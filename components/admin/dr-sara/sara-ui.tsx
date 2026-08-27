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
        "text-[10px] font-medium uppercase tracking-[0.16em] text-white/35",
        className
      )}
    >
      {children}
    </p>
  );
}

export function SaraPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 sm:p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

export function LivePulse({ label = "LIVE" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-medium tracking-[0.12em] text-emerald-300">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inset-0 rounded-full bg-emerald-400 motion-safe:animate-ping opacity-40" />
        <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
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
      ? "text-sky-300 border-sky-400/20 bg-sky-400/10"
      : tone === "amber"
        ? "text-amber-300 border-amber-400/20 bg-amber-400/10"
        : tone === "red"
          ? "text-red-300 border-red-400/20 bg-red-400/10"
          : tone === "green"
            ? "text-emerald-300 border-emerald-400/20 bg-emerald-400/10"
            : "text-white/70 border-white/[0.08] bg-white/[0.03]";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px]",
        toneClass
      )}
    >
      <span className="opacity-60">{label}</span>
      <span className="font-medium">{value}</span>
    </span>
  );
}

export function riskTone(level: string): "red" | "amber" | "neutral" {
  if (/critical|high/i.test(level)) return "red";
  if (/medium|watch|attention/i.test(level)) return "amber";
  return "neutral";
}
