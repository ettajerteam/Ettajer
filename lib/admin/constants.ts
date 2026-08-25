export const USER_ROLE = {
  MERCHANT: "merchant",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export const SUPPORT_MESSAGE_STATUS = {
  NEW: "new",
  REVIEWING: "reviewing",
  READ: "read",
  ARCHIVED: "archived",
  RESOLVED: "resolved",
} as const;

export const SUPPORT_MESSAGE_DIRECTION = {
  INBOUND: "inbound",
  OUTBOUND: "outbound",
} as const;

/** Display name stored on outbound Ettajer replies / welcome messages. */
export const SUPPORT_TEAM_NAME = "Ettajer team";

export function isSupportTeamName(name: string | null | undefined): boolean {
  return (name ?? "").trim().toLowerCase() === SUPPORT_TEAM_NAME.toLowerCase();
}

/** Default platform owner — also set via ADMIN_EMAILS env */
export const DEFAULT_ADMIN_EMAIL = "ettajerteam@gmail.com";
