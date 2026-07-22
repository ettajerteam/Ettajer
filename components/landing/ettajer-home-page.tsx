"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Layout,
  ChevronDown,
  CheckCircle2,
  Zap,
  Mail,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  type PricingCurrency,
} from "@/lib/landing/pricing";
import { useLandingLocale } from "@/components/landing/landing-locale-context";
import { LandingArrowForward } from "@/components/landing/landing-direction-icon";
import { FadeIn, Stagger, StaggerItem, AnimatedNumber, ScaleOnHover } from "@/components/landing/landing-motion";
import { LiveActivityToast } from "@/components/landing/live-activity-toast";
import { SocialProofBar } from "@/components/landing/social-proof-bar";
import { LandingFounderCardSection } from "@/components/landing/landing-founder-card-section";
import { cn } from "@/lib/utils";
import {
  LandingCarousel,
  LandingMobileCard,
  LandingMobileSectionHeader,
  LandingScrollToTop,
} from "@/components/landing/landing-mobile-carousel";
import { LandingFooter } from "@/components/landing/landing-footer";
import {
  LandingMobileNavBar,
  LandingIosSegmentedControl,
  LandingMobilePrimaryButton,
} from "@/components/landing/landing-mobile-nav";
import {
  LANDING_MOBILE_SECTION_SCROLL,
  LANDING_MOBILE_CONTAINER,
  LANDING_MOBILE_SECTION,
  LANDING_MOBILE_SECTION_MUTED,
  LandingMobileGroup,
  LandingMobileStatStrip,
  LandingMobileSectionLabel,
  LandingMobileSectionLead,
  LandingMobileInsetStack,
  LandingMobileFeatureGrid,
} from "@/components/landing/landing-mobile-ui";

const NAV_LOGO = "/brand/Ettajer-logo-black-text-Next-to-the-icon.png";

const LANDING = {
  builderAccent: "/landing/builder-typing.jpg",
  cod: "/landing/cod-packages.jpg",
  marketing: "/landing/marketing.jpg",
  hero: "/landing/hero.webp",
  storefrontShowcase: "/landing/storefront-showcase.jpg",
} as const;

