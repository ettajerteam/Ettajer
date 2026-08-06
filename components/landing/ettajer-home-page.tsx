"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, CheckCircle2, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { type PricingCurrency } from "@/lib/landing/pricing";
import { useLandingLocale } from "@/components/landing/landing-locale-context";
import { LandingArrowForward } from "@/components/landing/landing-direction-icon";
import { FadeIn, Stagger, StaggerItem } from "@/components/landing/landing-motion";
import { LiveActivityToast } from "@/components/landing/live-activity-toast";
import { SocialProofBar } from "@/components/landing/social-proof-bar";
import { cn } from "@/lib/utils";
import {
  LandingCarousel,
  LandingScrollToTop,
} from "@/components/landing/landing-mobile-carousel";
import { LandingFooter } from "@/components/landing/landing-footer";
import {
  LandingMobileNavBar,
  LandingIosSegmentedControl,
} from "@/components/landing/landing-mobile-nav";
import { ContinueWithGoogleButton } from "@/components/auth/continue-with-google-button";

const NAV_LOGO = "/brand/Ettajer-logo-black-text-Next-to-the-icon.png";

const LANDING = {
  builderAccent: "/landing/builder-typing.jpg",
  cod: "/landing/cod-packages.jpg",
  marketing: "/landing/marketing.jpg",
  hero: "/landing/hero.webp",
  storefrontShowcase: "/landing/storefront-showcase.jpg",
} as const;

