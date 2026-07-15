"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FounderCard } from "@/components/founder/founder-card";
import { FounderGlassBadge } from "@/components/founder/founder-glass-badges";
import { useFounderApp } from "@/components/founder/founder-app-context";
import {
  FounderContactPanel,
  FounderCardMobileView,
  FounderMobileHeader,
} from "@/components/founder/founder-mobile-nav";
import { useFounderFlowLocale } from "@/components/founder/founder-flow-root";
import { LandingChevronForward } from "@/components/landing/landing-direction-icon";
import { LandingArrowForward } from "@/components/landing/landing-direction-icon";
import { cn } from "@/lib/utils";

interface WelcomeContentProps {
  name: string;
  email: string;
  founderNumber: number;
}

export function WelcomeContent({ name, email, founderNumber }: WelcomeContentProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { tab, setTab } = useFounderApp();
  const { copy } = useFounderFlowLocale();
  const w = copy.welcome;
  const firstName = name.split(" ")[0] ?? name;

  const scrollToCard = () => {
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  if (tab === "card") {
    return (
      <FounderCardMobileView>
        <div ref={cardRef} className="flex justify-center">
          <FounderCard name={name} founderNumber={founderNumber} fixedSize showHint={false} />
        </div>
      </FounderCardMobileView>
    );
  }

  if (tab === "contact") {
    return (
      <div className="md:hidden">
        <FounderContactPanel email={email} founderNumber={founderNumber} />
      </div>
    );
  }

  return (
    <div className={cn("mx-auto max-w-2xl", tab === "menu" && "hidden md:block")}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="md:text-center"
      >
        <div className="md:hidden">
          <FounderMobileHeader
            title={w.mobileTitle(firstName)}
            subtitle={w.mobileSubtitle}
          />
        </div>

        <FounderGlassBadge founderNumber={founderNumber} className="mb-4 hidden md:flex" />
        <FounderGlassBadge founderNumber={founderNumber} className="mb-4 md:hidden" />

        <h1 className="hidden text-3xl font-semibold tracking-[-0.03em] text-neutral-900 sm:text-4xl md:block">
          {w.desktopTitle(firstName)}
        </h1>
        <p className="mx-auto mt-3 hidden max-w-md text-[15px] leading-relaxed text-neutral-500 md:block">
          {w.desktopLine1}
          <br />
          {w.desktopLine2}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.12 }}
        className="mt-6 md:hidden"
      >
        <p className="mb-2 px-1 text-[13px] font-medium uppercase tracking-wide text-[#8E8E93]">
          {w.nextStep}
        </p>
        <div className="overflow-hidden rounded-[0.625rem] bg-white">
          <button
            type="button"
            onClick={() => setTab("card")}
            className="flex w-full items-center gap-3 border-b border-[#E5E5EA] px-4 py-3.5 text-start active:bg-[#E5E5EA]/60"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#007AFF]">
              <LandingArrowForward className="h-[1.15rem] w-[1.15rem] text-white" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[17px] text-neutral-900">{w.viewFounderCard}</p>
              <p className="text-[13px] text-[#8E8E93]">{w.tapToFlip}</p>
            </div>
            <LandingChevronForward className="h-5 w-5 shrink-0 text-[#C7C7CC]" />
          </button>
          <Link
            href="/early-access?new=1"
            className="flex items-center gap-3 px-4 py-3.5 active:bg-[#E5E5EA]/60"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-900">
              <LandingArrowForward className="h-[1.15rem] w-[1.15rem] text-white" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[17px] text-neutral-900">{w.continueEarlyAccess}</p>
              <p className="text-[13px] text-[#8E8E93]">{w.yourWaitingPage}</p>
            </div>
            <LandingChevronForward className="h-5 w-5 shrink-0 text-[#C7C7CC]" />
          </Link>
        </div>
      </motion.div>

      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="mt-10 hidden md:block"
      >
        <FounderCard name={name} founderNumber={founderNumber} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8 hidden flex-col items-center gap-3 sm:flex-row sm:justify-center md:flex"
      >
        <button
          type="button"
          onClick={scrollToCard}
          className="hidden h-11 items-center justify-center rounded-xl border border-neutral-200 bg-white px-5 text-sm font-medium text-neutral-800 transition-colors hover:border-neutral-300 hover:bg-neutral-50 md:inline-flex"
        >
          {w.viewFounderCardButton}
        </button>
        <Link
          href="/early-access?new=1"
          className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
        >
          {w.continueEarlyAccess}
          <LandingArrowForward className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
        </Link>
      </motion.div>
    </div>
  );
}