function SectionImage({
  src,
  alt,
  className = "",
  variant = "default",
}: {
  src: string;
  alt: string;
  className?: string;
  variant?: "default" | "mobileHero";
}) {
  const isMobileHero = variant === "mobileHero";

  return (
    <div
      className={cn(
        "overflow-hidden bg-neutral-100",
        isMobileHero
          ? "aspect-[4/5] max-h-[18rem] min-h-[14rem] w-full rounded-[0.875rem] sm:max-h-[20rem] md:aspect-auto md:max-h-none md:min-h-0 md:rounded-2xl md:border md:border-neutral-200"
          : "rounded-2xl border border-neutral-200",
        className,
      )}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={cn(
          "h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.02]",
          isMobileHero && "object-center",
        )}
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

export function EttajerHomePage() {
  const { selectorValue, setLocale, copy, content } = useLandingLocale();
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(0);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">(
    "annually",
  );
  const [currency, setCurrency] = useState<PricingCurrency>("MAD");
  const heroRef = useRef<HTMLElement>(null);
  const [overHero, setOverHero] = useState(true);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setOverHero(entry.isIntersecting && entry.intersectionRatio > 0.12);
      },
      { threshold: [0, 0.12, 0.35, 0.6] },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#F2F2F7] text-neutral-900 antialiased selection:bg-neutral-900 selection:text-white md:bg-white">
      <LiveActivityToast />
      <LandingScrollToTop />
      {/* NAVIGATION */}
      <nav
        className={cn(
          "sticky top-0 z-40 pt-[env(safe-area-inset-top)] transition-[background-color,border-color,backdrop-filter] duration-300",
          overHero
            ? "border-b border-transparent bg-black/25 backdrop-blur-md backdrop-saturate-150"
            : "border-b border-black/[0.04] bg-[#F2F2F7]/88 backdrop-blur-xl backdrop-saturate-[180%] md:border-neutral-200/80 md:bg-white/75",
        )}
      >
        <div className="mx-auto flex h-[3.25rem] min-w-0 max-w-6xl items-center justify-between gap-2 px-3 md:h-auto md:gap-6 md:px-6 md:py-3.5">
          <Link href="/" className="min-w-0 shrink active:opacity-70">
            <Image
              src={NAV_LOGO}
              alt="Ettajer"
              width={104}
              height={26}
              className={cn(
                "h-[1.35rem] max-h-[1.35rem] w-auto max-w-[6.5rem] object-contain object-left transition duration-300 md:h-6",
                overHero && "brightness-0 invert",
              )}
              style={{ width: "auto" }}
              priority
            />
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {[{ label: copy.nav.pricing, href: "#pricing" }].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-sm text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                  overHero
                    ? "text-white/75 hover:text-white focus-visible:ring-white/40"
                    : "text-neutral-500 hover:text-neutral-900 focus-visible:ring-blue-600/30",
                )}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 sm:flex sm:gap-4">
            <select
              value={selectorValue}
              onChange={(e) => setLocale(e.target.value)}
              className={cn(
                "cursor-pointer rounded-sm border-none bg-transparent py-1 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                overHero
                  ? "text-white/80 hover:text-white focus-visible:ring-white/40"
                  : "text-neutral-500 hover:text-neutral-900 focus-visible:ring-blue-600/30",
              )}
              aria-label={copy.nav.languageAria}
            >
              <option value="EN">EN</option>
              <option value="FR">FR</option>
              <option value="AR">AR</option>
            </select>

            <Link
              href="/login"
              className={cn(
                "hidden rounded-sm text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:inline-block",
                overHero
                  ? "text-white/80 hover:text-white focus-visible:ring-white/40"
                  : "text-neutral-500 hover:text-neutral-900 focus-visible:ring-blue-600/30",
              )}
            >
              {copy.nav.signIn}
            </Link>

            <Link
              href="/signup"
              className={cn(
                "rounded-full px-4 py-2 text-sm transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:px-5",
                overHero
                  ? "bg-white text-neutral-900 hover:bg-white/90 focus-visible:ring-white/50"
                  : "bg-neutral-900 text-white hover:bg-neutral-800 focus-visible:ring-blue-600",
              )}
            >
              {copy.nav.startFree}
            </Link>
          </div>

          <LandingMobileNavBar
            language={selectorValue}
            onLanguageChange={setLocale}
          />
        </div>
      </nav>

      {/* HERO — brand-first full-bleed */}
      <header
        ref={heroRef}
        className="relative -mt-[3.25rem] flex min-h-[100svh] w-full max-w-full items-end overflow-hidden bg-neutral-950 text-white md:-mt-[3.75rem]"
      >
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.06 }}
            animate={{ scale: 1 }}
            transition={{ duration: 14, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Image
              src={LANDING.hero}
              alt=""
              fill
              priority
              quality={90}
              sizes="100vw"
              className="object-cover object-[55%_center]"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/35" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-28 sm:px-6 sm:pb-20 md:px-8 md:pb-24 md:pt-32">
          <FadeIn className="max-w-xl">
            <h1 className="text-[3.5rem] font-semibold leading-[0.9] tracking-[-0.045em] text-white sm:text-6xl md:text-7xl lg:text-[5.25rem]">
              {copy.hero.brandName}
            </h1>
            <p className="mt-7 text-xl font-medium leading-snug tracking-tight text-white sm:text-2xl md:text-[1.65rem]">
              {copy.hero.headline}
            </p>
            <p className="mt-3 max-w-md text-[16px] leading-relaxed text-white/70 sm:text-[17px]">
              {copy.hero.support}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-neutral-900 transition hover:bg-white/90 active:scale-[0.98]"
              >
                {copy.hero.ctaPrimary}
                <LandingArrowForward className="h-4 w-4" />
              </Link>
              <Link
                href="#cod-suite"
                className="inline-flex items-center justify-center rounded-full border border-white/35 bg-white/5 px-7 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                {copy.hero.ctaSecondary}
              </Link>
            </div>
          </FadeIn>
        </div>
      </header>

      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-8">
          <SocialProofBar />
        </div>
      </div>

      <LandingFounderCardSection />

      {/* WHY ETTAJER */}
      <section
        id="why-ettajer"
        className={cn(LANDING_MOBILE_SECTION_MUTED, LANDING_MOBILE_SECTION_SCROLL)}
      >
        <div className={LANDING_MOBILE_CONTAINER}>
          <LandingMobileSectionHeader
            eyebrow={copy.whyEttajer.eyebrow}
            title={copy.whyEttajer.title}
            subtitle={copy.whyEttajer.subtitle}
            centered
            className="mb-0"
          />

          <LandingMobileInsetStack className="mt-6 md:hidden">
            <div className="min-w-0">
              <LandingMobileSectionLabel>{copy.whyEttajer.mobile.exploreLabel}</LandingMobileSectionLabel>
              <LandingMobileSectionLead>{copy.whyEttajer.mobile.exploreLead}</LandingMobileSectionLead>
            </div>
            <LandingCarousel slideWidth={90} showDots edgeToEdge ariaLabel={copy.whyEttajer.mobile.carouselAria} gap={10}>
              <LandingMobileCard>
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#007AFF]/10 text-[#007AFF]">
                  <Layout className="h-5 w-5" />
                </div>
                <h3 className="text-[1.15rem] font-bold text-neutral-900">{copy.whyEttajer.visualBuilder.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#8E8E93]">
                  {copy.whyEttajer.visualBuilder.description}
                </p>
                <img
                  src={LANDING.builderAccent}
                  alt={copy.whyEttajer.visualBuilder.imageAlt}
                  className="mt-4 aspect-[3/4] max-h-[16rem] w-full rounded-[0.625rem] object-cover"
                  referrerPolicy="no-referrer"
                />
              </LandingMobileCard>

              {content.platformFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <LandingMobileCard key={feature.title}>
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#007AFF]/10 text-[#007AFF]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-[1.15rem] font-bold text-neutral-900">{feature.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-[#8E8E93]">
                      {feature.description}
                    </p>
                  </LandingMobileCard>
                );
              })}

              <LandingMobileCard>
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#007AFF]/10 text-[#007AFF]">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="text-[1.15rem] font-bold text-neutral-900">{copy.whyEttajer.performance.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#8E8E93]">
                  {copy.whyEttajer.performance.description}
                </p>
                <a
                  href="#hosting"
                  className="mt-4 inline-flex items-center gap-1.5 text-[15px] font-semibold text-[#007AFF]"
                >
                  {copy.whyEttajer.performance.cta}
                  <LandingArrowForward className="h-4 w-4" />
                </a>
              </LandingMobileCard>
            </LandingCarousel>
          </LandingMobileInsetStack>

          <div className="mt-8 hidden overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-colors hover:border-neutral-300 md:block">
            <div className="grid lg:grid-cols-2">
              <div className="flex flex-col justify-center p-8 md:p-10">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 text-neutral-700">
                  <Layout className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 md:text-2xl">
                  {copy.whyEttajer.visualBuilder.title}
                </h3>
                <p className="mt-3 max-w-md text-base leading-relaxed text-neutral-500">
                  {copy.whyEttajer.visualBuilder.description}
                </p>
                <Link
                  href="/signup"
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-900 transition-colors hover:text-neutral-600"
                >
                  {copy.whyEttajer.visualBuilder.cta}
                  <LandingArrowForward className="h-4 w-4" />
                </Link>
              </div>
              <div className="border-t border-neutral-200 lg:border-s lg:border-t-0">
                <img
                  src={LANDING.builderAccent}
                  alt={copy.whyEttajer.visualBuilder.imageAlt}
                  className="aspect-[4/3] h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03] lg:aspect-auto"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>

          <Stagger className="mt-4 hidden gap-4 md:grid md:grid-cols-2">
            {content.platformFeatures.map((feature) => {
              const Icon = feature.icon;

              return (
                <StaggerItem key={feature.title}>
                  <ScaleOnHover className="h-full rounded-2xl border border-neutral-200 bg-white p-6 md:p-7">
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 text-neutral-700 transition-colors duration-300 group-hover:border-neutral-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-semibold text-neutral-900">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                      {feature.description}
                    </p>
                  </ScaleOnHover>
                </StaggerItem>
              );
            })}
          </Stagger>

          <div className="mt-4 hidden rounded-2xl border border-neutral-200 bg-white p-6 transition-colors hover:border-neutral-300 md:flex md:items-center md:justify-between md:p-7">
            <div className="flex items-start gap-4">
              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 text-neutral-700">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-900">
                  {copy.whyEttajer.performance.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                  {copy.whyEttajer.performance.description}
                </p>
              </div>
            </div>
            <a
              href="#hosting"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 md:mt-0"
            >
              {copy.whyEttajer.performance.cta}
              <LandingArrowForward className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* COD SUITE */}
      <section
        id="cod-suite"
        className={cn(
          LANDING_MOBILE_SECTION,
          "bg-white pt-12 md:py-20",
          LANDING_MOBILE_SECTION_SCROLL,
        )}
      >
        {/* Mobile layout — flat stack, no grid clipping */}
        <div className="min-w-0 md:hidden">
          <div className={cn(LANDING_MOBILE_CONTAINER, "mb-6 space-y-6")}>
            <LandingMobileSectionHeader
              eyebrow={copy.cod.eyebrow}
              title={copy.cod.title}
              subtitle={copy.cod.subtitle}
              centered
              className="mb-0"
            />
            <SectionImage
              src={LANDING.cod}
              alt={copy.cod.imageAlt}
              variant="mobileHero"
            />
          </div>

          <div className={cn(LANDING_MOBILE_CONTAINER, "min-w-0")}>
            <LandingMobileInsetStack>
              <LandingMobileStatStrip
                items={[
                  { value: content.codCapabilities.length, label: copy.cod.stats.tools },
                  { value: content.codWorkflowSteps.length, label: copy.cod.stats.steps },
                  { value: copy.cod.feesValue, label: copy.cod.stats.fees },
                ]}
              />

              <div className="min-w-0">
                <LandingMobileSectionLabel className="mb-2.5">
                  {copy.cod.includedLabel}
                </LandingMobileSectionLabel>
                <LandingMobileFeatureGrid items={content.codCapabilities} />
              </div>

              <div className="min-w-0">
                <LandingMobileSectionLabel>{copy.cod.workflow.label}</LandingMobileSectionLabel>
                <LandingMobileSectionLead>
                  {copy.cod.workflow.lead}
                </LandingMobileSectionLead>
              </div>

              <LandingCarousel slideWidth={90} showDots edgeToEdge ariaLabel={copy.cod.workflow.carouselAria} gap={10}>
                {content.codWorkflowSteps.map((item) => {
                  const Icon = item.icon;
                  return (
                    <LandingMobileCard key={item.step} className="flex min-h-0 flex-col">
                      <div className="mb-3 flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#007AFF] text-[13px] font-bold text-white">
                          {item.step}
                        </span>
                        <Icon className="h-5 w-5 shrink-0 text-[#8E8E93]" />
                        <span className="ms-auto rounded-full bg-[#F2F2F7] px-2 py-0.5 text-[11px] font-semibold text-[#8E8E93]">
                          {copy.cod.workflow.stepBadge(item.step)}
                        </span>
                      </div>
                      <h3 className="text-[1.1rem] font-bold leading-snug text-neutral-900">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-[15px] leading-relaxed text-[#8E8E93]">
                        {item.description}
                      </p>
                    </LandingMobileCard>
                  );
                })}
              </LandingCarousel>

              <LandingMobilePrimaryButton href="/signup" className="shrink-0">
                {copy.cod.cta}
                <LandingArrowForward className="h-4 w-4 shrink-0" />
              </LandingMobilePrimaryButton>
            </LandingMobileInsetStack>
          </div>
        </div>

        {/* Desktop layout */}
        <div className={cn(LANDING_MOBILE_CONTAINER, "hidden md:block")}>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <SectionImage
              src={LANDING.cod}
              alt={copy.cod.imageAlt}
              className="order-2 lg:order-1"
            />

            <div className="order-1 lg:order-2">
              <LandingMobileSectionHeader
                eyebrow={copy.cod.eyebrow}
                title={copy.cod.title}
                subtitle={copy.cod.subtitleDesktop}
              />

              <div className="mt-8 flex flex-wrap gap-2">
                {content.codCapabilities.map((item) => {
                  const Icon = item.icon;
                  return (
                    <span
                      key={item.label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors duration-200 hover:border-neutral-300 hover:bg-white"
                    >
                      <Icon className="h-3.5 w-3.5 text-neutral-400" />
                      {item.label}
                    </span>
                  );
                })}
              </div>

              <div className="mt-10 divide-y divide-neutral-200">
                {content.codWorkflowSteps.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.step} className="flex gap-5 py-5 first:pt-0">
                      <span className="w-6 shrink-0 text-sm font-medium text-neutral-400">
                        {item.step}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-neutral-400" />
                          <h3 className="text-base font-semibold text-neutral-900">
                            {item.title}
                          </h3>
                        </div>
                        <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTEGRATIONS */}
      <section
        id="integrations"
        className={cn(LANDING_MOBILE_SECTION_MUTED, LANDING_MOBILE_SECTION_SCROLL)}
      >
        <div className={LANDING_MOBILE_CONTAINER}>
          <LandingMobileSectionHeader
            eyebrow={copy.integrations.eyebrow}
            title={copy.integrations.title}
            subtitle={copy.integrations.subtitle}
            centered
            className="mb-0"
          />

          <LandingMobileInsetStack className="mt-6 md:hidden">
            <div className="min-w-0">
              <LandingMobileSectionLabel>{copy.integrations.mobile.partnerToolsLabel}</LandingMobileSectionLabel>
              <LandingMobileSectionLead>{copy.integrations.mobile.partnerToolsLead}</LandingMobileSectionLead>
            </div>
            <LandingCarousel slideWidth={42} showDots edgeToEdge ariaLabel={copy.integrations.mobile.carouselAria} gap={12}>
              {content.integrationGroups.flatMap((group) =>
                group.items.map((item) => (
                  <LandingMobileCard
                    key={item.name}
                    className="flex min-h-[8.5rem] flex-col items-center justify-center p-5"
                  >
                    <div className="flex h-12 w-full items-center justify-center">
                      <Image
                        src={item.logo}
                        alt={copy.integrations.logoAlt(item.name)}
                        width={48}
                        height={48}
                        className="max-h-10 w-auto max-w-[6rem] object-contain"
                      />
                    </div>
                    <p className="mt-3 text-center text-[15px] font-semibold text-neutral-800">
                      {item.name}
                    </p>
                  </LandingMobileCard>
                )),
              )}
            </LandingCarousel>
          </LandingMobileInsetStack>

          <div className="hidden space-y-10 md:block">
            {content.integrationGroups.map((group) => (
              <div key={group.title}>
                <div className="mb-4">
                  <h3 className="text-base font-semibold text-neutral-900">
                    {group.title}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    {group.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  {group.items.map((item) => (
                    <div
                      key={item.name}
                      className="flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white px-4 py-5 transition-all duration-300 hover:border-neutral-300 hover:shadow-sm hover:shadow-neutral-200/50"
                    >
                      <div className="flex h-10 w-full items-center justify-center">
                        <Image
                          src={item.logo}
                          alt={copy.integrations.logoAlt(item.name)}
                          width={40}
                          height={40}
                          className="max-h-8 w-auto max-w-[5.5rem] object-contain"
                        />
                      </div>
                      <p className="mt-3 text-center text-xs font-medium text-neutral-600">
                        {item.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SHOWCASE */}
      <section
        id="showcase"
        className={cn(LANDING_MOBILE_SECTION_MUTED, LANDING_MOBILE_SECTION_SCROLL)}
      >
        <div className={LANDING_MOBILE_CONTAINER}>
          <LandingMobileSectionHeader
            eyebrow={copy.showcase.eyebrow}
            title={copy.showcase.title}
            subtitle={copy.showcase.subtitle}
            centered
            className="mb-0"
          />

          <LandingMobileInsetStack className="mt-6 md:hidden">
            <div className="min-w-0">
              <LandingMobileSectionLabel>{copy.showcase.mobile.galleryLabel}</LandingMobileSectionLabel>
              <LandingMobileSectionLead>{copy.showcase.mobile.galleryLead}</LandingMobileSectionLead>
            </div>
            <LandingCarousel slideWidth={90} showDots edgeToEdge ariaLabel={copy.showcase.mobile.carouselAria} gap={10}>
              {content.storeShowcases.map((store) => (
                <article key={store.name}>
                  <LandingMobileCard className="overflow-hidden p-0">
                    <img
                      src={store.image}
                      alt={copy.showcase.storefrontAlt(store.name)}
                      className="aspect-[4/5] max-h-[16rem] w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="p-5">
                      <p className="text-[13px] font-semibold uppercase tracking-wide text-[#8E8E93]">
                        {store.category}
                      </p>
                      <h3 className="mt-1.5 text-[1.2rem] font-bold text-neutral-900">{store.name}</h3>
                      <p className="mt-2 text-[16px] leading-relaxed text-[#8E8E93]">
                        {store.description}
                      </p>
                    </div>
                  </LandingMobileCard>
                </article>
              ))}
            </LandingCarousel>
            <LandingMobilePrimaryButton href="/signup">
              {copy.showcase.cta}
              <LandingArrowForward className="h-4 w-4" />
            </LandingMobilePrimaryButton>
          </LandingMobileInsetStack>

          <div className="hidden gap-8 md:grid md:grid-cols-2 md:gap-5">
            {content.storeShowcases.map((store) => (
              <article key={store.name}>
                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-colors hover:border-neutral-300">
                  <img
                    src={store.image}
                    alt={`${store.name} storefront`}
                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.02]"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="mt-4 px-1">
                  <p className="text-sm text-neutral-500">{store.category}</p>
                  <h3 className="mt-1 text-base font-semibold text-neutral-900">
                    {store.name}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                    {store.description}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <LandingMobileInsetStack className="mt-8 hidden md:mt-12 md:block">
            <div className="text-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm text-white transition-colors hover:bg-neutral-800"
              >
                {copy.showcase.cta}
                <LandingArrowForward className="h-4 w-4" />
              </Link>
            </div>
          </LandingMobileInsetStack>
        </div>
      </section>

      {/* MERCHANTS / SOCIAL PROOF */}
      <section
        id="merchants"
        className={cn(LANDING_MOBILE_SECTION, LANDING_MOBILE_SECTION_SCROLL)}
      >
        <div className={LANDING_MOBILE_CONTAINER}>
          <LandingMobileSectionHeader
            eyebrow={copy.merchants.eyebrow}
            title={copy.merchants.title}
            subtitle={copy.merchants.subtitle}
            centered
            className="mb-0"
          />

          <LandingMobileInsetStack className="mt-6 md:hidden">
            <div className="min-w-0">
              <LandingMobileSectionLabel>{copy.merchants.mobile.storiesLabel}</LandingMobileSectionLabel>
              <LandingMobileSectionLead>{copy.merchants.mobile.storiesLead}</LandingMobileSectionLead>
            </div>
            <LandingCarousel slideWidth={90} showDots edgeToEdge ariaLabel={copy.merchants.mobile.carouselAria} gap={10}>
              {copy.merchants.testimonials.map((merchant) => (
                <article key={merchant.name} className="h-full">
                  <LandingMobileCard className="flex min-h-0 flex-col">
                    <div className="flex items-center gap-4">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-[#E5E5EA] bg-white">
                        <Image
                          src={merchant.avatar}
                          alt={merchant.name}
                          width={56}
                          height={56}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[17px] font-bold text-neutral-900">
                          {merchant.name}
                        </p>
                        <p className="truncate text-[14px] text-[#8E8E93]">
                          {merchant.role}, {merchant.store}
                        </p>
                        <p className="truncate text-[13px] text-[#C7C7CC]">{merchant.city}</p>
                      </div>
                    </div>
                    <p className="mt-5 flex-1 text-[17px] leading-relaxed text-neutral-600">
                      &ldquo;{merchant.quote}&rdquo;
                    </p>
                  </LandingMobileCard>
                </article>
              ))}
            </LandingCarousel>
          </LandingMobileInsetStack>

          <Stagger className="hidden gap-5 md:grid md:grid-cols-2 lg:grid-cols-3">
            {copy.merchants.testimonials.map((merchant) => (
              <StaggerItem key={merchant.name}>
                <article className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-neutral-50 p-6 transition-all duration-300 hover:border-neutral-300 hover:bg-white hover:shadow-sm hover:shadow-neutral-200/50">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-neutral-200 bg-white">
                      <Image
                        src={merchant.avatar}
                        alt={merchant.name}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-neutral-900">
                        {merchant.name}
                      </p>
                      <p className="truncate text-xs text-neutral-500">
                        {merchant.role}, {merchant.store}
                      </p>
                      <p className="truncate text-xs text-neutral-400">
                        {merchant.city}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 flex-1 text-sm leading-relaxed text-neutral-600">
                    &ldquo;{merchant.quote}&rdquo;
                  </p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* HOSTING */}
      <section
        id="hosting"
        className={cn(LANDING_MOBILE_SECTION, LANDING_MOBILE_SECTION_SCROLL)}
      >
        {/* Mobile layout */}
        <div className="min-w-0 md:hidden">
          <div className={cn(LANDING_MOBILE_CONTAINER, "mb-6 space-y-6")}>
            <LandingMobileSectionHeader
              eyebrow={copy.hosting.eyebrow}
              title={copy.hosting.title}
              subtitle={copy.hosting.subtitle}
              centered
              className="mb-0"
            />
            <SectionImage
              src={LANDING.marketing}
              alt={copy.hosting.imageAlt}
              variant="mobileHero"
            />
          </div>

          <div className={cn(LANDING_MOBILE_CONTAINER, "min-w-0")}>
            <LandingMobileInsetStack>
              <LandingMobileStatStrip
                items={[
                  {
                    value: (
                      <>
                        {"<"}
                        <AnimatedNumber value={1} suffix="s" />
                      </>
                    ),
                    label: copy.hosting.stats.load,
                  },
                  {
                    value: <AnimatedNumber value={99.9} suffix="%" decimals={1} />,
                    label: copy.hosting.stats.uptime,
                  },
                  {
                    value: <AnimatedNumber value={40} suffix="+" />,
                    label: copy.hosting.stats.regions,
                  },
                ]}
              />

              <div className="min-w-0">
                <LandingMobileSectionLabel>{copy.hosting.mobile.highlightsLabel}</LandingMobileSectionLabel>
                <LandingMobileSectionLead>
                  {copy.hosting.mobile.highlightsLead}
                </LandingMobileSectionLead>
              </div>

              <LandingCarousel slideWidth={90} edgeToEdge ariaLabel={copy.hosting.mobile.carouselAria} gap={10}>
                {content.hostingFeatures.map((feature) => (
                  <LandingMobileCard key={feature}>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#007AFF]" />
                      <p className="min-w-0 flex-1 text-[15px] leading-relaxed text-neutral-700">
                        {feature}
                      </p>
                    </div>
                  </LandingMobileCard>
                ))}
              </LandingCarousel>
            </LandingMobileInsetStack>
          </div>
        </div>

        {/* Desktop layout */}
        <div className={cn(LANDING_MOBILE_CONTAINER, "hidden md:block")}>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <SectionImage
              src={LANDING.marketing}
              alt={copy.hosting.imageAlt}
            />

            <div>
              <LandingMobileSectionHeader
                eyebrow={copy.hosting.eyebrow}
                title={copy.hosting.title}
                subtitle={copy.hosting.subtitle}
              />

              <ul className="mt-8 space-y-3">
                {content.hostingFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-neutral-600"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-neutral-200 pt-8">
                {[
                  { value: 1, suffix: "s", label: copy.hosting.stats.loadTime, prefix: "<" },
                  { value: 99.9, suffix: "%", label: copy.hosting.stats.uptime, decimals: 1 },
                  { value: 40, suffix: "+", label: copy.hosting.stats.edgeRegions },
                ].map((item) => (
                  <div key={item.label} className="text-center md:text-start">
                    <p className="text-xl font-bold tracking-tight text-neutral-900 md:text-lg md:font-semibold">
                      {item.prefix}
                      <AnimatedNumber
                        value={item.value}
                        suffix={item.suffix}
                        decimals={"decimals" in item ? item.decimals : 0}
                      />
                    </p>
                    <p className="mt-1 text-[13px] text-[#8E8E93] md:mt-0.5 md:text-sm md:text-neutral-500">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section
        id="pricing"
        className={cn(LANDING_MOBILE_SECTION_MUTED, LANDING_MOBILE_SECTION_SCROLL)}
      >
        <div className={LANDING_MOBILE_CONTAINER}>
          <FadeIn className="md:mx-auto md:mb-12 md:max-w-2xl">
            <LandingMobileSectionHeader
              eyebrow={copy.pricing.eyebrow}
              title={copy.pricing.title}
              subtitle={copy.pricing.subtitle}
              centered
              className="mb-0"
            />

            <div className="mt-6 md:mt-8 md:flex md:flex-row md:items-center md:justify-center md:gap-3">
              <LandingMobileInsetStack className="md:hidden">
                <LandingIosSegmentedControl
                  options={[
                    { value: "monthly", label: copy.pricing.billing.monthly },
                    { value: "annually", label: copy.pricing.billing.annualMobile },
                  ]}
                  value={billingPeriod}
                  onChange={setBillingPeriod}
                />
                <LandingIosSegmentedControl
                  options={[
                    { value: "MAD", label: "MAD" },
                    { value: "USD", label: "USD" },
                  ]}
                  value={currency}
                  onChange={setCurrency}
                />
              </LandingMobileInsetStack>

              <div className="hidden items-center gap-1 rounded-full border border-neutral-200 bg-white p-1 md:inline-flex">
                <button
                  type="button"
                  onClick={() => setBillingPeriod("monthly")}
                  className={`rounded-full px-5 py-1.5 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/30 ${
                    billingPeriod === "monthly"
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  {copy.pricing.billing.monthly}
                </button>
                <button
                  type="button"
                  onClick={() => setBillingPeriod("annually")}
                  className={`rounded-full px-5 py-1.5 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/30 ${
                    billingPeriod === "annually"
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  {copy.pricing.billing.annualDesktop}
                </button>
              </div>

              <div className="hidden items-center gap-1 rounded-full border border-neutral-200 bg-white p-1 md:inline-flex">
                {(["MAD", "USD"] as const).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setCurrency(code)}
                    className={`rounded-full px-4 py-1.5 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/30 ${
                      currency === code
                        ? "bg-neutral-900 text-white"
                        : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>
          </FadeIn>

          <LandingMobileInsetStack className="mt-6 md:hidden">
            <div className="min-w-0">
              <LandingMobileSectionLabel>{copy.pricing.mobile.choosePlanLabel}</LandingMobileSectionLabel>
              <LandingMobileSectionLead>{copy.pricing.mobile.choosePlanLead}</LandingMobileSectionLead>
            </div>
            <LandingCarousel slideWidth={90} showDots edgeToEdge ariaLabel={copy.pricing.mobile.carouselAria} gap={10}>
              {content.pricingPlans.map((plan) => {
                const priceUsd =
                  billingPeriod === "annually" ? plan.annualPriceUsd : plan.monthlyPriceUsd;

                return (
                  <article
                    key={plan.id}
                    className={`flex flex-col rounded-[0.875rem] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_28px_rgba(0,0,0,0.08)] sm:p-6 ${
                      plan.popular
                        ? "bg-[#007AFF] text-white"
                        : "bg-white text-neutral-900"
                    }`}
                  >
                    {plan.popular ? (
                      <p className="mb-4 text-[14px] font-semibold text-white/90">{copy.pricing.badge.mostPopular}</p>
                    ) : (
                      <div className="mb-4 h-5" />
                    )}

                    <h3 className="text-[1.5rem] font-bold">{plan.localizedName}</h3>
                    <p
                      className={`mt-2 text-[16px] ${plan.popular ? "text-white/85" : "text-[#8E8E93]"}`}
                    >
                      {plan.localizedDescription}
                    </p>

                    <div
                      className={`my-6 border-y py-5 ${plan.popular ? "border-white/25" : "border-[#E5E5EA]"}`}
                    >
                      {plan.firstMonthFree ? (
                        <>
                          <p className={`text-[14px] ${plan.popular ? "text-white/80" : "text-[#8E8E93]"}`}>
                            {copy.pricing.firstMonth.label}
                          </p>
                          <p className="mt-1 text-[2.5rem] font-bold tracking-tight">{copy.pricing.firstMonth.value}</p>
                        </>
                      ) : null}
                      <p className={`${plan.firstMonthFree ? "mt-3" : ""} text-[16px]`}>
                        {plan.firstMonthFree ? copy.pricing.firstMonth.then : ""}
                        <span className="font-bold">
                          {copy.pricing.formatPrice(priceUsd, currency, true)}
                        </span>
                      </p>
                    </div>

                    <ul className="flex-1 space-y-3">
                      {plan.localizedFeatures.slice(0, 5).map((feature) => (
                        <li
                          key={feature}
                          className={`flex items-start gap-2.5 text-[15px] ${plan.popular ? "text-white/90" : "text-neutral-600"}`}
                        >
                          <CheckCircle2
                            className={`mt-0.5 h-5 w-5 shrink-0 ${plan.popular ? "text-white" : "text-[#007AFF]"}`}
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href="/signup"
                      className={`mt-6 block rounded-[0.75rem] py-4 text-center text-[16px] font-semibold ${
                        plan.popular
                          ? "bg-white text-[#007AFF]"
                          : "bg-neutral-900 text-white"
                      }`}
                    >
                      {plan.localizedCta}
                    </Link>
                  </article>
                );
              })}
            </LandingCarousel>

            <p className="text-center text-[13px] text-[#8E8E93]">
              {copy.pricing.footnote.mobile}
            </p>

            <LandingMobileGroup className="px-4 py-4">
              <LandingMobileSectionLabel>{copy.pricing.everyPlanIncludes}</LandingMobileSectionLabel>
              <p className="mt-2 text-[15px] leading-relaxed text-neutral-700">
                {copy.pricing.includes.join(" · ")}
              </p>
            </LandingMobileGroup>
          </LandingMobileInsetStack>

          <div className="hidden gap-4 lg:grid lg:grid-cols-3">
            {content.pricingPlans.map((plan) => {
              const priceUsd =
                billingPeriod === "annually"
                  ? plan.annualPriceUsd
                  : plan.monthlyPriceUsd;

              return (
                <ScaleOnHover key={plan.id}>
                  <article
                    className={`flex h-full flex-col rounded-2xl border p-6 md:p-7 ${
                      plan.popular
                        ? "border-blue-600 bg-blue-50 shadow-[0_20px_50px_-30px_rgba(37,99,235,0.35)]"
                        : "border-neutral-200 bg-white"
                    }`}
                  >
                    {plan.popular ? (
                      <p className="mb-4 text-sm font-medium text-blue-600">
                        {copy.pricing.badge.mostPopular}
                      </p>
                    ) : (
                      <div className="mb-4 h-5" />
                    )}

                    <h3
                      className={`text-lg font-semibold ${
                        plan.popular ? "text-blue-900" : "text-neutral-900"
                      }`}
                    >
                      {plan.localizedName}
                    </h3>
                    <p
                      className={`mt-1 text-sm leading-relaxed ${
                        plan.popular ? "text-blue-700/80" : "text-neutral-500"
                      }`}
                    >
                      {plan.localizedDescription}
                    </p>

                    <div
                      className={`my-6 border-y py-5 ${
                        plan.popular ? "border-blue-200" : "border-neutral-100"
                      }`}
                    >
                      {plan.firstMonthFree ? (
                        <>
                          <p
                            className={`text-sm font-medium ${
                              plan.popular ? "text-blue-600" : "text-neutral-500"
                            }`}
                          >
                            {copy.pricing.firstMonth.label}
                          </p>
                          <p
                            className={`mt-1 text-4xl font-semibold tracking-tight ${
                              plan.popular ? "text-blue-600" : "text-neutral-900"
                            }`}
                          >
                            {copy.pricing.firstMonth.value}
                          </p>
                        </>
                      ) : null}

                      <p
                        className={`${plan.firstMonthFree ? "mt-3" : ""} text-sm ${
                          plan.popular ? "text-blue-600/80" : "text-neutral-500"
                        }`}
                      >
                        {plan.firstMonthFree ? copy.pricing.firstMonth.then : ""}
                        <span className="font-medium text-neutral-900">
                          {copy.pricing.formatPrice(priceUsd, currency, true)}
                        </span>
                      </p>
                      {billingPeriod === "annually" ? (
                        <p className="mt-2 text-xs text-emerald-700">
                          {copy.pricing.formatSavings(
                            (plan.monthlyPriceUsd - plan.annualPriceUsd) * 12,
                            currency,
                          )}{" "}
                          ·{" "}
                          {copy.pricing.formatAnnualTotal(plan.annualPriceUsd * 12, currency)}
                        </p>
                      ) : null}
                    </div>

                    <ul className="flex-1 space-y-3">
                      {plan.localizedFeatures.map((feature) => (
                        <li
                          key={feature}
                          className={`flex items-start gap-2.5 text-sm ${
                            plan.popular ? "text-blue-800" : "text-neutral-600"
                          }`}
                        >
                          <CheckCircle2
                            className={`mt-0.5 h-4 w-4 shrink-0 ${
                              plan.popular ? "text-blue-600" : "text-neutral-400"
                            }`}
                          />
                          <span
                            className={
                              feature.includes("0%")
                                ? `font-medium ${plan.popular ? "text-blue-700" : "text-neutral-900"}`
                                : ""
                            }
                          >
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href="/signup"
                      className={`mt-6 block rounded-full py-3 text-center text-sm transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                        plan.popular
                          ? "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600"
                          : "border border-neutral-200 text-neutral-700 hover:bg-neutral-50 focus-visible:ring-blue-600/30"
                      }`}
                    >
                      {plan.localizedCta}
                    </Link>
                  </article>
                </ScaleOnHover>
              );
            })}
          </div>

          <p className="mt-8 hidden text-center text-sm text-neutral-500 md:block">
            {copy.pricing.footnote.desktop(copy.pricing.includes.join(" · "))}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className={cn(LANDING_MOBILE_SECTION, LANDING_MOBILE_SECTION_SCROLL)}
      >
        <div className={LANDING_MOBILE_CONTAINER}>
          <div className="md:hidden">
            <LandingMobileSectionHeader
              eyebrow={copy.faq.eyebrow}
              title={copy.faq.title}
              subtitle={copy.faq.subtitle}
              centered
              className="mb-0"
            />

            <LandingMobileInsetStack className="mt-6">
              <LandingMobileGroup>
                {copy.faq.items.map((faq, idx) => {
                  const isOpen = faqOpenIndex === idx;

                  return (
                    <article key={faq.question} className="border-b border-[#E5E5EA] last:border-0">
                      <button
                        type="button"
                        onClick={() => setFaqOpenIndex(isOpen ? null : idx)}
                        className="flex w-full items-start justify-between gap-4 px-4 py-4 text-start active:bg-[#F2F2F7]/80"
                        aria-expanded={isOpen}
                      >
                        <p className="min-w-0 flex-1 text-[16px] font-normal leading-snug text-neutral-900">
                          {faq.question}
                        </p>
                        <ChevronDown
                          className={cn(
                            "mt-0.5 h-5 w-5 shrink-0 text-[#C7C7CC] transition-transform duration-200",
                            isOpen && "rotate-180",
                          )}
                        />
                      </button>

                      <div
                        className={cn(
                          "grid transition-all duration-200",
                          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                        )}
                      >
                        <div className="overflow-hidden">
                          <p className="border-t border-[#E5E5EA] px-4 pb-4 pt-3 text-[15px] leading-relaxed text-[#8E8E93]">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </LandingMobileGroup>

              <Link href="/help">
                <LandingMobileGroup className="flex items-center justify-between gap-4 px-4 py-4 active:bg-[#F2F2F7]/80">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#007AFF]/10">
                      <Mail className="h-5 w-5 text-[#007AFF]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[16px] font-semibold text-neutral-900">{copy.faq.stillHaveQuestions}</p>
                      <p className="text-[14px] text-[#8E8E93]">{copy.faq.browseHelpCenter}</p>
                    </div>
                  </div>
                  <LandingArrowForward className="h-5 w-5 shrink-0 text-[#C7C7CC]" />
                </LandingMobileGroup>
              </Link>
            </LandingMobileInsetStack>
          </div>

          <div className="hidden gap-8 lg:grid lg:grid-cols-2 lg:gap-20">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <LandingMobileSectionHeader
                eyebrow={copy.faq.eyebrow}
                title={copy.faq.title}
                subtitle={copy.faq.subtitle}
              />

              <div className="mt-6 rounded-2xl border border-neutral-200 p-6">
                <p className="text-sm font-medium text-neutral-900">
                  {copy.faq.stillHaveQuestions}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                  {copy.faq.sidebarBody}
                </p>
                <Link
                  href="/help"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                >
                  <Mail className="h-4 w-4" />
                  {copy.faq.browseHelpCenterCta}
                  <LandingArrowForward className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="space-y-2">
              {copy.faq.items.map((faq, idx) => {
                const isOpen = faqOpenIndex === idx;

                return (
                  <article
                    key={faq.question}
                    className={`overflow-hidden rounded-[0.625rem] transition-colors md:rounded-2xl md:border ${
                      isOpen
                        ? "bg-white md:border-neutral-300"
                        : "bg-white md:border-neutral-200 md:bg-neutral-50 md:hover:border-neutral-300"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setFaqOpenIndex(isOpen ? null : idx)}
                      className="flex w-full items-start justify-between gap-4 p-4 text-start transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/30 focus-visible:ring-offset-2 md:p-6"
                      aria-expanded={isOpen}
                    >
                      <p className="text-[17px] font-normal text-neutral-900 md:text-base md:font-medium">
                        {faq.question}
                      </p>
                      <ChevronDown
                        className={`mt-0.5 h-5 w-5 shrink-0 text-[#C7C7CC] transition-transform duration-200 md:text-neutral-400 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <div
                      className={`grid transition-all duration-200 ${
                        isOpen
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="border-t border-[#E5E5EA] px-4 pb-4 pt-3 text-[15px] leading-relaxed text-[#8E8E93] md:border-neutral-200 md:px-6 md:pb-6 md:pt-4 md:text-sm md:text-neutral-500">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-[#007AFF] py-12 pb-[calc(2.5rem+env(safe-area-inset-bottom))] text-center text-white md:bg-blue-600 md:py-24 md:pb-24">
        <div className={cn(LANDING_MOBILE_CONTAINER, "mx-auto max-w-2xl space-y-6")}>
          <div className="space-y-3">
            <p className="text-[13px] font-semibold uppercase tracking-wide text-white/70 md:hidden">
              {copy.cta.eyebrow}
            </p>
            <h2 className="text-[1.85rem] font-bold leading-tight tracking-tight md:text-5xl md:font-semibold">
              {copy.cta.title}
            </h2>
            <p className="text-[17px] leading-relaxed text-white/90 md:text-lg md:text-blue-100">
              {copy.cta.subtitle}
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-1 md:flex-row md:items-center md:justify-center md:gap-3 md:pt-2">
            <Link
              href="/signup"
              className="inline-flex h-[3.25rem] w-full items-center justify-center rounded-[0.875rem] bg-white text-[17px] font-semibold text-[#007AFF] shadow-[0_4px_14px_rgba(0,0,0,0.12)] transition-all duration-200 active:scale-[0.98] active:bg-blue-50 md:h-auto md:w-auto md:rounded-full md:px-8 md:py-3.5 md:text-sm md:font-medium md:shadow-none md:hover:bg-blue-50"
            >
              {copy.cta.startForFree}
            </Link>
            <Link
              href="/login"
              className="inline-flex h-[3.25rem] w-full items-center justify-center rounded-[0.875rem] border border-white/40 bg-white/10 text-[17px] font-semibold text-white backdrop-blur-sm transition-all duration-200 active:scale-[0.98] active:bg-white/20 md:h-auto md:w-auto md:rounded-full md:border-white/70 md:bg-transparent md:px-8 md:py-3.5 md:text-sm md:font-normal md:hover:bg-blue-700"
            >
              {copy.cta.signIn}
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
