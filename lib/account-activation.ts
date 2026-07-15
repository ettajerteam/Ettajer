import crypto from "crypto";
import { prisma } from "@/lib/db";
import { normalizeEmail } from "@/lib/password-reset";

const ACTIVATION_IDENTIFIER_PREFIX = "account-activation:";
const RESEND_META_PREFIX = "activation-resend:";
const ATTEMPTS_IDENTIFIER_PREFIX = "activation-attempts:";
const CODE_EXPIRY_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

/** Seconds to wait before each resend (grows with every resend). */
const RESEND_COOLDOWN_SECONDS = [60, 90, 120, 180, 300, 600] as const;

export function resendMetaIdentifier(email: string): string {
  return `${RESEND_META_PREFIX}${normalizeEmail(email)}`;
}

function getCooldownSeconds(resendCount: number): number {
  const index = Math.min(resendCount, RESEND_COOLDOWN_SECONDS.length - 1);
  return RESEND_COOLDOWN_SECONDS[index];
}

/** Globally-unique token values for metadata rows (token column is unique in DB). */
function metaTokenValue(identifier: string, value: string | number): string {
  return `${identifier}::${value}`;
}

function parseMetaCount(token: string): number {
  const raw = token.includes("::") ? (token.split("::").pop() ?? "0") : token;
  return Number.parseInt(raw, 10) || 0;
}

export async function initResendCooldown(email: string): Promise<void> {
  const identifier = resendMetaIdentifier(email);
  const cooldownSec = getCooldownSeconds(0);
  const expires = new Date(Date.now() + cooldownSec * 1000);

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: { identifier, token: metaTokenValue(identifier, 0), expires },
  });
}

export async function getResendStatus(email: string): Promise<{
  canResend: boolean;
  secondsRemaining: number;
  resendCount: number;
  nextCooldownSeconds: number;
}> {
  const identifier = resendMetaIdentifier(email);
  const record = await prisma.verificationToken.findFirst({
    where: { identifier },
    orderBy: { expires: "desc" },
  });

  if (!record) {
    return {
      canResend: true,
      secondsRemaining: 0,
      resendCount: 0,
      nextCooldownSeconds: getCooldownSeconds(0),
    };
  }

  const resendCount = parseMetaCount(record.token);
  const remainingMs = record.expires.getTime() - Date.now();

  if (remainingMs <= 0) {
    return {
      canResend: true,
      secondsRemaining: 0,
      resendCount,
      nextCooldownSeconds: getCooldownSeconds(resendCount),
    };
  }

  return {
    canResend: false,
    secondsRemaining: Math.ceil(remainingMs / 1000),
    resendCount,
    nextCooldownSeconds: getCooldownSeconds(resendCount),
  };
}

export async function canResendActivationCode(email: string): Promise<{
  allowed: boolean;
  secondsRemaining: number;
  resendCount: number;
}> {
  const status = await getResendStatus(email);
  return {
    allowed: status.canResend,
    secondsRemaining: status.secondsRemaining,
    resendCount: status.resendCount,
  };
}

export async function recordActivationResend(email: string): Promise<{
  resendCount: number;
  nextCooldownSeconds: number;
}> {
  const normalized = normalizeEmail(email);
  const identifier = resendMetaIdentifier(normalized);
  const existing = await prisma.verificationToken.findFirst({
    where: { identifier },
  });

  const currentCount = existing ? parseMetaCount(existing.token) : 0;
  const newCount = currentCount + 1;
  const cooldownSec = getCooldownSeconds(newCount);
  const expires = new Date(Date.now() + cooldownSec * 1000);

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: { identifier, token: metaTokenValue(identifier, newCount), expires },
  });

  return { resendCount: newCount, nextCooldownSeconds: cooldownSec };
}

export async function clearActivationResendMeta(email: string): Promise<void> {
  await prisma.verificationToken.deleteMany({
    where: { identifier: resendMetaIdentifier(email) },
  });
}

export function activationIdentifier(email: string): string {
  return `${ACTIVATION_IDENTIFIER_PREFIX}${normalizeEmail(email)}`;
}

function attemptsIdentifier(email: string): string {
  return `${ATTEMPTS_IDENTIFIER_PREFIX}${normalizeEmail(email)}`;
}

export async function getActivationAttempts(email: string): Promise<number> {
  const record = await prisma.verificationToken.findFirst({
    where: { identifier: attemptsIdentifier(email) },
  });
  if (!record || record.expires < new Date()) return 0;
  return parseMetaCount(record.token);
}

export async function isActivationBlocked(email: string): Promise<boolean> {
  return (await getActivationAttempts(email)) >= MAX_ATTEMPTS;
}

