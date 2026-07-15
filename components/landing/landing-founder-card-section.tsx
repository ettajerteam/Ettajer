"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Clock,
  Gift,
  Headphones,
  CreditCard,
} from "lucide-react";
import { FounderCard } from "@/components/founder/founder-card";
import { MAX_FOUNDERS } from "@/lib/founder/constants";
import { FadeIn } from "@/components/landing/landing-motion";
import {
  LandingCarousel,
  LandingMobileCard,
  LandingMobileSectionHeader,
} from "@/components/landing/landing-mobile-carousel";
import { LandingMobilePrimaryButton } from "@/components/landing/landing-mobile-nav";
import { LandingArrowForward } from "@/components/landing/landing-direction-icon";
import { useLandingLocale } from "@/components/landing/landing-locale-context";
import {
  LANDING_MOBILE_CONTAINER,
  LANDING_MOBILE_SECTION,
  LANDING_MOBILE_SECTION_SCROLL,
  LandingMobileInsetStack,
  LandingMobileSectionLabel,
  LandingMobileSectionLead,
  LandingMobileStatStrip,
} from "@/components/landing/landing-mobile-ui";
import { cn } from "@/lib/utils";

const DEMO_FOUNDER_NUMBER = 42;

const BENEFIT_ICONS = [BadgeCheck, Clock, Headphones, Gift] as const;

type PublicFounderStats = {
  founderCount: number;
  maxFounders: number;
  spotsLeft: number;
  isFull: boolean;
};

