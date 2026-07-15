"use client";

import { AnimatedNumber, FadeIn } from "@/components/landing/landing-motion";
import { LandingMobileCard } from "@/components/landing/landing-mobile-carousel";
import { useLandingLocale } from "@/components/landing/landing-locale-context";
import { STORE_COUNTER } from "@/lib/landing/merchant-testimonials";

export function SocialProofBar() {
  const { copy, content } = useLandingLocale();

  return (
    <FadeIn className="mx-auto mt-10 max-w-4xl md:mt-10">
      <LandingMobileCard className="text-center md:hidden">
        <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#8E8E93]">
          {copy.socialProof.eyebrow}
        </p>
        <p className="mt-2 text-[2.25rem] font-bold tracking-tight text-neutral-900">
          <AnimatedNumber value={STORE_COUNTER.base} />
          {copy.socialProof.storesSuffix}
        </p>
        <p className="mt-1 text-[16px] text-[#8E8E93]">{content.storeCounterLabel}</p>

        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-[#E5E5EA] pt-6">
          {content.merchantMetrics.map((metric) => (
            <div key={metric.label} className="text-center">
              <p className="text-[1.35rem] font-bold tracking-tight text-neutral-900">
                <AnimatedNumber
                  value={metric.value}
                  suffix={metric.suffix}
                  decimals={metric.suffix === "×" ? 1 : 0}
                />
              </p>
              <p className="mt-1 text-[12px] font-bold text-neutral-800">{metric.label}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-[#8E8E93]">{metric.detail}</p>
            </div>
          ))}
        </div>
      </LandingMobileCard>

      <div className="hidden rounded-2xl border border-neutral-200 bg-neutral-50 px-8 py-6 md:block">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="text-start">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              {copy.socialProof.eyebrow}
            </p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-neutral-900">
              <AnimatedNumber value={STORE_COUNTER.base} />
              {copy.socialProof.storesSuffix}
            </p>
            <p className="mt-1 text-sm text-neutral-500">{content.storeCounterLabel}</p>
          </div>

          <div className="grid w-auto grid-cols-3 gap-4 border-s border-neutral-200 ps-8">
            {content.merchantMetrics.map((metric) => (
              <div key={metric.label} className="text-start">
                <p className="text-lg font-semibold tracking-tight text-neutral-900">
                  <AnimatedNumber
                    value={metric.value}
                    suffix={metric.suffix}
                    decimals={metric.suffix === "×" ? 1 : 0}
                  />
                </p>
                <p className="mt-0.5 text-xs font-medium text-neutral-700">{metric.label}</p>
                <p className="mt-0.5 text-[11px] text-neutral-400">{metric.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