export async function clearActivationAttempts(email: string): Promise<void> {
  await prisma.verificationToken.deleteMany({
    where: { identifier: attemptsIdentifier(email) },
  });
}

export async function recordFailedActivationAttempt(email: string): Promise<{
  attempts: number;
  remaining: number;
  blocked: boolean;
}> {
  const normalized = normalizeEmail(email);
  const identifier = attemptsIdentifier(normalized);
  const existing = await prisma.verificationToken.findFirst({
    where: { identifier },
  });

  const current =
    existing && existing.expires >= new Date()
      ? parseMetaCount(existing.token)
      : 0;
  const attempts = current + 1;
  const expires = new Date(Date.now() + CODE_EXPIRY_MS);

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: { identifier, token: metaTokenValue(identifier, attempts), expires },
  });

  const remaining = Math.max(0, MAX_ATTEMPTS - attempts);
  return {
    attempts,
    remaining,
    blocked: attempts >= MAX_ATTEMPTS,
  };
}

export function generateActivationCode(): string {
  return String(crypto.randomInt(100000, 1000000));
}

export function hashActivationCode(code: string): string {
  return crypto.createHash("sha256").update(code.trim()).digest("hex");
}

export async function issueActivationCode(email: string): Promise<string | null> {
  const normalized = normalizeEmail(email);
  const user = await prisma.user.findUnique({
    where: { email: normalized },
    select: { id: true, emailVerified: true },
  });

  if (!user || user.emailVerified) return null;

  const code = generateActivationCode();
  const tokenHash = hashActivationCode(code);
  const identifier = activationIdentifier(normalized);
  const expires = new Date(Date.now() + CODE_EXPIRY_MS);

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: { identifier, token: tokenHash, expires },
  });

  await clearActivationAttempts(normalized);

  return code;
}

export async function validateActivationCode(
  email: string,
  code: string,
): Promise<{ valid: boolean; reason?: "invalid" | "expired" | "already_active" }> {
  const normalized = normalizeEmail(email);
  const user = await prisma.user.findUnique({
    where: { email: normalized },
    select: { emailVerified: true },
  });

  if (!user) return { valid: false, reason: "invalid" };
  if (user.emailVerified) return { valid: false, reason: "already_active" };

  const identifier = activationIdentifier(normalized);
  const tokenHash = hashActivationCode(code);

  const record = await prisma.verificationToken.findFirst({
    where: { identifier, token: tokenHash },
  });

  if (!record) return { valid: false, reason: "invalid" };
  if (record.expires < new Date()) {
    await prisma.verificationToken.deleteMany({ where: { identifier, token: tokenHash } });
    return { valid: false, reason: "expired" };
  }

  return { valid: true };
}

export async function activateUserAccount(email: string, code: string): Promise<{
  success: boolean;
  error?: string;
  attemptsRemaining?: number;
  user?: { id: string; name: string | null; email: string; founderNumber: number | null };
}> {
  const normalized = normalizeEmail(email);

  if (await isActivationBlocked(normalized)) {
    return {
      success: false,
      error:
        "Too many wrong codes. Tap “Resend code” to get a fresh code and try again.",
      attemptsRemaining: 0,
    };
  }

  const validation = await validateActivationCode(normalized, code);

  if (!validation.valid) {
    if (validation.reason === "expired") {
      return { success: false, error: "This code has expired. Request a new one." };
    }
    if (validation.reason === "already_active") {
      return { success: false, error: "This account is already activated." };
    }

    const attempt = await recordFailedActivationAttempt(normalized);
    if (attempt.blocked) {
      return {
        success: false,
        error:
          "Too many wrong codes. Tap “Resend code” to get a fresh code and try again.",
        attemptsRemaining: 0,
      };
    }

    return {
      success: false,
      error: `Invalid activation code. ${attempt.remaining} attempt${attempt.remaining === 1 ? "" : "s"} remaining.`,
      attemptsRemaining: attempt.remaining,
    };
  }

  const tokenHash = hashActivationCode(code);
  const identifier = activationIdentifier(normalized);

  const user = await prisma.user.update({
    where: { email: normalized },
    data: { emailVerified: new Date() },
    select: {
      id: true,
      name: true,
      email: true,
      founderNumber: true,
    },
  });

  await prisma.verificationToken.deleteMany({
    where: { identifier, token: tokenHash },
  });

  await clearActivationResendMeta(normalized);
  await clearActivationAttempts(normalized);

  return { success: true, user };
}

export async function consumeActivationCodes(email: string): Promise<void> {
  await prisma.verificationToken.deleteMany({
    where: { identifier: activationIdentifier(email) },
  });
}

export { CODE_EXPIRY_MS, MAX_ATTEMPTS };
