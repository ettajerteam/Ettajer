"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { getStorefrontCopy } from "@/lib/storefront/storefront-i18n";

interface CheckoutProgressProps {
  currentStep: number;
  language?: string;
}

export function CheckoutProgress({ currentStep, language }: CheckoutProgressProps) {
  const t = getStorefrontCopy(language);
  const steps = [
    { id: 1, label: t.checkout.stepDetails },
    { id: 2, label: t.checkout.stepDelivery },
    { id: 3, label: t.checkout.stepPay },
  ];

  return (
    <nav aria-label={t.checkout.stepsAria} className="mb-8 sm:mb-10">
      <ol className="flex items-center justify-between gap-2 sm:justify-center sm:gap-0">
        {steps.map((step, index) => {
          const isComplete = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <li key={step.id} className="flex flex-1 items-center sm:flex-none">
              <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:gap-2.5">
                <span
                  className={cn(
                    "inline-flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-semibold transition",
                    isComplete && "bg-neutral-900 text-white",
                    isCurrent &&
                      "bg-[var(--store-primary)] text-white ring-4 ring-[color-mix(in_srgb,var(--store-primary)_18%,transparent)]",
                    !isComplete && !isCurrent && "bg-neutral-100 text-neutral-400"
                  )}
                >
                  {isComplete ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : step.id}
                </span>
                <span
                  className={cn(
                    "text-[11px] font-medium tracking-wide sm:text-[12px]",
                    isCurrent ? "text-neutral-900" : "text-neutral-400"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 ? (
                <div
                  className={cn(
                    "mx-2 hidden h-px flex-1 sm:mx-4 sm:block sm:w-14 sm:flex-none",
                    currentStep > step.id ? "bg-neutral-900" : "bg-neutral-200"
                  )}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
