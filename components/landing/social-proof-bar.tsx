"use client";

import { AnimatedNumber, FadeIn } from "@/components/landing/landing-motion";
import { useLandingLocale } from "@/components/landing/landing-locale-context";
import { STORE_COUNTER } from "@/lib/landing/merchant-testimonials";

export function SocialProofBar() {
  const { copy, content } = useLandingLocale();

  return (
    <FadeIn>
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-12">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">
            {copy.socialProof.eyebrow}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            <AnimatedNumber value={STORE_COUNTER.base} />
            {copy.socialProof.storesSuffix}
          </p>
          <p className="mt-1.5 text-sm text-neutral-500">{content.storeCounterLabel}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 border-t border-neutral-200 pt-6 md:gap-8 md:border-s md:border-t-0 md:ps-10 md:pt-0">
          {content.merchantMetrics.map((metric) => (
            <div key={metric.label} className="min-w-0">
              <p className="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">
                <AnimatedNumber
                  value={metric.value}
                  suffix={metric.suffix}
                  decimals={metric.suffix === "×" ? 1 : 0}
                />
              </p>
              <p className="mt-1 text-xs font-medium text-neutral-700">{metric.label}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-neutral-400">{metric.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </FadeIn>
  );
}
