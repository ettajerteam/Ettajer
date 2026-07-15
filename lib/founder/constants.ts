export const MAX_FOUNDERS = 100;

export const USER_STATUS = {
  WAITING: "waiting",
  ACTIVE: "active",
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export function formatFounderNumber(n: number): string {
  return `Founder #${String(n).padStart(4, "0")}`;
}

export function formatFounderNumberShort(n: number): string {
  return `#${String(n).padStart(4, "0")}`;
}

export function buildFounderCardId(founderNumber: number): string {
  return `ETJR-2026-${String(founderNumber).padStart(4, "0")}`;
}
