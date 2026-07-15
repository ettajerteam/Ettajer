"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { GETTING_STARTED_CHECKLIST } from "@/lib/help/help-checklist";
import { useHelpLocale } from "@/components/help/help-locale-provider";
import { LandingCarousel } from "@/components/landing/landing-mobile-carousel";
import { LandingArrowForward } from "@/components/landing/landing-direction-icon";
import {
  HelpMobileSectionLabel,
  HelpMobileCard,
} from "@/components/help/help-mobile-ui";

export function HelpChecklistSection() {
  const { copy } = useHelpLocale();
  const c = copy.checklist;

  return (
    <section className="border-b border-black/[0.04] bg-[#F2F2F7] md:border-neutral-200 md:bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <HelpMobileSectionLabel title={c.title} subtitle={c.subtitle} />

        <div className="md:hidden">
          <LandingCarousel slideWidth={88} edgeToEdge ariaLabel={c.checklistAria} gap={12}>
            {GETTING_STARTED_CHECKLIST.map((item, index) => {
              const itemCopy = c.items[index];
              if (!itemCopy) return null;

              return (
                <HelpMobileCard key={item.step} className="flex min-h-[15rem] flex-col">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#007AFF] text-[13px] font-bold text-white">
                      {item.step}
                    </span>
                    <span className="text-[12px] font-semibold uppercase tracking-wide text-[#8E8E93]">
                      {c.stepLabel(item.step)}
                    </span>
                  </div>
                  <h3 className="mt-4 text-[1.15rem] font-bold text-neutral-900">{itemCopy.title}</h3>
                  <p className="mt-2 flex-1 text-[15px] leading-relaxed text-[#8E8E93]">
                    {itemCopy.description}
                  </p>
                  <div className="mt-5 space-y-2 border-t border-[#E5E5EA] pt-4">
                    <Link
                      href={item.href}
                      className="block text-[15px] font-semibold text-[#007AFF]"
                    >
                      {c.goToDashboard}
                    </Link>
                    <Link
                      href={`/help/${item.articleSlug}`}
                      className="inline-flex items-center gap-1 text-[14px] text-[#8E8E93]"
                    >
                      {c.readGuide}
                      <LandingArrowForward className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </HelpMobileCard>
              );
            })}
          </LandingCarousel>
        </div>

        <ol className="mt-8 hidden gap-3 md:grid md:grid-cols-5">
          {GETTING_STARTED_CHECKLIST.map((item, index) => {
            const itemCopy = c.items[index];
            if (!itemCopy) return null;

            return (
              <li
                key={item.step}
                className="flex flex-col rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                    {item.step}
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-neutral-900">{itemCopy.title}</h3>
                <p className="mt-1 flex-1 text-xs leading-relaxed text-neutral-500">
                  {itemCopy.description}
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <Link
                    href={item.href}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    {c.goToDashboard}
                  </Link>
                  <Link
                    href={`/help/${item.articleSlug}`}
                    className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900"
                  >
                    {c.readGuide}
                    <LandingArrowForward className="h-3 w-3" />
                  </Link>
                </div>
              </li>
            );
          })}
        </ol>

        <p className="mt-6 flex items-center gap-2 text-[13px] text-[#8E8E93] md:text-xs md:text-neutral-400">
          <CheckCircle2 className="h-4 w-4 text-[#34C759] md:h-3.5 md:w-3.5" />
          {c.footnote}
        </p>
      </div>
    </section>
  );
}
