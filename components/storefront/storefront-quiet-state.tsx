import Link from "next/link";
import { cn } from "@/lib/utils";

export interface QuietStateAction {
  label: string;
  href: string;
  onClick?: () => void;
}

interface StorefrontQuietStateProps {
  eyebrow?: string;
  title: string;
  description?: string;
  primaryAction?: QuietStateAction;
  secondaryAction?: QuietStateAction;
  isBold?: boolean;
  isModern?: boolean;
  /** Tighter padding for drawers / inline panels */
  compact?: boolean;
  className?: string;
}

export function StorefrontQuietState({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  isBold = false,
  isModern = false,
  compact = false,
  className,
}: StorefrontQuietStateProps) {
  const shape = isModern
    ? "rounded-sm uppercase tracking-[0.12em]"
    : "rounded-full";

  return (
    <div
      className={cn(
        "mx-auto max-w-md text-center",
        compact ? "px-2 py-16" : "px-6 py-20 sm:py-24",
        className
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "mb-3 text-[11px] font-semibold uppercase tracking-[0.2em]",
            isBold ? "text-white/40" : "text-neutral-400"
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <p
        className={cn(
          "text-lg font-medium tracking-tight sm:text-xl",
          isBold ? "text-white" : "text-neutral-900"
        )}
      >
        {title}
      </p>
      {description ? (
        <p
          className={cn(
            "mx-auto mt-2 max-w-sm text-sm leading-relaxed",
            isBold ? "text-white/45" : "text-neutral-500"
          )}
        >
          {description}
        </p>
      ) : null}
      {primaryAction || secondaryAction ? (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {primaryAction ? (
            <Link
              href={primaryAction.href}
              onClick={primaryAction.onClick}
              className={cn(
                "inline-flex h-11 items-center px-6 text-[13px] font-semibold text-white transition hover:opacity-90",
                shape
              )}
              style={{ backgroundColor: "var(--store-primary, #0a0a0a)" }}
            >
              {primaryAction.label}
            </Link>
          ) : null}
          {secondaryAction ? (
            <Link
              href={secondaryAction.href}
              onClick={secondaryAction.onClick}
              className={cn(
                "inline-flex h-11 items-center border px-6 text-[13px] font-medium transition",
                isModern ? "rounded-sm uppercase tracking-[0.1em]" : "rounded-full",
                isBold
                  ? "border-white/25 text-white/80 hover:border-white/50"
                  : "border-neutral-300 text-neutral-700 hover:border-neutral-500"
              )}
            >
              {secondaryAction.label}
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