export function LandingFounderCardSection() {
  const { copy } = useLandingLocale();
  const fc = copy.founderCard;
  const [stats, setStats] = useState<PublicFounderStats>({
    founderCount: 0,
    maxFounders: MAX_FOUNDERS,
    spotsLeft: MAX_FOUNDERS,
    isFull: false,
  });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/founder/public-stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: PublicFounderStats | null) => {
        if (!cancelled && data) {
          setStats(data);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const communityPercent = Math.round((stats.founderCount / stats.maxFounders) * 100);

  return (
    <section
      id="founder-card"
      className={cn(
        LANDING_MOBILE_SECTION,
        LANDING_MOBILE_SECTION_SCROLL,
        "overflow-hidden bg-white",
      )}
    >
      <div className={LANDING_MOBILE_CONTAINER}>
        <LandingMobileSectionHeader
          eyebrow={fc.eyebrow}
          title={fc.title}
          subtitle={fc.subtitle}
          centered
        />

        <LandingMobileInsetStack className="mt-6 md:mt-10">
          <LandingMobileStatStrip
            items={[
              {
                label: fc.stats.foundersJoined,
                value: `${stats.founderCount}/${stats.maxFounders}`,
              },
              {
                label: fc.stats.spotsLeft,
                value: (
                  <span className={stats.spotsLeft <= 10 && !stats.isFull ? "text-[#FF9500]" : undefined}>
                    {stats.isFull ? fc.stats.full : stats.spotsLeft}
                  </span>
                ),
              },
              {
                label: fc.stats.community,
                value: `${communityPercent}%`,
              },
            ]}
          />

          <div className="relative overflow-hidden rounded-[0.875rem] border border-black/[0.04] bg-[#F2F2F7] p-4 md:rounded-2xl md:border-neutral-200 md:bg-neutral-50 md:p-8 lg:p-10">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_0%,rgba(59,130,246,0.1),transparent_70%)]"
              aria-hidden
            />

            <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
              <div className="min-w-0">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 md:mb-6">
                  <div className="text-center md:text-start">
                    <LandingMobileSectionLabel>{fc.preview.label}</LandingMobileSectionLabel>
                    <LandingMobileSectionLead className="mt-1">
                      {fc.preview.lead}
                    </LandingMobileSectionLead>
                  </div>
                  <span className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 font-mono text-[11px] font-semibold text-neutral-600 md:mx-0">
                    <CreditCard className="h-3 w-3 text-[#007AFF]" />
                    {fc.preview.badge}
                  </span>
                </div>

                <div className="-mx-1 overflow-x-auto overflow-y-visible px-1 pb-2 [-webkit-overflow-scrolling:touch] md:mx-0 md:overflow-visible md:px-0">
                  <div className="flex min-w-full justify-center">
                    <FadeIn>
                      <FounderCard
                        name={fc.preview.demoName}
                        founderNumber={DEMO_FOUNDER_NUMBER}
                        fixedSize
                        showHint={false}
                        className="py-2 md:py-4"
                      />
                    </FadeIn>
                  </div>
                </div>
                <p className="mt-3 text-center text-[12px] text-[#8E8E93] md:hidden">
                  {fc.preview.swipeHint}
                </p>
              </div>

              <div className="min-w-0 space-y-5 md:space-y-6">
                <div className="hidden md:block">
                  <h3 className="text-xl font-semibold tracking-tight text-neutral-900">
                    {fc.identity.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-neutral-600">
                    {fc.identity.body}
                  </p>
                </div>

                <div className="md:hidden">
                  <LandingMobileSectionLabel>{fc.mobile.benefitsLabel}</LandingMobileSectionLabel>
                  <LandingMobileSectionLead>{fc.mobile.benefitsLead}</LandingMobileSectionLead>
                </div>

                <div className="hidden gap-3 sm:grid sm:grid-cols-2">
                  {fc.benefits.map((benefit, index) => {
                    const Icon = BENEFIT_ICONS[index] ?? BadgeCheck;
                    return (
                      <div
                        key={benefit.title}
                        className="rounded-[0.875rem] border border-neutral-200 bg-white p-4"
                      >
                        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#007AFF]/10 text-[#007AFF]">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h4 className="text-[15px] font-semibold text-neutral-900">{benefit.title}</h4>
                        <p className="mt-1.5 text-[14px] leading-relaxed text-neutral-600">
                          {benefit.description}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <LandingCarousel
                  className="md:hidden"
                  slideWidth={78}
                  showDots
                  edgeToEdge
                  ariaLabel={fc.mobile.carouselAria}
                  gap={10}
                >
                  {fc.benefits.map((benefit, index) => {
                    const Icon = BENEFIT_ICONS[index] ?? BadgeCheck;
                    return (
                      <LandingMobileCard key={benefit.title}>
                        <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#007AFF]/10 text-[#007AFF]">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-[1.15rem] font-bold text-neutral-900">{benefit.title}</h3>
                        <p className="mt-2 text-[15px] leading-relaxed text-[#8E8E93]">
                          {benefit.description}
                        </p>
                      </LandingMobileCard>
                    );
                  })}
                </LandingCarousel>

                <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
                  <LandingMobilePrimaryButton
                    href="/signup"
                    className={cn(
                      "md:inline-flex",
                      stats.isFull && "pointer-events-none opacity-60",
                    )}
                  >
                    {stats.isFull ? fc.cta.full : fc.cta.claim}
                    {!stats.isFull ? <LandingArrowForward className="h-4 w-4" /> : null}
                  </LandingMobilePrimaryButton>
                  <Link
                    href="/founder-card"
                    className="inline-flex items-center justify-center rounded-full border border-neutral-200 px-6 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
                  >
                    {fc.cta.learnMore}
                  </Link>
                  <Link
                    href="/login"
                    className="hidden items-center justify-center rounded-full border border-neutral-200 px-6 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 md:inline-flex"
                  >
                    {fc.cta.signIn}
                  </Link>
                </div>

                <p className="text-center text-[13px] text-[#8E8E93] md:text-start md:text-sm md:text-neutral-500">
                  {stats.isFull
                    ? fc.footer.full
                    : fc.footer.remaining(stats.spotsLeft, stats.maxFounders)}
                </p>
              </div>
            </div>
          </div>
        </LandingMobileInsetStack>
      </div>
    </section>
  );
}
