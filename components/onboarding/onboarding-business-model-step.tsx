"use client";

import { Check, Download, Package, Truck } from "lucide-react";
import type { BusinessModel } from "@/lib/onboarding/business-models";
import {
  BUSINESS_MODEL_OPTIONS,
  BUSINESS_MODELS,
} from "@/lib/onboarding/business-models";
import type { OnboardingExtendedCopy } from "@/lib/onboarding/onboarding-i18n";
import { cn } from "@/lib/utils";

const ICONS = {
  package: Package,
  download: Download,
  truck: Truck,
} as const;

type Props = {
  copy: OnboardingExtendedCopy;
  value: BusinessModel[];
  onChange: (value: BusinessModel[]) => void;
};

export function OnboardingBusinessModelStep({ copy, value, onChange }: Props) {
  const labels = copy.businessModel;
  const allSelected = BUSINESS_MODELS.every((id) => value.includes(id));

  const toggle = (id: BusinessModel) => {
    if (value.includes(id)) {
      onChange(value.filter((item) => item !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const selectAll = () => onChange([...BUSINESS_MODELS]);
  const clear = () => onChange([]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-[1.75rem]">
          {labels.title}
        </h2>
        <p className="mt-2 text-sm text-neutral-500 sm:text-[15px]">{labels.description}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-neutral-400">
          {value.length > 0 ? labels.selectedCount(value.length) : labels.hint}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={allSelected ? clear : selectAll}
            className="rounded-md px-2.5 py-1 text-xs font-semibold text-[#007AFF] transition-colors hover:bg-[#007AFF]/8"
          >
            {allSelected ? labels.clear : labels.selectAll}
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {BUSINESS_MODEL_OPTIONS.map((option) => {
          const Icon = ICONS[option.icon];
          const detail = labels[option.id];
          const selected = value.includes(option.id);

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => toggle(option.id)}
              aria-pressed={selected}
              className={cn(
                "flex items-start gap-4 rounded-2xl border p-4 text-start transition-all duration-200",
                selected
                  ? "border-[#007AFF] bg-[#007AFF]/[0.04] shadow-[0_1px_0_rgba(0,122,255,0.12)]"
                  : "border-neutral-200/80 bg-white/60 hover:border-neutral-300 hover:bg-white"
              )}
            >
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                  selected
                    ? "bg-[#007AFF] text-white"
                    : "bg-neutral-100 text-neutral-500"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p
                    className={cn(
                      "font-semibold tracking-tight",
                      selected ? "text-[#007AFF]" : "text-neutral-950"
                    )}
                  >
                    {detail.title}
                  </p>
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                      selected
                        ? "border-[#007AFF] bg-[#007AFF] text-white"
                        : "border-neutral-300 bg-white"
                    )}
                    aria-hidden
                  >
                    {selected ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                  {detail.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
