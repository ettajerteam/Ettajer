"use client";

import { Download, LayoutTemplate, Package, Truck } from "lucide-react";
import type { BusinessModel } from "@/lib/onboarding/business-models";
import { BUSINESS_MODEL_OPTIONS } from "@/lib/onboarding/business-models";
import type { OnboardingExtendedCopy } from "@/lib/onboarding/onboarding-i18n";
import { cn } from "@/lib/utils";

const ICONS = {
  package: Package,
  download: Download,
  truck: Truck,
} as const;

type Props = {
  copy: OnboardingExtendedCopy;
  value: BusinessModel | "";
  onChange: (value: BusinessModel) => void;
};

export function OnboardingBusinessModelStep({ copy, value, onChange }: Props) {
  const labels = copy.businessModel;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">{labels.title}</h2>
        <p className="text-muted-foreground">{labels.description}</p>
      </div>
      <div className="grid gap-3">
        {BUSINESS_MODEL_OPTIONS.map((option) => {
          const Icon = ICONS[option.icon];
          const detail = labels[option.id];
          const selected = value === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={cn(
                "flex items-start gap-4 rounded-xl border p-4 text-start transition-all duration-200",
                selected
                  ? "border-[#007AFF] bg-[#007AFF]/5 shadow-sm"
                  : "hover:border-muted-foreground/30 hover:bg-accent",
              )}
            >
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                  selected ? "bg-[#007AFF] text-white" : "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className={cn("font-semibold", selected && "text-[#007AFF]")}>
                  {detail.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{detail.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
