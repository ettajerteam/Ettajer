"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BadgeCheck,
  Clock,
  Headphones,
  Gift,
  LayoutDashboard,
  Package,
  CreditCard,
  Puzzle,
  Lock,
  Sparkles,
  Rocket,
  Bell,
  Users,
  Calendar,
  Mail,
  MessageCircle,
  ChevronDown,
  ChevronRight,
  Circle,
  CheckCircle2,
  TrendingUp,
  ShoppingBag,
  BarChart3,
  Brain,
  Zap,
  Target,
} from "lucide-react";
import { FounderCard } from "@/components/founder/founder-card";
import { FounderGlassBadges } from "@/components/founder/founder-glass-badges";
import { useFounderApp } from "@/components/founder/founder-app-context";
import { FounderContactPanel, FounderCardMobileView, FounderMobileHeader } from "@/components/founder/founder-mobile-nav";
import { useFounderFlowLocale } from "@/components/founder/founder-flow-root";
import { formatFounderNumber, formatFounderNumberShort, MAX_FOUNDERS } from "@/lib/founder/constants";
import { buildWaitingIntelligence, type WaitingIntelligence } from "@/lib/founder/waiting-intelligence";
import { formatJoinedDate, maskEmail } from "@/lib/founder/founder-flow-i18n";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface EarlyAccessContentProps {
  name: string;
  email: string;
  founderNumber: number;
  founderCount: number;
  joinedAt: string;
  isReturning?: boolean;
  foundersJoinedRecently: number;
}

const EASE = [0.22, 1, 0.36, 1] as const;

const BENEFIT_ICONS = [BadgeCheck, Clock, Headphones, Gift] as const;
const BENEFIT_ACCENTS = [
  "from-blue-500/10 to-indigo-500/5",
  "from-violet-500/10 to-purple-500/5",
  "from-emerald-500/10 to-teal-500/5",
  "from-amber-500/10 to-orange-500/5",
] as const;

const INSIGHT_ICONS: Record<string, typeof Sparkles> = {
  pioneer: Zap,
  tier: Sparkles,
  launch: Target,
  community: Users,
  patience: Clock,
};

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: typeof Sparkles;
  label: string;
  value: string;
  sub?: string;
  accent: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-4 sm:rounded-[1.15rem] sm:border sm:border-black/[0.04] sm:bg-white/90 sm:p-5 sm:shadow-sm sm:backdrop-blur-sm">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 hidden bg-gradient-to-br opacity-70 sm:block",
          accent,
        )}
        aria-hidden
      />
      <div className="relative flex items-start gap-3 sm:block">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#007AFF]/10 text-[#007AFF] sm:mb-3 sm:h-9 sm:w-9 sm:rounded-lg sm:border sm:border-white/80 sm:bg-white/90 sm:shadow-sm">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-[#8E8E93] sm:text-[11px] sm:uppercase sm:tracking-[0.12em] sm:text-neutral-400">
            {label}
          </p>
          <p className="mt-0.5 text-[1.35rem] font-semibold leading-tight tracking-[-0.02em] text-neutral-900 sm:mt-1 sm:text-lg md:text-xl">
            {value}
          </p>
          {sub ? <p className="mt-0.5 text-[13px] text-[#8E8E93] sm:text-[12px] sm:text-neutral-500">{sub}</p> : null}
        </div>
      </div>
    </div>
  );
}

