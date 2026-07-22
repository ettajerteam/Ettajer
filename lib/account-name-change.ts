import crypto from "crypto";
import { prisma } from "@/lib/db";

const NAME_CHANGE_PREFIX = "name-change:";
const TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function nameChangeIdentifier(email: string): string {
  return `${NAME_CHANGE_PREFIX}${normalizeEmail(email)}`;
}

export function createNameChangeToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashNameChangeToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function normalizeDisplayName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

/** Letters (incl. Arabic), spaces, hyphens, apostrophes — 2–80 chars */
export function isValidDisplayName(name: string): boolean {
  const normalized = normalizeDisplayName(name);
  if (normalized.length < 2 || normalized.length > 80) return false;
  // Allow Latin + Arabic letters, marks, spaces, hyphen, apostrophe
  return /^[A-Za-z\u00C0-\u024F\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF][A-Za-z\u00C0-\u024F\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s'.’-]*$/.test(
    normalized
  );
}

export async function getUserNameByEmail(email: string): Promise<{
  id: string;
  email: string;
  name: string | null;
  founderNumber: number | null;
} | null> {
  return prisma.user.findUnique({
    where: { email: normalizeEmail(email) },
    select: { id: true, email: true, name: true, founderNumber: true },
  });
}

export async function issueNameChangeToken(email: string): Promise<string | null> {
  const user = await getUserNameByEmail(email);
  if (!user) return null;

  const token = createNameChangeToken();
  const tokenHash = hashNameChangeToken(token);
  const identifier = nameChangeIdentifier(user.email);
  const expires = new Date(Date.now() + TOKEN_EXPIRY_MS);

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: { identifier, token: tokenHash, expires },
  });

  return token;
}

export async function validateNameChangeToken(
  email: string,
  token: string
): Promise<boolean> {
  const identifier = nameChangeIdentifier(email);
  const tokenHash = hashNameChangeToken(token);
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

export async function consumeNameChangeToken(
  email: string,
  token: string
): Promise<void> {
  await prisma.verificationToken.deleteMany({
    where: {
      identifier: nameChangeIdentifier(email),
      token: hashNameChangeToken(token),
    },
  });
}

export async function updateUserDisplayName(
  email: string,
  newName: string
): Promise<{ previousName: string | null; name: string } | null> {
  const normalizedEmail = normalizeEmail(email);
  const name = normalizeDisplayName(newName);
  if (!isValidDisplayName(name)) return null;

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, name: true },
  });
  if (!user) return null;

  await prisma.user.update({
    where: { id: user.id },
    data: { name },
  });

  return { previousName: user.name, name };
}

export function buildNameChangeUrl(
  baseUrl: string,
  email: string,
  token: string
): string {
  const params = new URLSearchParams({
    email: normalizeEmail(email),
    token,
  });
  return `${baseUrl.replace(/\/$/, "")}/account/change-name?${params.toString()}`;
}
