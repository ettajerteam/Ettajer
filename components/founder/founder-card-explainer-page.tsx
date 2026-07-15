"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, Mail, ArrowUp, CreditCard } from "lucide-react";
import { HelpShell } from "@/components/help/help-shell";
import { HelpMobileHeader } from "@/components/help/help-mobile-ui";
import { FounderCard } from "@/components/founder/founder-card";
import { useHelpLocale } from "@/components/help/help-locale-provider";
import { getFounderCardExplainerCopy } from "@/lib/founder/founder-card-explainer-i18n";
import { MAX_FOUNDERS } from "@/lib/founder/constants";
import { SUPPORT_MAILTO } from "@/lib/constants/support";
import { LandingArrowForward } from "@/components/landing/landing-direction-icon";
import { cn } from "@/lib/utils";

const DEMO_FOUNDER_NUMBER = 42;

type PublicFounderStats = {
  founderCount: number;
  maxFounders: number;
  spotsLeft: number;
  isFull: boolean;
};

export function FounderCardExplainerPage() {
  const { locale, isRtl } = useHelpLocale();
  const copy = getFounderCardExplainerCopy(locale);
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
        if (!cancelled && data) setStats(data);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const communityPercent = Math.round((stats.founderCount / stats.maxFounders) * 100);

  return (
    <HelpShell>
      <section className="border-b border-black/[0.04] bg-[#F2F2F7] md:border-neutral-200 md:bg-neutral-50">
        <div className="mx-auto max-w-6xl px-3 py-12 md:px-6 md:py-20">
          <div className="mx-auto max-w-3xl md:text-center">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 text-white shadow-[0_4px_14px_rgba(0,0,0,0.18)] md:mx-auto md:mb-6">
              <BadgeCheck className="h-5 w-5" strokeWidth={2} />
            </div>
            <HelpMobileHeader
              eyebrow={copy.hero.eyebrow}
              title={copy.hero.title}
              subtitle={copy.hero.subtitle}
            />
            <p className="mt-5 text-[14px] text-[#8E8E93] md:text-sm md:text-neutral-500">
              {copy.hero.lastUpdated}
            </p>

            <div className="mt-6 grid grid-cols-3 gap-2 rounded-[0.875rem] border border-[#E5E5EA] bg-white p-3 md:mx-auto md:mt-8 md:max-w-md md:rounded-2xl md:p-4">
              <div className="text-center">
                <p className="text-[1.1rem] font-bold text-neutral-900 md:text-xl">
                  {stats.founderCount}/{stats.maxFounders}
                </p>
                <p className="mt-1 text-[10px] font-medium text-[#8E8E93] md:text-[11px]">
                  {copy.stats.joined}
                </p>
              </div>
              <div className="border-x border-[#E5E5EA] text-center">
                <p
                  className={`text-[1.1rem] font-bold md:text-xl ${
                    stats.spotsLeft <= 10 && !stats.isFull ? "text-[#FF9500]" : "text-neutral-900"
                  }`}
                >
                  {stats.isFull ? copy.stats.full : stats.spotsLeft}
                </p>
                <p className="mt-1 text-[10px] font-medium text-[#8E8E93] md:text-[11px]">
                  {copy.stats.spotsLeft}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[1.1rem] font-bold text-neutral-900 md:text-xl">
                  {communityPercent}%
                </p>
                <p className="mt-1 text-[10px] font-medium text-[#8E8E93] md:text-[11px]">
                  {copy.stats.filled}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-black/[0.04] bg-white py-10 md:py-14">
        <div className="mx-auto max-w-6xl px-3 md:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="overflow-hidden rounded-[0.875rem] border border-[#E5E5EA] bg-[#F2F2F7] p-5 md:rounded-2xl md:border-neutral-200 md:bg-neutral-50 md:p-8">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#007AFF]">
                    {copy.preview.label}
                  </p>
                  <p className="mt-1 text-[14px] text-neutral-600">{copy.preview.tapHint}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 font-mono text-[11px] font-semibold text-neutral-600">
                  <CreditCard className="h-3 w-3 text-[#007AFF]" />
                  {copy.preview.badge}
                </span>
              </div>
              <div className="-mx-1 overflow-x-auto overflow-y-visible px-1 pb-2 [-webkit-overflow-scrolling:touch]">
                <div className="flex min-w-full justify-center">
                  <FounderCard
                    name={copy.preview.demoName}
                    founderNumber={DEMO_FOUNDER_NUMBER}
                    fixedSize
                    showHint={false}
                    className="py-2"
                  />
                </div>
              </div>
              <p className="mt-4 text-center text-[12px] text-[#8E8E93] sm:hidden">
                {copy.preview.swipeHint}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-10 md:py-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-3 md:flex-row md:items-start md:gap-12 md:px-6">
          <aside className="md:sticky md:top-24 md:w-64 md:shrink-0">
            <div className="rounded-[0.875rem] border border-[#E5E5EA] bg-[#F2F2F7] p-4 md:rounded-2xl md:border-neutral-200 md:bg-neutral-50 md:p-5">
              <p className="text-[12px] font-bold uppercase tracking-wide text-[#8E8E93]">
                {copy.toc.onThisPage}
              </p>
              <nav className="mt-3 max-h-[50vh] overflow-y-auto overscroll-contain md:max-h-[calc(100vh-8rem)]">
                <ul className="space-y-1">
                  {copy.sections.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="block rounded-lg px-2 py-1.5 text-[13px] leading-snug text-neutral-700 transition-colors hover:bg-white hover:text-neutral-900 md:text-sm"
                      >
                        {section.title}
                      </a>
                    </li>
                  ))}
                  <li>
                    <a
                      href="#faq"
                      className="block rounded-lg px-2 py-1.5 text-[13px] leading-snug text-neutral-700 transition-colors hover:bg-white hover:text-neutral-900 md:text-sm"
                    >
                      {copy.toc.faqTitle}
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </aside>

          <article className="min-w-0 flex-1 md:max-w-3xl">
            <div className="mb-8 rounded-[0.875rem] border border-[#E5E5EA] bg-[#F2F2F7] p-5 md:rounded-2xl md:border-neutral-200 md:bg-neutral-50 md:p-6">
              <p className="text-[15px] leading-relaxed text-neutral-700 md:text-sm">
                {copy.intro.body}
              </p>
              <p className="mt-3 text-[14px] text-[#8E8E93] md:text-sm md:text-neutral-500">
                {copy.intro.related}{" "}
                <Link href="/signup" className="font-medium text-[#007AFF] hover:underline">
                  {copy.intro.createAccount}
                </Link>{" "}
                ·{" "}
                <Link href="/login" className="font-medium text-[#007AFF] hover:underline">
                  {copy.intro.signIn}
                </Link>{" "}
                ·{" "}
                <Link href="/help" className="font-medium text-[#007AFF] hover:underline">
                  {copy.intro.helpCenter}
                </Link>
              </p>
            </div>

            <div className="space-y-10 md:space-y-12">
              {copy.sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-[calc(4.5rem+env(safe-area-inset-top))] md:scroll-mt-28"
                >
                  <h2 className="text-[1.25rem] font-bold tracking-tight text-neutral-900 md:text-xl">
                    {section.title}
                  </h2>
                  <div className="mt-4 space-y-4">
                    {section.paragraphs.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="text-[15px] leading-[1.7] text-neutral-700 md:text-base md:leading-relaxed"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  {section.bullets?.length ? (
                    <ul className="mt-4 list-disc space-y-2.5 ps-5">
                      {section.bullets.map((item) => (
                        <li
                          key={item}
                          className="text-[15px] leading-[1.65] text-neutral-700 md:text-base md:leading-relaxed"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {section.id === "tiers" ? (
                    <div className="mt-5 overflow-x-auto rounded-[0.875rem] border border-[#E5E5EA] md:rounded-2xl md:border-neutral-200">
                      <table className="min-w-full divide-y divide-[#E5E5EA] text-start text-[14px] md:text-sm">
                        <thead className="bg-[#F2F2F7] md:bg-neutral-50">
                          <tr>
                            <th className="px-4 py-3 font-semibold text-neutral-900">
                              {copy.tierTable.range}
                            </th>
                            <th className="px-4 py-3 font-semibold text-neutral-900">
                              {copy.tierTable.tier}
                            </th>
                            <th className="px-4 py-3 font-semibold text-neutral-900">
                              {copy.tierTable.meaning}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E5EA] bg-white">
                          {copy.tierRows.map((row) => (
                            <tr key={row.range}>
                              <td className="px-4 py-3 align-top font-mono text-[13px] font-medium text-neutral-900">
                                {row.range}
                              </td>
                              <td className="px-4 py-3 align-top font-medium text-neutral-900">
                                {row.label}
                              </td>
                              <td className="px-4 py-3 align-top text-neutral-700">
                                {row.description}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </section>
              ))}

              <section
                id="faq"
                className="scroll-mt-[calc(4.5rem+env(safe-area-inset-top))] md:scroll-mt-28"
              >
                <h2 className="text-[1.25rem] font-bold tracking-tight text-neutral-900 md:text-xl">
                  {copy.toc.faqTitle}
                </h2>
                <div className="mt-5 space-y-4">
                  {copy.faq.map((item) => (
                    <div
                      key={item.q}
                      className="rounded-[0.875rem] border border-[#E5E5EA] bg-white p-4 md:rounded-2xl md:border-neutral-200 md:p-5"
                    >
                      <h3 className="text-[15px] font-semibold text-neutral-900 md:text-base">
                        {item.q}
                      </h3>
                      <p className="mt-2 text-[15px] leading-relaxed text-neutral-600 md:text-sm">
                        {item.a}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="mt-12 rounded-[0.875rem] border border-[#E5E5EA] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] md:rounded-2xl md:border-neutral-200 md:p-6">
              <h2 className="text-[1.1rem] font-bold text-neutral-900 md:text-lg">
                {stats.isFull ? copy.cta.fullTitle : copy.cta.readyTitle}
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-neutral-600 md:text-sm">
                {stats.isFull ? copy.cta.fullBody : copy.cta.readyBody(stats.spotsLeft)}
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-[0.75rem] bg-neutral-900 px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-neutral-800 md:rounded-full md:text-sm"
                >
                  {stats.isFull ? copy.cta.createAccount : copy.cta.claimCard}
                  <LandingArrowForward className="h-4 w-4" />
                </Link>
                <a
                  href={SUPPORT_MAILTO}
                  className="inline-flex items-center justify-center gap-2 rounded-[0.75rem] border border-[#E5E5EA] px-5 py-3 text-[15px] font-semibold text-neutral-800 transition-colors hover:bg-[#F2F2F7] md:rounded-full md:text-sm"
                >
                  <Mail className="h-4 w-4" />
                  {copy.cta.emailSupport}
                </a>
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="mt-8 inline-flex items-center gap-2 text-[14px] font-semibold text-[#007AFF] md:text-sm"
            >
              <ArrowUp className={cn("h-4 w-4", isRtl && "scale-x-[-1]")} />
              {copy.backToTop}
            </button>
          </article>
        </div>
      </section>
    </HelpShell>
  );
}
