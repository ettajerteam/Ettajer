import { createHash, randomBytes, timingSafeEqual } from "crypto";
import {
  encryptSecretPayload,
  decryptSecretPayload,
} from "@/lib/mailhub/crypto";

export { pkceChallengeS256, verifyPkce } from "@/lib/developer/pkce";

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw, "utf8").digest("hex");
}

export function safeEqualHash(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export function generateClientId(): string {
  return `ettajer_${randomBytes(12).toString("hex")}`;
}

export function generateClientSecret(): string {
  return `etsk_${randomBytes(32).toString("base64url")}`;
}

export function generateAccessToken(): string {
  return `eta_${randomBytes(32).toString("base64url")}`;
}

export function generateRefreshToken(): string {
  return `etr_${randomBytes(32).toString("base64url")}`;
}

export function generateAuthorizationCode(): string {
  return `etc_${randomBytes(24).toString("base64url")}`;
}

export function generateApiKey(): { raw: string; prefix: string } {
  const body = randomBytes(24).toString("base64url");
  const raw = `etsk_live_${body}`;
  return { raw, prefix: raw.slice(0, 16) };
}

export function encryptClientSecret(raw: string): string {
  return encryptSecretPayload({ secret: raw });
}

export function decryptClientSecret(ciphertext: string): string {
  const payload = decryptSecretPayload<{ secret: string }>(ciphertext);
  return payload.secret;
}

export const ACCESS_TOKEN_TTL_SECONDS = 60 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;
export const AUTH_CODE_TTL_SECONDS = 60 * 10;
