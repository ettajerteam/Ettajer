"use client";

import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface ProductInfoFieldToggleProps {
  id: string;
  label: string;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  children: ReactNode;
  className?: string;
}

export function ProductInfoFieldToggle({
  id,
  label,
  enabled,
  onEnabledChange,
  children,
  className,
}: ProductInfoFieldToggleProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-black/[0.06] bg-white/50 p-3.5 backdrop-blur-md transition-colors dark:border-white/10 dark:bg-white/[0.04]",
        enabled && "border-[#007AFF]/20 bg-[#007AFF]/[0.03]",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id} className="cursor-pointer text-[13px] font-medium">
          {label}
        </Label>
        <Switch
          id={id}
          checked={enabled}
          onCheckedChange={onEnabledChange}
          aria-label={`${enabled ? "Disable" : "Enable"} ${label}`}
          className="h-5 w-9 data-[state=checked]:bg-[#007AFF]/85 data-[state=unchecked]:bg-neutral-200 dark:data-[state=unchecked]:bg-white/15 [&>span]:h-4 [&>span]:w-4 data-[state=checked]:[&>span]:translate-x-4"
        />
      </div>
      {enabled ? <div className="mt-2.5">{children}</div> : null}
    </div>
  );
}
