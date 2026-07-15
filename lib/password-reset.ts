import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

const RESET_IDENTIFIER_PREFIX = "password-reset:";
const TOKEN_EXPIRY_MS = 60 * 60 * 1000;
const BCRYPT_ROUNDS = 12;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function resetIdentifier(email: string): string {
  return `${RESET_IDENTIFIER_PREFIX}${normalizeEmail(email)}`;
}

export function createResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function userExists(email: string): Promise<boolean> {
  const normalized = normalizeEmail(email);
  const user = await prisma.user.findUnique({
    where: { email: normalized },
    select: { id: true },
  });

  return !!user;
}

export async function issuePasswordResetToken(
  email: string,
): Promise<string | null> {
  const normalized = normalizeEmail(email);
  const exists = await userExists(normalized);
  if (!exists) return null;

  const token = createResetToken();
  const tokenHash = hashResetToken(token);
  const identifier = resetIdentifier(normalized);
  const expires = new Date(Date.now() + TOKEN_EXPIRY_MS);

  await prisma.verificationToken.deleteMany({
    where: { identifier },
  });

  await prisma.verificationToken.create({
    data: { identifier, token: tokenHash, expires },
  });

  return token;
}

export async function validateResetToken(
  email: string,
  token: string,
): Promise<boolean> {
  const identifier = resetIdentifier(email);
  const tokenHash = hashResetToken(token);
  const record = await prisma.verificationToken.findFirst({
    where: { identifier, token: tokenHash },
  });

  if (!record) return false;

  if (record.expires < new Date()) {
    await prisma.verificationToken.deleteMany({
      where: { identifier, token: tokenHash },
    });
    return false;
  }

  return true;
}

export async function updateUserPassword(
  email: string,
  password: string,
): Promise<boolean> {
  const normalized = normalizeEmail(email);
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const updated = await prisma.$executeRaw`
    UPDATE "User"
    SET "passwordHash" = ${passwordHash}
    WHERE "email" = ${normalized}
  `;

  return Number(updated) > 0;
}

export async function consumeResetToken(
  email: string,
  token: string,
): Promise<void> {
  const tokenHash = hashResetToken(token);

  await prisma.verificationToken.deleteMany({
    where: {
      identifier: resetIdentifier(email),
      token: tokenHash,
    },
  });
}

export function buildResetPasswordUrl(
  baseUrl: string,
  email: string,
  token: string,
): string {
  const params = new URLSearchParams({
    email: normalizeEmail(email),
    token,
  });

  return `${baseUrl.replace(/\/$/, "")}/reset-password?${params.toString()}`;
}
