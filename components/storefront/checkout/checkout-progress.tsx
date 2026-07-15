"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const STEPS = [
  { id: 1, label: "Information" },
  { id: 2, label: "Shipping" },
  { id: 3, label: "Payment" },
];

interface CheckoutProgressProps {
  currentStep: number;
}

export function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10">
      {STEPS.map((step, index) => {
        const isComplete = currentStep > step.id;
        const isCurrent = currentStep === step.id;

        return (
          <div key={step.id} className="flex items-center gap-2 sm:gap-4">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                  isComplete && "bg-[#007AFF] text-white",
                  isCurrent && "bg-[#007AFF] text-white ring-4 ring-[#007AFF]/20",
                  !isComplete && !isCurrent && "bg-gray-100 text-gray-400"
                )}
              >
                {isComplete ? <Check className="h-4 w-4" /> : step.id}
              </div>
              <span
                className={cn(
                  "text-[10px] sm:text-xs font-medium hidden sm:block",
                  isCurrent ? "text-[#007AFF]" : "text-gray-400"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  "w-8 sm:w-16 h-0.5 rounded-full mb-5 sm:mb-0",
                  currentStep > step.id ? "bg-[#007AFF]" : "bg-gray-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