export function EttajerHomePage({ googleEnabled = false }: { googleEnabled?: boolean }) {
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
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-white text-neutral-900 antialiased selection:bg-neutral-900 selection:text-white">
      <LiveActivityToast />
      <LandingScrollToTop />

      {/* 1. Sticky nav */}
      <nav
        className={cn(
          "sticky top-0 z-40 pt-[env(safe-area-inset-top)] transition-[background-color,border-color,backdrop-filter] duration-300",
          overHero
            ? "border-b border-transparent bg-black/25 backdrop-blur-md backdrop-saturate-150"
            : "border-b border-neutral-200/80 bg-white/80 backdrop-blur-xl backdrop-saturate-[180%]",
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
                    : "text-neutral-500 hover:text-neutral-900 focus-visible:ring-neutral-400/40",
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
                  : "text-neutral-500 hover:text-neutral-900 focus-visible:ring-neutral-400/40",
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
                  : "text-neutral-500 hover:text-neutral-900 focus-visible:ring-neutral-400/40",
              )}
            >
              {copy.nav.signIn}
            </Link>

            {googleEnabled ? (
              <ContinueWithGoogleButton
                className="hidden sm:inline-flex"
                label={copy.nav.continueGoogle}
                tone={overHero ? "light" : "dark"}
                callbackUrl="/dashboard"
              />
            ) : null}

            <Link
              href="/signup"
              className={cn(
                "rounded-full px-4 py-2 text-sm transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:px-5",
                overHero
                  ? "bg-white text-neutral-900 hover:bg-white/90 focus-visible:ring-white/50"
                  : "bg-neutral-900 text-white hover:bg-neutral-800 focus-visible:ring-neutral-900",
              )}
            >
              {copy.nav.startFree}
            </Link>
          </div>

          <LandingMobileNavBar
            language={selectorValue}
            onLanguageChange={setLocale}
            googleEnabled={googleEnabled}
          />
        </div>
      </nav>

      {/* 2. Hero — brand-first full-bleed */}
      <header
        ref={heroRef}
        className="relative -mt-[3.25rem] flex min-h-[100svh] w-full max-w-full items-end overflow-hidden bg-neutral-950 text-white md:-mt-[3.75rem]"
      >
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 16, ease: [0.25, 0.1, 0.25, 1] }}
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/45 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-28 sm:px-6 sm:pb-20 md:px-8 md:pb-24 md:pt-32">
          <FadeIn className="max-w-xl">
            <h1 className="text-[3.75rem] font-semibold leading-[0.88] tracking-[-0.05em] text-white sm:text-7xl md:text-8xl lg:text-[5.75rem]">
              {copy.hero.brandName}
            </h1>
            <p className="mt-2 text-sm font-medium tracking-[0.08em] text-white/45" dir="rtl">
              {copy.hero.brandNative}
            </p>
            <p className="mt-8 text-xl font-medium leading-snug tracking-tight text-white sm:text-2xl md:text-[1.7rem]">
              {copy.hero.headline}
            </p>
            <p className="mt-3 max-w-md text-[16px] leading-relaxed text-white/65 sm:text-[17px]">
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
              <a
                href="#workflow"
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-transparent px-7 py-3.5 text-sm font-medium text-white transition hover:bg-white/10"
              >
                {copy.hero.ctaSecondary}
              </a>
            </div>
          </FadeIn>
        </div>
      </header>

      {/* 3. Quiet trust */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:px-8 md:py-12">
          <SocialProofBar />
        </div>
      </section>

      {/* 4. Workflow — star section */}
      <section
        id="workflow"
        className="scroll-mt-20 border-b border-neutral-200 bg-white py-16 md:py-28"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
          <FadeIn className="max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">
              {copy.cod.eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl md:text-[2.75rem] md:leading-[1.1]">
              {copy.cod.workflow.label}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-neutral-500 sm:text-lg">
              {copy.cod.workflow.lead}
            </p>
          </FadeIn>

          <div className="mt-12 grid items-start gap-12 lg:mt-16 lg:grid-cols-12 lg:gap-16">
            <Stagger className="space-y-0 lg:col-span-6">
              {content.codWorkflowSteps.map((item, index) => (
                <StaggerItem key={item.step}>
                  <div
                    className={cn(
                      "border-t border-neutral-200 py-8 first:border-t-0 first:pt-0",
                      index === content.codWorkflowSteps.length - 1 && "pb-0",
                    )}
                  >
                    <div className="flex gap-5 sm:gap-7">
                      <span className="shrink-0 font-mono text-4xl font-light leading-none tracking-tight text-neutral-300 sm:text-5xl">
                        {item.step}
                      </span>
                      <div className="min-w-0 pt-1">
                        <h3 className="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">
                          {item.title}
                        </h3>
                        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-neutral-500 sm:text-base">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>

            <FadeIn delay={0.15} className="lg:col-span-6">
              <div className="overflow-hidden bg-neutral-100">
                <img
                  src={LANDING.cod}
                  alt={copy.cod.imageAlt}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/5] h-full w-full object-cover sm:aspect-[3/4] lg:aspect-[4/5]"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="mt-8">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.98]"
                >
                  {copy.cod.cta}
                  <LandingArrowForward className="h-4 w-4" />
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* 5. COD capabilities */}
      <section className="border-b border-neutral-200 bg-neutral-50 py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
          <FadeIn>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">
              {copy.cod.includedLabel}
            </p>
            <ul className="mt-8 divide-y divide-neutral-200 border-y border-neutral-200">
              {content.codCapabilities.map((item) => {
                const Icon = item.icon;
                return (
                  <li
                    key={item.label}
                    className="flex items-center gap-4 py-4 sm:py-5"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-neutral-400" />
                    <span className="text-[15px] font-medium text-neutral-800 sm:text-base">
                      {item.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </FadeIn>
        </div>
      </section>

      {/* 6. Builder — editorial split */}
      <section
        id="builder"
        className="scroll-mt-20 border-b border-neutral-200 bg-white py-16 md:py-28"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <FadeIn>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">
                {copy.whyEttajer.eyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
                {copy.whyEttajer.visualBuilder.title}
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-neutral-500">
                {copy.whyEttajer.visualBuilder.description}
              </p>
              <Link
                href="/signup"
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 transition hover:text-neutral-600"
              >
                {copy.whyEttajer.visualBuilder.cta}
                <LandingArrowForward className="h-4 w-4" />
              </Link>
            </FadeIn>

            <FadeIn delay={0.12}>
              <div className="overflow-hidden bg-neutral-100">
                <img
                  src={LANDING.builderAccent}
                  alt={copy.whyEttajer.visualBuilder.imageAlt}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* 7. Platform features — clean 2-col */}
      <section
        id="features"
        className="scroll-mt-20 border-b border-neutral-200 bg-white py-16 md:py-24"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
          <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-14">
            <FadeIn className="max-w-2xl lg:col-span-5">
              <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
                {copy.whyEttajer.title}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-neutral-500">
                {copy.whyEttajer.subtitle}
              </p>
            </FadeIn>
            <FadeIn delay={0.1} className="hidden overflow-hidden bg-neutral-100 lg:col-span-7 lg:block">
              <img
                src={LANDING.marketing}
                alt=""
                loading="lazy"
                decoding="async"
                className="aspect-[16/9] w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </FadeIn>
          </div>

          <Stagger className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2 md:mt-16">
            {content.platformFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <StaggerItem key={feature.title}>
                  <div className="border-t border-neutral-200 pt-6">
                    <Icon className="h-5 w-5 text-neutral-400" />
                    <h3 className="mt-4 text-lg font-semibold tracking-tight text-neutral-900">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-neutral-500">
                      {feature.description}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* 8. Integrations — horizontal logos */}
      <section
        id="integrations"
        className="scroll-mt-20 border-b border-neutral-200 bg-neutral-50 py-14 md:py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
          <FadeIn className="max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">
              {copy.integrations.eyebrow}
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
              {copy.integrations.title}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-neutral-500">
              {copy.integrations.subtitle}
            </p>
          </FadeIn>

          <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-8 md:mt-12 md:gap-x-14">
            {content.integrationGroups.flatMap((group) =>
              group.items.map((item) => (
                <div
                  key={item.name}
                  className="flex flex-col items-center gap-2.5"
                >
                  <Image
                    src={item.logo}
                    alt={copy.integrations.logoAlt(item.name)}
                    width={48}
                    height={48}
                    className="h-9 w-auto max-w-[5.5rem] object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0"
                  />
                  <span className="text-xs text-neutral-400">{item.name}</span>
                </div>
              )),
            )}
          </div>
        </div>
      </section>

      {/* 9. Showcase — editorial */}
      <section
        id="showcase"
        className="scroll-mt-20 border-b border-neutral-200 bg-white py-16 md:py-28"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
          <FadeIn className="max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">
              {copy.showcase.eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
              {copy.showcase.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-neutral-500">
              {copy.showcase.subtitle}
            </p>
          </FadeIn>

          <div className="mt-12 space-y-16 md:mt-16 md:space-y-24">
            {content.storeShowcases.map((store, index) => (
              <FadeIn key={store.name}>
                <article
                  className={cn(
                    "grid items-center gap-8 lg:grid-cols-2 lg:gap-14",
                    index % 2 === 1 && "lg:[&>div:first-child]:order-2",
                  )}
                >
                  <div className="overflow-hidden bg-neutral-100">
                    <img
                      src={store.image || LANDING.storefrontShowcase}
                      alt={copy.showcase.storefrontAlt(store.name)}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">{store.category}</p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
                      {store.name}
                    </h3>
                    <p className="mt-3 max-w-md text-[15px] leading-relaxed text-neutral-500">
                      {store.description}
                    </p>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>

          <div className="mt-12 text-center md:mt-16">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              {copy.showcase.cta}
              <LandingArrowForward className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 10. Merchants — quote-forward */}
      <section
        id="merchants"
        className="scroll-mt-20 border-b border-neutral-200 bg-neutral-50 py-16 md:py-28"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
          <FadeIn className="max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">
              {copy.merchants.eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
              {copy.merchants.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-neutral-500">
              {copy.merchants.subtitle}
            </p>
          </FadeIn>

          <Stagger className="mt-12 grid gap-10 md:mt-16 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            {copy.merchants.testimonials.map((merchant) => (
              <StaggerItem key={merchant.name}>
                <blockquote className="flex h-full flex-col border-t border-neutral-300 pt-6">
                  <p className="flex-1 text-lg font-medium leading-relaxed tracking-tight text-neutral-800">
                    &ldquo;{merchant.quote}&rdquo;
                  </p>
                  <footer className="mt-6 flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-neutral-200">
                      <Image
                        src={merchant.avatar}
                        alt={merchant.name}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0">
                      <cite className="not-italic text-sm font-semibold text-neutral-900">
                        {merchant.name}
                      </cite>
                      <p className="truncate text-xs text-neutral-500">
                        {merchant.role}, {merchant.store} · {merchant.city}
                      </p>
                    </div>
                  </footer>
                </blockquote>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* 11. Pricing */}
      <section
        id="pricing"
        className="scroll-mt-20 border-b border-neutral-200 bg-white py-16 md:py-28"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">
              {copy.pricing.eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
              {copy.pricing.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-neutral-500">
              {copy.pricing.subtitle}
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <div className="w-full max-w-xs md:hidden">
                <LandingIosSegmentedControl
                  options={[
                    { value: "monthly", label: copy.pricing.billing.monthly },
                    {
                      value: "annually",
                      label: copy.pricing.billing.annualMobile,
                    },
                  ]}
                  value={billingPeriod}
                  onChange={setBillingPeriod}
                />
              </div>
              <div className="w-full max-w-xs md:hidden">
                <LandingIosSegmentedControl
                  options={[
                    { value: "MAD", label: "MAD" },
                    { value: "USD", label: "USD" },
                  ]}
                  value={currency}
                  onChange={setCurrency}
                />
              </div>

              <div className="hidden items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 p-1 md:inline-flex">
                <button
                  type="button"
                  onClick={() => setBillingPeriod("monthly")}
                  className={cn(
                    "rounded-full px-5 py-1.5 text-sm transition-all duration-200",
                    billingPeriod === "monthly"
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-500 hover:text-neutral-900",
                  )}
                >
                  {copy.pricing.billing.monthly}
                </button>
                <button
                  type="button"
                  onClick={() => setBillingPeriod("annually")}
                  className={cn(
                    "rounded-full px-5 py-1.5 text-sm transition-all duration-200",
                    billingPeriod === "annually"
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-500 hover:text-neutral-900",
                  )}
                >
                  {copy.pricing.billing.annualDesktop}
                </button>
              </div>

              <div className="hidden items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 p-1 md:inline-flex">
                {(["MAD", "USD"] as const).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setCurrency(code)}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-sm transition-all duration-200",
                      currency === code
                        ? "bg-neutral-900 text-white"
                        : "text-neutral-500 hover:text-neutral-900",
                    )}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Mobile pricing carousel */}
          <div className="mt-10 md:hidden">
            <LandingCarousel
              slideWidth={88}
              showDots
              edgeToEdge
              ariaLabel={copy.pricing.mobile.carouselAria}
              gap={12}
            >
              {content.pricingPlans.map((plan) => {
                const priceUsd =
                  billingPeriod === "annually"
                    ? plan.annualPriceUsd
                    : plan.monthlyPriceUsd;

                return (
                  <article
                    key={plan.id}
                    className={cn(
                      "flex flex-col rounded-2xl border p-6",
                      plan.popular
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-200 bg-white text-neutral-900",
                    )}
                  >
                    {plan.popular ? (
                      <p className="mb-4 text-sm font-medium text-white/70">
                        {copy.pricing.badge.mostPopular}
                      </p>
                    ) : (
                      <div className="mb-4 h-5" />
                    )}

                    <h3 className="text-xl font-semibold">{plan.localizedName}</h3>
                    <p
                      className={cn(
                        "mt-2 text-sm",
                        plan.popular ? "text-white/65" : "text-neutral-500",
                      )}
                    >
                      {plan.localizedDescription}
                    </p>

                    <div
                      className={cn(
                        "my-6 border-y py-5",
                        plan.popular ? "border-white/20" : "border-neutral-100",
                      )}
                    >
                      {plan.firstMonthFree ? (
                        <>
                          <p
                            className={cn(
                              "text-sm",
                              plan.popular ? "text-white/60" : "text-neutral-500",
                            )}
                          >
                            {copy.pricing.firstMonth.label}
                          </p>
                          <p className="mt-1 text-4xl font-semibold tracking-tight">
                            {copy.pricing.firstMonth.value}
                          </p>
                        </>
                      ) : null}
                      <p
                        className={cn(
                          "text-sm",
                          plan.firstMonthFree && "mt-3",
                          plan.popular ? "text-white/70" : "text-neutral-500",
                        )}
                      >
                        {plan.firstMonthFree ? copy.pricing.firstMonth.then : ""}
                        <span
                          className={cn(
                            "font-semibold",
                            plan.popular ? "text-white" : "text-neutral-900",
                          )}
                        >
                          {copy.pricing.formatPrice(priceUsd, currency, true)}
                        </span>
                      </p>
                    </div>

                    <ul className="flex-1 space-y-3">
                      {plan.localizedFeatures.slice(0, 5).map((feature) => (
                        <li
                          key={feature}
                          className={cn(
                            "flex items-start gap-2.5 text-sm",
                            plan.popular ? "text-white/80" : "text-neutral-600",
                          )}
                        >
                          <CheckCircle2
                            className={cn(
                              "mt-0.5 h-4 w-4 shrink-0",
                              plan.popular ? "text-white/70" : "text-neutral-400",
                            )}
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href="/signup"
                      className={cn(
                        "mt-6 block rounded-full py-3.5 text-center text-sm font-semibold transition",
                        plan.popular
                          ? "bg-white text-neutral-900 hover:bg-white/90"
                          : "bg-neutral-900 text-white hover:bg-neutral-800",
                      )}
                    >
                      {plan.localizedCta}
                    </Link>
                  </article>
                );
              })}
            </LandingCarousel>

            <p className="mt-6 text-center text-xs text-neutral-400">
              {copy.pricing.footnote.mobile}
            </p>
            <p className="mt-3 text-center text-xs leading-relaxed text-neutral-500">
              {copy.pricing.everyPlanIncludes}: {copy.pricing.includes.join(" · ")}
            </p>
          </div>

          {/* Desktop pricing */}
          <div className="mt-14 hidden gap-5 lg:grid lg:grid-cols-3">
            {content.pricingPlans.map((plan) => {
              const priceUsd =
                billingPeriod === "annually"
                  ? plan.annualPriceUsd
                  : plan.monthlyPriceUsd;

              return (
                <article
                  key={plan.id}
                  className={cn(
                    "flex h-full flex-col rounded-2xl border p-7",
                    plan.popular
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white",
                  )}
                >
                  {plan.popular ? (
                    <p className="mb-4 text-sm font-medium text-white/70">
                      {copy.pricing.badge.mostPopular}
                    </p>
                  ) : (
                    <div className="mb-4 h-5" />
                  )}

                  <h3
                    className={cn(
                      "text-lg font-semibold",
                      plan.popular ? "text-white" : "text-neutral-900",
                    )}
                  >
                    {plan.localizedName}
                  </h3>
                  <p
                    className={cn(
                      "mt-1 text-sm leading-relaxed",
                      plan.popular ? "text-white/60" : "text-neutral-500",
                    )}
                  >
                    {plan.localizedDescription}
                  </p>

                  <div
                    className={cn(
                      "my-6 border-y py-5",
                      plan.popular ? "border-white/15" : "border-neutral-100",
                    )}
                  >
                    {plan.firstMonthFree ? (
                      <>
                        <p
                          className={cn(
                            "text-sm font-medium",
                            plan.popular ? "text-white/55" : "text-neutral-500",
                          )}
                        >
                          {copy.pricing.firstMonth.label}
                        </p>
                        <p
                          className={cn(
                            "mt-1 text-4xl font-semibold tracking-tight",
                            plan.popular ? "text-white" : "text-neutral-900",
                          )}
                        >
                          {copy.pricing.firstMonth.value}
                        </p>
                      </>
                    ) : null}

                    <p
                      className={cn(
                        "text-sm",
                        plan.firstMonthFree && "mt-3",
                        plan.popular ? "text-white/60" : "text-neutral-500",
                      )}
                    >
                      {plan.firstMonthFree ? copy.pricing.firstMonth.then : ""}
                      <span
                        className={cn(
                          "font-medium",
                          plan.popular ? "text-white" : "text-neutral-900",
                        )}
                      >
                        {copy.pricing.formatPrice(priceUsd, currency, true)}
                      </span>
                    </p>
                    {billingPeriod === "annually" ? (
                      <p
                        className={cn(
                          "mt-2 text-xs",
                          plan.popular ? "text-white/45" : "text-neutral-400",
                        )}
                      >
                        {copy.pricing.formatSavings(
                          (plan.monthlyPriceUsd - plan.annualPriceUsd) * 12,
                          currency,
                        )}{" "}
                        ·{" "}
                        {copy.pricing.formatAnnualTotal(
                          plan.annualPriceUsd * 12,
                          currency,
                        )}
                      </p>
                    ) : null}
                  </div>

                  <ul className="flex-1 space-y-3">
                    {plan.localizedFeatures.map((feature) => (
                      <li
                        key={feature}
                        className={cn(
                          "flex items-start gap-2.5 text-sm",
                          plan.popular ? "text-white/75" : "text-neutral-600",
                        )}
                      >
                        <CheckCircle2
                          className={cn(
                            "mt-0.5 h-4 w-4 shrink-0",
                            plan.popular ? "text-white/50" : "text-neutral-400",
                          )}
                        />
                        <span
                          className={
                            feature.includes("0%")
                              ? cn(
                                  "font-medium",
                                  plan.popular ? "text-white" : "text-neutral-900",
                                )
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
                    className={cn(
                      "mt-6 block rounded-full py-3 text-center text-sm font-semibold transition active:scale-[0.98]",
                      plan.popular
                        ? "bg-white text-neutral-900 hover:bg-white/90"
                        : "border border-neutral-200 text-neutral-700 hover:bg-neutral-50",
                    )}
                  >
                    {plan.localizedCta}
                  </Link>
                </article>
              );
            })}
          </div>

          <p className="mt-8 hidden text-center text-sm text-neutral-500 md:block">
            {copy.pricing.footnote.desktop(copy.pricing.includes.join(" · "))}
          </p>
        </div>
      </section>

      {/* 12. FAQ */}
      <section
        id="faq"
        className="scroll-mt-20 border-b border-neutral-200 bg-white py-16 md:py-28"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
          <div className="md:hidden">
            <FadeIn>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">
                {copy.faq.eyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900">
                {copy.faq.title}
              </h2>
              <p className="mt-3 text-base text-neutral-500">{copy.faq.subtitle}</p>
            </FadeIn>

            <div className="mt-8 divide-y divide-neutral-200 border-y border-neutral-200">
              {copy.faq.items.map((faq, idx) => {
                const isOpen = faqOpenIndex === idx;
                return (
                  <article key={faq.question}>
                    <button
                      type="button"
                      onClick={() => setFaqOpenIndex(isOpen ? null : idx)}
                      className="flex w-full items-start justify-between gap-4 py-4 text-start"
                      aria-expanded={isOpen}
                    >
                      <p className="min-w-0 flex-1 text-[16px] font-medium leading-snug text-neutral-900">
                        {faq.question}
                      </p>
                      <ChevronDown
                        className={cn(
                          "mt-0.5 h-5 w-5 shrink-0 text-neutral-400 transition-transform duration-200",
                          isOpen && "rotate-180",
                        )}
                      />
                    </button>
                    <div
                      className={cn(
                        "grid transition-all duration-200",
                        isOpen
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0",
                      )}
                    >
                      <div className="overflow-hidden">
                        <p className="pb-4 text-[15px] leading-relaxed text-neutral-500">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <Link
              href="/help"
              className="mt-8 flex items-center justify-between gap-4 border-t border-neutral-200 pt-6"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-neutral-400" />
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-neutral-900">
                    {copy.faq.stillHaveQuestions}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {copy.faq.browseHelpCenter}
                  </p>
                </div>
              </div>
              <LandingArrowForward className="h-5 w-5 shrink-0 text-neutral-300" />
            </Link>
          </div>

          <div className="hidden gap-12 lg:grid lg:grid-cols-2 lg:gap-20">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">
                {copy.faq.eyebrow}
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-neutral-900">
                {copy.faq.title}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-neutral-500">
                {copy.faq.subtitle}
              </p>

              <div className="mt-8 border-t border-neutral-200 pt-8">
                <p className="text-sm font-medium text-neutral-900">
                  {copy.faq.stillHaveQuestions}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                  {copy.faq.sidebarBody}
                </p>
                <Link
                  href="/help"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 transition hover:text-neutral-600"
                >
                  <Mail className="h-4 w-4" />
                  {copy.faq.browseHelpCenterCta}
                  <LandingArrowForward className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="divide-y divide-neutral-200 border-y border-neutral-200">
              {copy.faq.items.map((faq, idx) => {
                const isOpen = faqOpenIndex === idx;
                return (
                  <article key={faq.question}>
                    <button
                      type="button"
                      onClick={() => setFaqOpenIndex(isOpen ? null : idx)}
                      className="flex w-full items-start justify-between gap-4 py-5 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/40 focus-visible:ring-offset-2"
                      aria-expanded={isOpen}
                    >
                      <p className="text-base font-medium text-neutral-900">
                        {faq.question}
                      </p>
                      <ChevronDown
                        className={cn(
                          "mt-0.5 h-5 w-5 shrink-0 text-neutral-400 transition-transform duration-200",
                          isOpen && "rotate-180",
                        )}
                      />
                    </button>
                    <div
                      className={cn(
                        "grid transition-all duration-200",
                        isOpen
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0",
                      )}
                    >
                      <div className="overflow-hidden">
                        <p className="pb-5 text-sm leading-relaxed text-neutral-500">
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

      {/* 13. Final CTA — neutral-950 */}
      <section className="bg-neutral-950 py-16 text-center text-white md:py-24">
        <div className="mx-auto max-w-2xl space-y-6 px-4 sm:px-6">
          <div className="space-y-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/40">
              {copy.cta.eyebrow}
            </p>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
              {copy.cta.title}
            </h2>
            <p className="text-base leading-relaxed text-white/60 md:text-lg">
              {copy.cta.subtitle}
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-center">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-semibold text-neutral-900 transition hover:bg-white/90 active:scale-[0.98] sm:h-auto sm:py-3.5"
            >
              {copy.cta.startForFree}
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/25 px-8 text-sm font-medium text-white transition hover:bg-white/10 active:scale-[0.98] sm:h-auto sm:py-3.5"
            >
              {copy.cta.signIn}
            </Link>
          </div>
        </div>
      </section>

      {/* 14. Footer */}
      <LandingFooter />
    </div>
  );
}
