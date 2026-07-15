import { prisma } from "@/lib/db";
import type { LandingLocale } from "@/lib/landing/landing-i18n";
import {
  MAX_FOUNDERS,
  formatFounderNumber,
  formatFounderNumberShort,
} from "@/lib/founder/constants";
import { getWaitingIntelligenceCopy } from "@/lib/founder/founder-flow-i18n";

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

function getLaunchTargetDate(): Date {
  const raw = process.env.ETTAJER_LAUNCH_TARGET?.trim();
  if (raw) {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date("2026-08-01T00:00:00.000Z");
}

function getBaseLaunchProgress(): number {
  const raw = Number(process.env.ETTAJER_LAUNCH_PROGRESS ?? 75);
  return Number.isFinite(raw) ? Math.min(95, Math.max(50, raw)) : 75;
}

export function getFounderTier(
  founderNumber: number,
  locale: LandingLocale = "en",
): WaitingIntelligence["founderTier"] {
  return getWaitingIntelligenceCopy(locale).getFounderTier(founderNumber);
}

export function computeLaunchProgress(founderCount: number): number {
  const base = getBaseLaunchProgress();
  const target = getLaunchTargetDate();
  const programStart = new Date("2026-01-01T00:00:00.000Z");
  const now = new Date();

  const timelineSpan = target.getTime() - programStart.getTime();
  const elapsed = now.getTime() - programStart.getTime();
  const timeProgress =
    timelineSpan > 0 ? Math.round((elapsed / timelineSpan) * 100) : base;

  const communityBoost = Math.round((founderCount / MAX_FOUNDERS) * 8);
  const blended = Math.round((base + timeProgress + communityBoost) / 3);

  return Math.min(94, Math.max(base, blended));
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
