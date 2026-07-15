import { prisma } from "@/lib/db";
import { normalizeEmail } from "@/lib/password-reset";

export const AUTH_SECURITY = {
  maxFailedLoginAttempts: 10,
  lockoutMinutes: 15,
  forgotPasswordMaxPerHour: 5,
  resetPasswordMaxPerHour: 10,
  signupMaxPerHour: 10,
} as const;

export type AuthAction = "login" | "forgot_password" | "reset_password" | "signup";

export type LoginFailureReason =
  | "invalid_credentials"
  | "no_password"
  | "account_locked"
  | "rate_limited"
  | "success";

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    "unknown"
  );
}

export function getUserAgent(request: Request): string | null {
  return request.headers.get("user-agent");
}

interface SecurityUserRow {
  id: string;
  email: string;
  passwordHash: string | null;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
}

export async function getSecurityUser(
  email: string,
): Promise<SecurityUserRow | null> {
  const normalized = normalizeEmail(email);
  const rows = (await prisma.$queryRaw<SecurityUserRow[]>`
    SELECT
      "id",
      "email",
      "passwordHash",
      "failedLoginAttempts",
      "lockedUntil"
    FROM "User"
    WHERE "email" = ${normalized}
    LIMIT 1
  `) as SecurityUserRow[];

  return rows[0] ?? null;
}

export function isAccountLocked(user: SecurityUserRow): boolean {
  if (!user.lockedUntil) return false;
  return user.lockedUntil.getTime() > Date.now();
}

export function getLockoutRemainingMinutes(user: SecurityUserRow): number {
  if (!user.lockedUntil) return 0;
  const remainingMs = user.lockedUntil.getTime() - Date.now();
  if (remainingMs <= 0) return 0;
  return Math.ceil(remainingMs / 60000);
}

export async function recordAuthEvent(params: {
  email: string;
  action: AuthAction;
  success: boolean;
  reason?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  userId?: string | null;
}): Promise<void> {
  const normalized = normalizeEmail(params.email);

  try {
    await prisma.loginAttempt.create({
      data: {
        email: normalized,
        action: params.action,
        success: params.success,
        reason: params.reason,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
        userId: params.userId ?? null,
      },
    });
  } catch (error) {
    console.error("Failed to record auth event:", error);
  }
}

export async function isRateLimited(params: {
  email: string;
  action: AuthAction;
  maxAttempts: number;
  windowMs: number;
}): Promise<boolean> {
  const since = new Date(Date.now() - params.windowMs);
  const count = await prisma.loginAttempt.count({
    where: {
      email: normalizeEmail(params.email),
      action: params.action,
      createdAt: { gte: since },
    },
  });

  return count >= params.maxAttempts;
}

export async function recordFailedLogin(email: string): Promise<void> {
  const normalized = normalizeEmail(email);
  const user = await getSecurityUser(normalized);
  if (!user) return;

  const attempts = user.failedLoginAttempts + 1;
  const shouldLock = attempts >= AUTH_SECURITY.maxFailedLoginAttempts;
  const lockedUntil = shouldLock
    ? new Date(Date.now() + AUTH_SECURITY.lockoutMinutes * 60 * 1000)
    : null;

  await prisma.$executeRaw`
    UPDATE "User"
    SET
      "failedLoginAttempts" = ${attempts},
      "lockedUntil" = ${lockedUntil},
      "updatedAt" = ${new Date()}
    WHERE "email" = ${normalized}
  `;
}

export async function clearLoginLockout(email: string): Promise<void> {
  const normalized = normalizeEmail(email);

  await prisma.$executeRaw`
    UPDATE "User"
    SET
      "failedLoginAttempts" = 0,
      "lockedUntil" = NULL,
      "updatedAt" = ${new Date()}
    WHERE "email" = ${normalized}
  `;
}

export async function recordSuccessfulLogin(
  email: string,
  ipAddress?: string | null,
): Promise<void> {
  const normalized = normalizeEmail(email);
  const now = new Date();

  await prisma.$executeRaw`
    UPDATE "User"
    SET
      "failedLoginAttempts" = 0,
      "lockedUntil" = NULL,
      "lastLoginAt" = ${now},
      "lastLoginIp" = ${ipAddress ?? null},
      "updatedAt" = ${now}
    WHERE "email" = ${normalized}
  `;
}

export async function recordPasswordChanged(email: string): Promise<void> {
  const normalized = normalizeEmail(email);
  const now = new Date();

  await prisma.$executeRaw`
    UPDATE "User"
    SET
      "passwordChangedAt" = ${now},
      "failedLoginAttempts" = 0,
      "lockedUntil" = NULL,
      "updatedAt" = ${now}
    WHERE "email" = ${normalized}
  `;
}
