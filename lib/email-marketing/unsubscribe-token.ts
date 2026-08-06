import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const SIGNED_PREFIX = "s1.";

function secret(): string {
  const value =
    process.env.EMAIL_UNSUBSCRIBE_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    process.env.AUTH_SECRET?.trim();
  if (!value) {
    throw new Error(
      "EMAIL_UNSUBSCRIBE_SECRET or NEXTAUTH_SECRET is required for email compliance tokens"
    );
  }
  return value;
}

export function generateUnsubscribeToken(): string {
  return randomBytes(32).toString("base64url");
}

export function signMarketingEmailToken(input: {
  storeId: string;
  email: string;
}): string {
  const email = input.email.trim().toLowerCase();
  const body = Buffer.from(
    JSON.stringify({
      v: 1,
      storeId: input.storeId,
      email,
    }),
    "utf8"
  ).toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${SIGNED_PREFIX}${body}.${sig}`;
}

export function verifySignedMarketingEmailToken(token: string): {
  storeId: string;
  email: string;
} | null {
  if (!token.startsWith(SIGNED_PREFIX)) return null;
  const raw = token.slice(SIGNED_PREFIX.length);
  const [body, sig] = raw.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const parsed = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as { v?: number; storeId?: string; email?: string };
    if (parsed.v !== 1 || !parsed.storeId || !parsed.email) return null;
    return {
      storeId: parsed.storeId,
      email: parsed.email.trim().toLowerCase(),
    };
  } catch {
    return null;
  }
}

export { SIGNED_PREFIX };