function SmartInsightsPanel({
  insights,
  w,
}: {
  insights: { id: string; title: string; body: string }[];
  w: import("@/lib/founder/founder-flow-i18n").FounderFlowCopy["waiting"];
}) {
  return (
    <div>
      <p className="mb-2 px-1 text-[13px] font-medium uppercase tracking-wide text-[#8E8E93] md:hidden">
        {w.forYou}
      </p>
      <div className="overflow-hidden rounded-[0.625rem] bg-white sm:rounded-[1.35rem] sm:border sm:border-indigo-100/80 sm:bg-gradient-to-br sm:from-indigo-50/60 sm:via-white sm:to-blue-50/40 sm:shadow-sm">
        <div className="hidden items-center gap-3 border-b border-indigo-100/60 px-6 py-4 md:flex lg:px-8 lg:py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            <Brain className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-neutral-900">{w.personalizedTitle}</p>
            <p className="text-[13px] text-neutral-500">{w.personalizedSubtitle}</p>
          </div>
        </div>
        <div className="divide-y divide-[#E5E5EA] md:grid md:gap-px md:divide-y-0 md:bg-indigo-100/40 md:grid-cols-3">
          {insights.map((insight, i) => {
            const Icon = INSIGHT_ICONS[insight.id] ?? Sparkles;
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.05 }}
                className={cn(
                  "px-4 py-3.5 md:bg-white/80 md:px-6 md:py-5 lg:px-7",
                  insight.id === "tier" && "md:hidden",
                )}
              >
                <div className="mb-1.5 flex items-center gap-2 sm:mb-2">
                  <Icon className="h-4 w-4 text-[#007AFF] sm:h-3.5 sm:w-3.5 sm:text-indigo-500" />
                  <p className="text-[15px] font-medium text-neutral-900 sm:text-[12px] sm:font-semibold">
                    {insight.title}
                  </p>
                </div>
                <p className="text-[15px] leading-snug text-[#8E8E93] sm:text-[13px] sm:leading-relaxed sm:text-neutral-500">
                  {insight.body}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PrimaryActionCard({
  action,
  onScrollToCard,
  onGoToCard,
  recommendedLabel,
}: {
  action: WaitingIntelligence["primaryAction"];
  onScrollToCard: () => void;
  onGoToCard?: () => void;
  recommendedLabel: string;
}) {
  const handleClick = () => {
    if (action.scrollTarget === "card" && onGoToCard) {
      onGoToCard();
      return;
    }
    onScrollToCard();
  };

  const content = (
    <>
      <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
        <Zap className="h-3 w-3" />
        {recommendedLabel}
      </span>
      <h3 className="text-[15px] font-semibold text-neutral-900">{action.title}</h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">{action.description}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-blue-600">
        {action.hint}
        <ChevronRight className="h-3.5 w-3.5" />
      </span>
    </>
  );

  if (action.href) {
    return (
      <Link
        href={action.href}
        className="block rounded-[1.15rem] border-2 border-blue-200/80 bg-gradient-to-br from-blue-50/50 to-white p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full rounded-[1.15rem] border-2 border-blue-200/80 bg-gradient-to-br from-blue-50/50 to-white p-5 text-left shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
    >
      {content}
    </button>
  );
}

function MobilePrimaryAction({
  action,
  onScrollToCard,
  onGoToCard,
  recommendedLabel,
}: {
  action: WaitingIntelligence["primaryAction"];
  onScrollToCard: () => void;
  onGoToCard: () => void;
  recommendedLabel: string;
}) {
  const handleClick = () => {
    if (action.scrollTarget === "card") {
      onGoToCard();
      return;
    }
    onScrollToCard();
  };

  const inner = (
    <>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#007AFF]">
        <Zap className="h-[1.15rem] w-[1.15rem] text-white" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[17px] font-medium text-neutral-900">{action.title}</p>
        <p className="mt-0.5 text-[13px] text-[#8E8E93]">{action.hint}</p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-[#C7C7CC]" />
    </>
  );

  if (action.href) {
    return (
      <div>
        <p className="mb-2 px-1 text-[13px] font-medium uppercase tracking-wide text-[#8E8E93]">
          {recommendedLabel}
        </p>
        <div className="overflow-hidden rounded-[0.625rem] bg-white">
          <Link href={action.href} className="flex items-center gap-3 px-4 py-3.5 active:bg-[#E5E5EA]/60">
            {inner}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2 px-1 text-[13px] font-medium uppercase tracking-wide text-[#8E8E93]">
        {recommendedLabel}
      </p>
      <div className="overflow-hidden rounded-[0.625rem] bg-white">
        <button
          type="button"
          onClick={handleClick}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-[#E5E5EA]/60"
        >
          {inner}
        </button>
      </div>
    </div>
  );
}

function IosSectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3 px-1 md:mb-6 md:px-0 md:text-center">
      <h2 className="text-[13px] font-medium uppercase tracking-wide text-[#8E8E93] md:text-xl md:font-semibold md:normal-case md:tracking-[-0.02em] md:text-neutral-900 lg:text-[1.35rem]">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-0.5 text-[13px] text-[#8E8E93] md:mx-auto md:mt-2 md:max-w-xl md:text-[15px] md:leading-relaxed md:text-neutral-500">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

function FounderCardSpotlight({
  name,
  founderNumber,
  cardRef,
}: {
  name: string;
  founderNumber: number;
  cardRef: React.Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={cardRef}
      className="relative overflow-hidden rounded-[0.625rem] bg-white p-5 sm:rounded-[1.5rem] sm:border sm:border-black/[0.04] sm:bg-white/90 sm:p-10 sm:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] sm:backdrop-blur-sm md:p-12 lg:p-14"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_0%,rgba(59,130,246,0.08),transparent_70%)]"
        aria-hidden
      />
      <div className="relative mb-6 flex flex-wrap items-center justify-between gap-3 sm:mb-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-600/80">
            Your Founder Card
          </p>
          <p className="mt-1.5 text-[13px] text-neutral-500">Tap to flip · Premium member card</p>
        </div>
        <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 font-mono text-[11px] font-semibold text-neutral-600">
          {formatFounderNumber(founderNumber)}
        </span>
      </div>
      <div className="-mx-2 overflow-x-auto overflow-y-visible px-2 pb-2 [-webkit-overflow-scrolling:touch]">
        <div className="flex min-w-full justify-center">
          <FounderCard
            name={name}
            founderNumber={founderNumber}
            fixedSize
            showHint={false}
            className="py-2"
          />
        </div>
      </div>
      <p className="relative mt-4 text-center text-[11px] text-neutral-400 sm:hidden">
        Swipe to view full card →
      </p>
    </div>
  );
}

function LaunchTimeline({ phases }: { phases: WaitingIntelligence["launchPhases"] }) {
  return (
    <div className="space-y-0">
      {phases.map((phase, i) => {
        const isLast = i === phases.length - 1;
        return (
          <div key={phase.label} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast ? (
              <div
                className={cn(
                  "absolute left-[15px] top-8 h-[calc(100%-8px)] w-px",
                  phase.status === "complete" ? "bg-blue-200" : "bg-neutral-200",
                )}
                aria-hidden
              />
            ) : null}
            <div className="relative z-10 shrink-0">
              {phase.status === "complete" ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_0_0_4px_rgba(59,130,246,0.15)]">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              ) : phase.status === "active" ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white ring-2 ring-blue-500 ring-offset-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-600" />
                  </span>
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50">
                  <Circle className="h-3 w-3 text-neutral-300" fill="currentColor" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <h3
                  className={cn(
                    "text-[14px] font-semibold",
                    phase.status === "upcoming" ? "text-neutral-400" : "text-neutral-900",
                  )}
                >
                  {phase.label}
                </h3>
                {phase.status === "complete" ? (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                    Done
                  </span>
                ) : null}
                {phase.status === "active" ? (
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                    In progress
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-[13px] text-neutral-500">{phase.description}</p>
              {phase.status === "active" && phase.progress ? (
                <div className="mt-3">
                  <div className="mb-1.5 flex items-center justify-between text-[11px]">
                    <span className="font-medium text-neutral-500">Progress</span>
                    <span className="font-bold tabular-nums text-blue-600">{phase.progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${phase.progress}%` }}
                      transition={{ duration: 1.2, delay: 0.3, ease: EASE }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="relative overflow-hidden rounded-[1.35rem] border border-neutral-200/80 bg-neutral-900">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-4 w-4 text-blue-400" />
          <span className="text-[13px] font-medium text-white/90">Merchant Dashboard</span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/50">
          <Lock className="h-2.5 w-2.5" />
          Launch day
        </span>
      </div>
      <div className="relative p-4 sm:p-5">
        <div className="pointer-events-none select-none blur-[3px]">
          <div className="mb-4 grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { icon: ShoppingBag, label: "Orders", val: "24" },
              { icon: TrendingUp, label: "Revenue", val: "4.2k" },
              { icon: BarChart3, label: "Conversion", val: "3.8%" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/[0.06] bg-white/[0.04] p-3"
              >
                <stat.icon className="mb-2 h-3.5 w-3.5 text-blue-400/70" />
                <p className="text-[10px] text-white/40">{stat.label}</p>
                <p className="text-sm font-semibold text-white/80">{stat.val}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: LayoutDashboard, label: "Overview" },
              { icon: Package, label: "Products" },
              { icon: CreditCard, label: "Orders" },
              { icon: Puzzle, label: "Apps" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-4"
              >
                <item.icon className="mb-2 h-4 w-4 text-white/30" />
                <span className="text-[10px] text-white/40">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900/40 px-6 text-center backdrop-blur-[1px]">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <Lock className="h-5 w-5 text-white/70" />
          </div>
          <p className="text-[15px] font-semibold text-white">Unlocks at launch</p>
          <p className="mt-1.5 max-w-[240px] text-[12px] leading-relaxed text-white/50">
            COD orders, products, analytics & more — ready when we go live.
          </p>
        </div>
      </div>
    </div>
  );
}

function FaqItem({ q, a, defaultOpen }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false);

  return (
    <div className="border-b border-[#E5E5EA] last:border-0 md:border-neutral-100">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left md:px-0 md:py-4"
      >
        <span className="text-[17px] font-normal text-neutral-900 md:text-[14px] md:font-medium">{q}</span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-[#C7C7CC] transition-transform duration-200 md:h-4 md:w-4 md:text-neutral-400",
            open && "rotate-180",
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-4 pb-3.5 text-[15px] leading-relaxed text-[#8E8E93] md:px-0 md:pb-4 md:text-[13px] md:text-neutral-500">
              {a}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function EarlyAccessContent({
  name,
  email,
  founderNumber,
  founderCount: initialFounderCount,
  joinedAt,
  isReturning = false,
  foundersJoinedRecently,
}: EarlyAccessContentProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { tab, setTab } = useFounderApp();
  const { locale, copy, isRtl } = useFounderFlowLocale();
  const w = copy.waiting;
  const [liveFounderCount, setLiveFounderCount] = useState(initialFounderCount);

  useEffect(() => {
    const refresh = async () => {
      try {
        const res = await fetch("/api/founder/waiting-status");
        if (!res.ok) return;
        const data = (await res.json()) as { founderCount?: number };
        if (data.founderCount != null) setLiveFounderCount(data.founderCount);
      } catch {
        /* ignore */
      }
    };

    const timer = window.setInterval(() => void refresh(), 90_000);
    return () => window.clearInterval(timer);
  }, []);

  const intelligence = useMemo(
    () =>
      buildWaitingIntelligence(
        {
          name,
          email,
          founderNumber,
          founderCount: liveFounderCount,
          foundersJoinedRecently,
          joinedAt: new Date(joinedAt),
          isReturning,
        },
        locale,
      ),
    [
      name,
      email,
      founderNumber,
      liveFounderCount,
      foundersJoinedRecently,
      joinedAt,
      isReturning,
      locale,
    ],
  );

  const spotsLeft = MAX_FOUNDERS - liveFounderCount;
  const communityPercent = Math.round((liveFounderCount / MAX_FOUNDERS) * 100);

  const scrollToCard = () => {
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const notificationStyles = {
    highlight: "md:border-amber-200/80 md:bg-amber-50/80 md:text-amber-900",
    info: "md:border-blue-200/80 md:bg-blue-50/80 md:text-blue-900",
    success: "md:border-emerald-200/80 md:bg-emerald-50/80 md:text-emerald-900",
  };

  const goToCard = () => setTab("card");

  const isGradientHeadline = intelligence.headline.includes(w.gradientHeadlineMarker);

  const mobileCardView = (
    <FounderCardMobileView>
      <FounderCardSpotlight name={name} founderNumber={founderNumber} cardRef={cardRef} />
    </FounderCardMobileView>
  );

  const mobileContactView = (
    <div className="md:hidden">
      <FounderContactPanel email={email} founderNumber={founderNumber} />
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-10 md:space-y-14 lg:space-y-20">
      {/* Mobile: Card tab */}
      {tab === "card" ? mobileCardView : null}

      {/* Mobile: Contact tab */}
      {tab === "contact" ? mobileContactView : null}

      {/* Home tab (mobile) + full page (desktop) */}
      <div className={cn(tab !== "home" && "hidden md:block")}>
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
        className="md:px-2 md:text-center"
      >
        <div className="md:hidden">
          <FounderMobileHeader
            title={
              isGradientHeadline
                ? "Your journey starts here"
                : intelligence.headline.replace(/[.!]$/, "")
            }
            subtitle={intelligence.subheadline}
          />
        </div>

        <FounderGlassBadges
          founderNumber={founderNumber}
          tierLabel={intelligence.founderTier.label}
          statusLabel={intelligence.statusPill}
          className="mb-5 hidden md:mb-8 md:flex"
        />
        <FounderGlassBadges
          founderNumber={founderNumber}
          tierLabel={intelligence.founderTier.label}
          statusLabel={intelligence.statusPill}
          className="mb-4 md:hidden"
        />

        <h1 className="hidden text-[2rem] font-semibold leading-[1.15] tracking-[-0.04em] text-neutral-900 sm:text-[2.75rem] md:mt-2 md:block lg:text-[3rem] lg:leading-[1.08]">
          {isGradientHeadline ? (
            <>
              Your Ettajer journey
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                starts here.
              </span>
            </>
          ) : (
            intelligence.headline
          )}
        </h1>
        <p className="mx-auto mt-4 hidden max-w-2xl text-[15px] leading-relaxed text-neutral-500 sm:text-base md:mt-6 md:block md:text-[17px] md:leading-[1.65]">
          {intelligence.subheadline}
        </p>

        <div
          className={cn(
            "mt-5 rounded-[0.625rem] bg-white px-4 py-3.5 text-[15px] leading-snug text-[#8E8E93] md:mx-auto md:mt-8 md:max-w-xl md:rounded-xl md:border md:px-5 md:py-4 md:text-[14px] md:leading-relaxed",
            notificationStyles[intelligence.notification.tone],
            "md:block",
          )}
        >
          {intelligence.notification.message}
        </div>
      </motion.section>

      {/* Smart insights */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06, duration: 0.5 }}
      >
        <SmartInsightsPanel insights={intelligence.insights} w={w} />
      </motion.section>

      {/* Mobile primary action */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="lg:hidden"
      >
        <MobilePrimaryAction
          action={intelligence.primaryAction}
          onScrollToCard={scrollToCard}
          onGoToCard={goToCard}
          recommendedLabel={w.recommended}
        />
      </motion.div>

      {/* Primary action + stats */}
      <div className="grid gap-3 lg:grid-cols-3 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="hidden lg:col-span-1 lg:block"
        >
          <PrimaryActionCard
            action={intelligence.primaryAction}
            onScrollToCard={scrollToCard}
            onGoToCard={goToCard}
            recommendedLabel={w.recommendedForYou}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="grid grid-cols-2 gap-2 sm:gap-3 lg:col-span-2 lg:gap-4"
        >
          <StatCard
            icon={Target}
            label={w.platformReady}
            value={`${intelligence.launchProgress}%`}
            sub={intelligence.launchPhaseLabel}
            accent="from-blue-500/10 to-indigo-500/5"
          />
          <StatCard
            icon={Calendar}
            label={w.estimatedLaunch}
            value={intelligence.estimatedLaunch}
            sub={w.dayAsFounder(intelligence.daysAsFounder)}
            accent="from-violet-500/10 to-purple-500/5"
          />
          <StatCard
            icon={Users}
            label={w.community}
            value={w.foundersOf(liveFounderCount, MAX_FOUNDERS)}
            sub={intelligence.rankLabel}
            accent="from-emerald-500/10 to-teal-500/5"
          />
          <StatCard
            icon={Sparkles}
            label={w.yourRank}
            value={formatFounderNumberShort(founderNumber)}
            sub={w.spotsLeftEmail(spotsLeft, maskEmail(email))}
            accent="from-amber-500/10 to-orange-500/5"
          />
        </motion.div>
      </div>

      {/* Community momentum */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14, duration: 0.5 }}
        className="overflow-hidden rounded-[0.625rem] bg-white px-4 py-3.5 sm:rounded-[1.15rem] sm:border sm:border-black/[0.04] sm:bg-white/80 sm:px-5 sm:py-4 sm:shadow-sm sm:backdrop-blur-sm"
      >
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <span className="font-medium text-neutral-600">{intelligence.momentumMessage}</span>
          <span className="font-semibold tabular-nums text-neutral-900">
            {w.foundersOf(liveFounderCount, MAX_FOUNDERS)}
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-neutral-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${communityPercent}%` }}
            transition={{ duration: 1, delay: 0.2, ease: EASE }}
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500"
          />
        </div>
      </motion.div>

      {/* Founder card — desktop always; mobile uses Card tab */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16, duration: 0.55 }}
        className="hidden md:block"
      >
        <FounderCardSpotlight name={name} founderNumber={founderNumber} cardRef={cardRef} />
      </motion.section>

      {/* Timeline + dashboard */}
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="overflow-hidden rounded-[0.625rem] bg-white p-4 sm:rounded-[1.35rem] sm:border sm:border-black/[0.04] sm:bg-white/90 sm:p-8 sm:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] sm:backdrop-blur-sm"
        >
          <IosSectionHeader
            title={w.launchRoadmap}
            subtitle={w.launchRoadmapSubtitle(intelligence.launchPhaseLabel, intelligence.launchProgress)}
          />
          <LaunchTimeline phases={intelligence.launchPhases} />
          <div className="mt-5 flex items-start gap-3 rounded-[0.625rem] bg-[#007AFF]/8 px-4 py-3.5 sm:mt-6 sm:rounded-xl sm:border sm:border-blue-100/80 sm:bg-blue-50/50">
            <Bell className="mt-0.5 h-4 w-4 shrink-0 text-[#007AFF] sm:text-blue-600" />
            <p className="text-[15px] leading-snug text-neutral-700 sm:text-[13px] sm:leading-relaxed sm:text-blue-900/80">
              Launch target: <strong>{intelligence.estimatedLaunch}</strong>. We&apos;ll email you
              at {maskEmail(email)} — no action needed.
            </p>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <IosSectionHeader
            title={w.whatsWaiting}
            subtitle={w.whatsWaitingSubtitle}
          />
          <DashboardPreview />
        </motion.section>
      </div>

      {/* Benefits */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22 }}
      >
        <IosSectionHeader
          title={w.founderBenefits}
          subtitle={w.founderBenefitsSubtitle(intelligence.founderTier.label)}
        />
        <div className="overflow-hidden rounded-[0.625rem] bg-white md:hidden">
          {w.benefits.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 + i * 0.04 }}
              className="flex items-center gap-3 border-b border-[#E5E5EA] px-4 py-3.5 last:border-0"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#007AFF]/10">
                {(() => {
                  const Icon = BENEFIT_ICONS[i] ?? BadgeCheck;
                  return <Icon className="h-4 w-4 text-[#007AFF]" strokeWidth={2} />;
                })()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[17px] text-neutral-900">{benefit.title}</p>
                <p className="text-[13px] text-[#8E8E93]">{benefit.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="hidden gap-4 md:grid sm:grid-cols-2">
          {w.benefits.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 + i * 0.05 }}
              className="group relative overflow-hidden rounded-[1.25rem] border border-black/[0.04] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-6"
            >
              <div
                className={cn(
                  "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60",
                  BENEFIT_ACCENTS[i] ?? BENEFIT_ACCENTS[0],
                )}
                aria-hidden
              />
              <div className="relative flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/80 bg-white/90 text-blue-600 shadow-sm">
                  {(() => {
                    const Icon = BENEFIT_ICONS[i] ?? BadgeCheck;
                    return <Icon className="h-5 w-5" />;
                  })()}
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">{benefit.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Quick links — desktop only; mobile uses bottom nav */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26 }}
        className="hidden flex-wrap justify-center gap-3 md:flex"
      >
        <Link
          href="/help"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-[13px] font-medium text-neutral-800 shadow-sm hover:border-neutral-300"
        >
          <MessageCircle className="h-4 w-4" />
          {w.helpCenter}
        </Link>
        <Link
          href="/contact"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-[13px] font-medium text-neutral-800 shadow-sm hover:border-neutral-300"
        >
          <Headphones className="h-4 w-4" />
          {w.contactSupport}
        </Link>
        <button
          type="button"
          onClick={scrollToCard}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-neutral-900 px-4 text-[13px] font-medium text-white hover:bg-neutral-800"
        >
          <Sparkles className="h-4 w-4" />
          {w.viewFounderCard}
        </button>
      </motion.section>

      {/* FAQ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <IosSectionHeader
          title={w.faqTitle}
          subtitle={w.faqSubtitle(founderNumber)}
        />
        <div className="overflow-hidden rounded-[0.625rem] bg-white sm:rounded-[1.35rem] sm:border sm:border-black/[0.04] sm:bg-white/90 sm:shadow-sm sm:backdrop-blur-sm">
          <div className="divide-y-0 md:divide-y md:divide-neutral-100 md:px-8 lg:px-10">
            {intelligence.faq.map((item, i) => (
              <FaqItem key={item.q} q={item.q} a={item.a} defaultOpen={i === 0} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* Bottom CTA */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.34 }}
        className="overflow-hidden rounded-[0.625rem] bg-white px-5 py-6 text-center sm:rounded-[1.35rem] sm:border sm:border-blue-100/80 sm:bg-gradient-to-br sm:from-blue-50/80 sm:via-white sm:to-indigo-50/50 sm:px-10 sm:py-8 md:py-12 lg:px-14"
      >
        <p className="text-[13px] font-medium uppercase tracking-wide text-[#007AFF] sm:text-[11px] sm:font-semibold sm:tracking-[0.16em] sm:text-blue-600/80">
          {intelligence.founderTier.label}
        </p>
        <h2 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.02em] text-neutral-900 sm:text-2xl">
          Launch: {intelligence.estimatedLaunch}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-[#8E8E93] sm:text-[14px] sm:text-neutral-500">
          {intelligence.notification.message}
        </p>
        <p className="mx-auto mt-2 text-[12px] text-neutral-400">
          Member since {formatJoinedDate(joinedAt, locale)}
        </p>
      </motion.section>
      </div>
    </div>
  );
}
