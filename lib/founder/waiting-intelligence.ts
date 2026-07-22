import { prisma } from "@/lib/db";
import type { LandingLocale } from "@/lib/landing/landing-i18n";
import {
  MAX_FOUNDERS,
  formatFounderNumber,
  formatFounderNumberShort,
} from "@/lib/founder/constants";
import { getWaitingIntelligenceCopy } from "@/lib/founder/founder-flow-i18n";
import {
  getLaunchTargetDate,
  getMsUntilLaunch,
  isPlatformLaunched,
} from "@/lib/founder/launch-date";

export {
  getLaunchTargetDate,
  getMsUntilLaunch,
  isPlatformLaunched,
};

export type {
  FounderTierId,
  CommunityMomentum,
  WaitingActionId,
} from "@/lib/founder/founder-flow-i18n";

export type WaitingInsight = {
  id: string;
  title: string;
  body: string;
};

export type WaitingPrimaryAction = {
  id: import("@/lib/founder/founder-flow-i18n").WaitingActionId;
  title: string;
  description: string;
  hint: string;
  href?: string;
  scrollTarget?: "card";
};

export interface WaitingIntelligence {
  headline: string;
  subheadline: string;
  statusPill: string;
  daysAsFounder: number;
  founderTier: {
    id: import("@/lib/founder/founder-flow-i18n").FounderTierId;
    label: string;
    description: string;
  };
  rankLabel: string;
  launchProgress: number;
  launchPhaseLabel: string;
  estimatedLaunch: string;
  foundersJoinedRecently: number;
  spotsLeft: number;
  communityMomentum: import("@/lib/founder/founder-flow-i18n").CommunityMomentum;
  momentumMessage: string;
  notification: {
    tone: "info" | "success" | "highlight";
    message: string;
  };
  primaryAction: WaitingPrimaryAction;
  insights: WaitingInsight[];
  faq: { q: string; a: string }[];
  launchPhases: {
    label: string;
    description: string;
    status: "complete" | "active" | "upcoming";
    progress?: number;
  }[];
}

function getBaseLaunchProgress(): number {
  // Beta testing is live — never show the old "Platform development / 75%" state.
  // NEXT_PUBLIC_ so the client early-access UI cannot fall back to a stale default.
  const raw = Number(
    process.env.NEXT_PUBLIC_ETTAJER_LAUNCH_PROGRESS ??
      process.env.ETTAJER_LAUNCH_PROGRESS ??
      90,
  );
  if (!Number.isFinite(raw)) return 90;
  return Math.min(94, Math.max(90, raw));
}

/** Always ≥90 so roadmap shows development Done + Beta testing Now. */
export function computeLaunchProgress(_founderCount: number): number {
  return getBaseLaunchProgress();
}

export function getFounderTier(
  founderNumber: number,
  locale: LandingLocale = "en",
): WaitingIntelligence["founderTier"] {
  return getWaitingIntelligenceCopy(locale).getFounderTier(founderNumber);
}

export function formatEstimatedLaunch(locale: LandingLocale = "en"): string {
  return getWaitingIntelligenceCopy(locale).formatEstimatedLaunch(getLaunchTargetDate());
}

export function getCommunityMomentum(recentJoins: number) {
  if (recentJoins >= 5) return "high" as const;
  if (recentJoins >= 2) return "steady" as const;
  return "quiet" as const;
}

export async function getRecentFounderCount(days = 7): Promise<number> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return prisma.user.count({
    where: {
      founderNumber: { not: null },
      createdAt: { gte: since },
    },
  });
}

export function buildWaitingIntelligence(
  params: {
    name: string;
    email: string;
    founderNumber: number;
    founderCount: number;
    foundersJoinedRecently: number;
    joinedAt: Date;
    isReturning: boolean;
  },
  locale: LandingLocale = "en",
): WaitingIntelligence {
  const t = getWaitingIntelligenceCopy(locale);
  const firstName = params.name.split(" ")[0] ?? params.name;
  const daysAsFounder = Math.max(
    1,
    Math.floor((Date.now() - params.joinedAt.getTime()) / (1000 * 60 * 60 * 24)),
  );
  const spotsLeft = MAX_FOUNDERS - params.founderCount;
  const founderTier = t.getFounderTier(params.founderNumber);
  const launchProgress = computeLaunchProgress(params.founderCount);
  const estimatedLaunch = t.formatEstimatedLaunch(getLaunchTargetDate());
  const momentum = getCommunityMomentum(params.foundersJoinedRecently);
  const momentumMessage = t.buildMomentumMessage(
    momentum,
    params.foundersJoinedRecently,
    spotsLeft,
  );

  return {
    headline: t.buildHeadline({
      firstName,
      founderNumber: params.founderNumber,
      isReturning: params.isReturning,
    }),
    subheadline: t.buildSubheadline({
      firstName,
      founderNumber: params.founderNumber,
      isReturning: params.isReturning,
      daysAsFounder,
      launchProgress,
      estimatedLaunch,
    }),
    statusPill: t.buildStatusPill({
      isReturning: params.isReturning,
      founderNumber: params.founderNumber,
    }),
    daysAsFounder,
    founderTier,
    rankLabel: t.buildRankLabel(params.founderNumber),
    launchProgress,
    launchPhaseLabel: t.launchPhaseLabel(launchProgress),
    estimatedLaunch,
    foundersJoinedRecently: params.foundersJoinedRecently,
    spotsLeft,
    communityMomentum: momentum,
    momentumMessage,
    notification: t.buildNotification({
      founderNumber: params.founderNumber,
      spotsLeft,
      estimatedLaunch,
    }),
    primaryAction: t.pickPrimaryAction({
      daysAsFounder,
      isReturning: params.isReturning,
      founderNumber: params.founderNumber,
    }),
    insights: t.buildInsights({
      firstName,
      founderNumber: params.founderNumber,
      founderTier,
      daysAsFounder,
      launchProgress,
      estimatedLaunch,
      momentumMessage,
      founderCount: params.founderCount,
    }),
    faq: t.buildPersonalizedFaq(params.founderNumber, estimatedLaunch, params.email),
    launchPhases: t.buildLaunchPhases(launchProgress),
  };
}

export async function getWaitingPageIntelligence(
  params: {
    name: string;
    email: string;
    founderNumber: number;
    founderCount: number;
    joinedAt: Date;
    isReturning: boolean;
  },
  locale: LandingLocale = "en",
): Promise<WaitingIntelligence> {
  const foundersJoinedRecently = await getRecentFounderCount(7);

  return buildWaitingIntelligence(
    {
      ...params,
      foundersJoinedRecently,
    },
    locale,
  );
}

export { formatFounderNumber, formatFounderNumberShort, MAX_FOUNDERS };
