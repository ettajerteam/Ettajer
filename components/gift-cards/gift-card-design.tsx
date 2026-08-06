"use client";

import { Gift } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import {
  getGiftCardTemplate,
  type GiftCardTemplateId,
} from "@/lib/gift-card-templates";

interface GiftCardDesignProps {
  templateId?: GiftCardTemplateId | string | null;
  balanceLabel?: string;
  currency?: string;
  code?: string;
  storeName?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  selected?: boolean;
}

export function GiftCardDesign({
  templateId,
  balanceLabel,
  currency = "MAD",
  code = "GC-XXXX-XXXX-XXXX",
  storeName = "Your store",
  size = "md",
  className,
  selected,
}: GiftCardDesignProps) {
  const template = getGiftCardTemplate(templateId);
  const amount =
    balanceLabel ??
    (currency ? formatCurrency(0, currency).replace(/[\d.,\s]+/, "•••") : "•••");

  const sizeClass =
    size === "sm"
      ? "aspect-[1.65/1] rounded-xl p-3"
      : size === "lg"
        ? "aspect-[1.65/1] rounded-[1.35rem] p-5 sm:p-6"
        : "aspect-[1.65/1] rounded-2xl p-4";

  return (
    <div
      className={cn(
        "relative overflow-hidden shadow-[0_12px_32px_-18px_rgba(15,23,42,0.45)] transition-transform",
        sizeClass,
        selected && "ring-2 ring-[#007AFF] ring-offset-2 ring-offset-background",
        className
      )}
      style={{
        background: template.background,
        color: template.color,
        border: template.border,
      }}
    >
      {template.pattern === "dots" ? (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: 0.35,
            backgroundImage: `radial-gradient(circle at 1px 1px, ${template.patternColor ?? "currentColor"} 1px, transparent 0)`,
            backgroundSize: "14px 14px",
          }}
        />
      ) : null}
      {template.pattern === "lines" ? (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: 0.9,
            backgroundImage: `repeating-linear-gradient(-28deg, ${template.patternColor ?? "currentColor"} 0 1px, transparent 1px 12px)`,
          }}
        />
      ) : null}
      {template.pattern === "glow" ? (
        <div
          className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full blur-2xl"
          style={{ background: template.patternColor ?? "rgba(255,255,255,0.25)" }}
        />
      ) : null}

      <div className="relative z-[1] flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p
              className={cn(
                "truncate font-semibold",
                size === "sm" ? "text-[10px]" : "text-[13px]"
              )}
              style={{ color: template.color }}
            >
              {storeName}
            </p>
            <p
              className={cn(size === "sm" ? "text-[9px]" : "text-[11px]")}
              style={{ color: template.mutedColor }}
            >
              Gift card
            </p>
          </div>
          <Gift
            className={cn(
              "shrink-0 opacity-90",
              size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5"
            )}
            style={{ color: template.color }}
          />
        </div>

        <div>
          <p
            className={cn(
              "font-semibold tabular-nums tracking-tight",
              size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-xl"
            )}
            style={{ color: template.color }}
          >
            {amount}
          </p>
          <p
            className={cn(
              "mt-1 truncate font-mono",
              size === "sm" ? "text-[8px]" : "text-[10px]"
            )}
            style={{ color: template.mutedColor }}
          >
            {code}
          </p>
        </div>
      </div>
    </div>
  );
}
