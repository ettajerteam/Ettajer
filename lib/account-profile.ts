import { prisma } from "@/lib/db";
import type { StoredMerchantPlan } from "@/lib/merchant-plan";
import { normalizeStoredPlan } from "@/lib/merchant-plan";

export type AccountProfile = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  marketingEmails: boolean;
  founderNumber: number | null;
  plan: StoredMerchantPlan;
  hasPassword: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};

export async function loadUserPlan(userId: string): Promise<StoredMerchantPlan> {
  try {
    const rows = await prisma.$queryRaw<Array<{ plan: string | null }>>`
      SELECT plan FROM "User" WHERE id = ${userId} LIMIT 1
    `;
    return normalizeStoredPlan(rows[0]?.plan);
  } catch {
    return "free";
  }
}

export function serializeAccountProfile(user: {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  marketingEmails: boolean;
  founderNumber: number | null;
  plan?: string | null;
  passwordHash: string | null;
  createdAt: Date;
  lastLoginAt: Date | null;
}): AccountProfile {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    marketingEmails: user.marketingEmails,
    founderNumber: user.founderNumber,
    plan: normalizeStoredPlan(user.plan),
    hasPassword: Boolean(user.passwordHash),
    createdAt: user.createdAt.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
  };
}