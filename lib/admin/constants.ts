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

/** Default platform owner — also set via ADMIN_EMAILS env */
export const DEFAULT_ADMIN_EMAIL = "ettajerteam@gmail.com";
