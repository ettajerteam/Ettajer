import { prisma } from "@/lib/db";
import {
  MAX_FOUNDERS,
  USER_STATUS,
  type UserStatus,
  formatFounderNumber,
  formatFounderNumberShort,
  buildFounderCardId,
} from "@/lib/founder/constants";

export {
  MAX_FOUNDERS,
  USER_STATUS,
  type UserStatus,
  formatFounderNumber,
  formatFounderNumberShort,
  buildFounderCardId,
};

export async function getFounderCount(): Promise<number> {
  return prisma.user.count({
    where: { founderNumber: { not: null } },
  });
}

export async function isFounderSlotsFull(): Promise<boolean> {
  return (await getFounderCount()) >= MAX_FOUNDERS;
}

/**
 * Atomically assigns the next founder number to a user.
 * Returns null once MAX_FOUNDERS cards have been issued — no more cards after that.
 */
export async function assignFounderNumber(userId: string): Promise<number | null> {
  return prisma.$transaction(async (tx) => {
    const issued = await tx.user.count({
      where: { founderNumber: { not: null } },
    });
    if (issued >= MAX_FOUNDERS) {
      return null;
    }

    const aggregate = await tx.user.aggregate({
      _max: { founderNumber: true },
      where: { founderNumber: { not: null } },
    });

    const next = (aggregate._max.founderNumber ?? 0) + 1;
    if (next > MAX_FOUNDERS) {
      return null;
    }

    await tx.user.update({
      where: { id: userId },
      data: {
        founderNumber: next,
        status: USER_STATUS.ACTIVE,
      },
    });

    return next;
  });
}

export async function getUserFounderProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      founderNumber: true,
      emailVerified: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });
}
