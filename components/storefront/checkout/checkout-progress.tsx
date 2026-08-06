"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { getStorefrontCopy } from "@/lib/storefront/storefront-i18n";
import {
  getCheckoutThemeStyles,
  type CheckoutThemeStyles,
} from "@/lib/checkout-theme-styles";
import type { CheckoutThemeId } from "@/lib/shop-preferences";

interface CheckoutProgressProps {
  currentStep: number;
  language?: string;
  theme?: CheckoutThemeId | string;
}

export function CheckoutProgress({
  currentStep,
  language,
  theme,
}: CheckoutProgressProps) {
  const t = getStorefrontCopy(language);
  const styles = getCheckoutThemeStyles(theme);
  const steps = [
    { id: 1, label: t.checkout.stepDetails },
    { id: 2, label: t.checkout.stepDelivery },
    { id: 3, label: t.checkout.stepPay },
  ];

  return (
    <nav aria-label={t.checkout.stepsAria} className={styles.progressWrap}>
      <ol className="flex items-center justify-between gap-2 sm:justify-center sm:gap-0">
        {steps.map((step, index) => {
          const isComplete = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <li key={step.id} className="flex flex-1 items-center sm:flex-none">
              <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:gap-2.5">
                <span
                  className={cn(
                    "inline-flex items-center justify-center transition",
                    styles.progressDot,
                    isComplete && styles.progressDotDone,
                    isCurrent && styles.progressDotCurrent,
                    !isComplete && !isCurrent && styles.progressDotIdle
                  )}
                >
                  {isComplete ? (
                    <Check
                      className={cn(
                        styles.id === "compact" ? "h-3 w-3" : "h-3.5 w-3.5"
                      )}
                      strokeWidth={2.5}
                    />
                  ) : (
                    step.id
                  )}
                </span>
                <span
                  className={cn(
                    styles.progressLabel,
                    isCurrent ? "text-neutral-900" : "text-neutral-400"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 ? (
                <div
                  className={cn(
                    "mx-2 hidden flex-1 sm:mx-4 sm:block sm:w-14 sm:flex-none",
                    styles.progressConnector,
                    currentStep > step.id &&
                      (styles.id === "soft"
                        ? "bg-[var(--store-primary)]"
                        : "bg-neutral-900")
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

/** Shared for settings phone preview progress dots */
export function checkoutProgressDotClass(
  styles: CheckoutThemeStyles,
  state: "current" | "done" | "idle"
) {
  return cn(
    "inline-flex items-center justify-center",
    styles.progressDot,
    state === "current" && styles.progressDotCurrent,
    state === "done" && styles.progressDotDone,
    state === "idle" && styles.progressDotIdle
  );
}
