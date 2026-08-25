import { prisma } from "@/lib/db";

/** Promotional first month at 0 DH — ends 30 days after signup. */
export const FREE_TRIAL_DAYS = 30;

const REAL_USER = {
  NOT: { email: { endsWith: "@example.com" as const } },
};

export type UserStatRow = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  status: string;
  role: string;
  plan: string;
  /** Founder card assigned when founderNumber is set. */
  hasCard: boolean;
  founderNumber: number | null;
  emailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  trialEndedAt: Date;
  daysPastTrial: number;
  storeCount: number;
  productCount: number;
  orderCount: number;
};

export type PlatformUserStats = {
  totals: {
    users: number;
    active: number;
    waiting: number;
    withCard: number;
    withoutCard: number;
    freePlan: number;
    paidPlan: number;
    trialActive: number;
    trialEnded: number;
    trialEndedWithCard: number;
    trialEndedWithoutCard: number;
    new7d: number;
  };
  byPlan: { plan: string; count: number }[];
  trialEndedUsers: UserStatRow[];
};

function trialEndedAt(createdAt: Date): Date {
  return new Date(
    createdAt.getTime() + FREE_TRIAL_DAYS * 24 * 60 * 60 * 1000,
  );
}

function ageDaysPast(from: Date, now: number): number {
  return Math.max(
    0,
    Math.round(((now - from.getTime()) / 86400000) * 10) / 10,
  );
}

/**
 * Platform user statistics index: plan mix, founder-card coverage,
 * and merchants whose first free trial month has ended.
 */
export async function getPlatformUserStats(): Promise<PlatformUserStats> {
  const now = Date.now();
  const trialCutoff = new Date(now - FREE_TRIAL_DAYS * 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

  const users = await prisma.user.findMany({
    where: REAL_USER,
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      status: true,
      role: true,
      plan: true,
      founderNumber: true,
      emailVerified: true,
      lastLoginAt: true,
      createdAt: true,
      stores: {
        select: {
          _count: { select: { products: true, orders: true } },
        },
      },
      _count: { select: { stores: true } },
    },
  });

  const planCounts = new Map<string, number>();
  let active = 0;
  let waiting = 0;
  let withCard = 0;
  let freePlan = 0;
  let paidPlan = 0;
  let trialActive = 0;
  let trialEnded = 0;
  let trialEndedWithCard = 0;
  let trialEndedWithoutCard = 0;
  let new7d = 0;

  const trialEndedUsers: UserStatRow[] = [];

  for (const user of users) {
    const hasCard = user.founderNumber != null;
    const plan = user.plan || "free";
    planCounts.set(plan, (planCounts.get(plan) ?? 0) + 1);

    if (user.status === "active") active += 1;
    if (user.status === "waiting") waiting += 1;
    if (hasCard) withCard += 1;
    if (plan === "free") freePlan += 1;
    else paidPlan += 1;
    if (user.createdAt >= weekAgo) new7d += 1;

    const ended = user.createdAt <= trialCutoff;
    if (ended) {
      trialEnded += 1;
      if (hasCard) trialEndedWithCard += 1;
      else trialEndedWithoutCard += 1;

      const endedAt = trialEndedAt(user.createdAt);
      trialEndedUsers.push({
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        status: user.status,
        role: user.role,
        plan,
        hasCard,
        founderNumber: user.founderNumber,
        emailVerified: Boolean(user.emailVerified),
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        trialEndedAt: endedAt,
        daysPastTrial: ageDaysPast(endedAt, now),
        storeCount: user._count.stores,
        productCount: user.stores.reduce((n, s) => n + s._count.products, 0),
        orderCount: user.stores.reduce((n, s) => n + s._count.orders, 0),
      });
    } else {
      trialActive += 1;
    }
  }

  // Newest trial endings first (most recently left free month)
  trialEndedUsers.sort(
    (a, b) => b.trialEndedAt.getTime() - a.trialEndedAt.getTime(),
  );

  const byPlan = [...planCounts.entries()]
    .map(([plan, count]) => ({ plan, count }))
    .sort((a, b) => b.count - a.count || a.plan.localeCompare(b.plan));

  return {
    totals: {
      users: users.length,
      active,
      waiting,
      withCard,
      withoutCard: users.length - withCard,
      freePlan,
      paidPlan,
      trialActive,
      trialEnded,
      trialEndedWithCard,
      trialEndedWithoutCard,
      new7d,
    },
    byPlan,
    trialEndedUsers,
  };
}
