"use client";

import Link from "next/link";
import { MARKETING_GUIDES } from "@/lib/help/help-checklist";
import { useHelpLocale } from "@/components/help/help-locale-provider";
import { LandingCarousel } from "@/components/landing/landing-mobile-carousel";
import { LandingArrowForward } from "@/components/landing/landing-direction-icon";
import {
  HelpMobileSectionLabel,
  HelpMobileCard,
} from "@/components/help/help-mobile-ui";

export function HelpMarketingGuidesSection() {
  const { copy } = useHelpLocale();
  const g = copy.marketingGuides;

  return (
    <section className="border-b border-black/[0.04] bg-[#F2F2F7] md:border-neutral-200 md:bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <HelpMobileSectionLabel
          title={g.title}
          subtitle={g.subtitle}
          action={
            <Link
              href="/help/category/marketing"
              className="shrink-0 text-[14px] font-semibold text-[#007AFF] md:text-sm md:font-medium md:text-blue-600"
            >
              {g.browseAll}
            </Link>
          }
        />

        <div className="md:hidden">
          <LandingCarousel
            slideWidth={88}
            edgeToEdge
            ariaLabel={g.guidesAria}
            gap={12}
          >
            {MARKETING_GUIDES.map((item, index) => {
              const itemCopy = g.items[index];
              if (!itemCopy) return null;
              const darkBadge = item.id === "snapchat";

              return (
                <HelpMobileCard
                  key={item.id}
                  className="flex min-h-[14rem] flex-col"
                >
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-[11px] font-bold tracking-tight"
                    style={{
                      backgroundColor: item.accent,
                      color: darkBadge ? "#111" : "#fff",
                    }}
                  >
                    {item.badge}
                  </span>
                  <h3 className="mt-4 text-[1.15rem] font-bold text-neutral-900">
                    {itemCopy.title}
                  </h3>
                  <p className="mt-2 flex-1 text-[15px] leading-relaxed text-[#8E8E93]">
                    {itemCopy.description}
                  </p>
                  <div className="mt-5 space-y-2 border-t border-[#E5E5EA] pt-4">
                    <Link
                      href={`/help/${item.articleSlug}`}
                      className="block text-[15px] font-semibold text-[#007AFF]"
                    >
                      {g.readGuide}
                    </Link>
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1 text-[14px] text-[#8E8E93]"
                    >
                      {g.openInDashboard}
                      <LandingArrowForward className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </HelpMobileCard>
              );
            })}
          </LandingCarousel>
        </div>

        <ul className="mt-8 hidden gap-3 md:grid md:grid-cols-2 lg:grid-cols-3">
          {MARKETING_GUIDES.map((item, index) => {
            const itemCopy = g.items[index];
            if (!itemCopy) return null;
            const darkBadge = item.id === "snapchat";

            return (
              <li
                key={item.id}
                className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold tracking-tight"
                    style={{
                      backgroundColor: item.accent,
                      color: darkBadge ? "#111" : "#fff",
                    }}
                  >
                    {item.badge}
                  </span>
                  <h3 className="text-sm font-semibold text-neutral-900">
                    {itemCopy.title}
                  </h3>
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-neutral-500">
                  {itemCopy.description}
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <Link
                    href={`/help/${item.articleSlug}`}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    {g.readGuide}
                  </Link>
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900"
                  >
                    {g.openInDashboard}
                    <LandingArrowForward className="h-3 w-3" />
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
