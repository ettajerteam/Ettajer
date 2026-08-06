/**
 * Meta Manual Advanced Matching — normalize + SHA-256 hash for Pixel (browser)
 * and shared helpers. CAPI hashing stays in meta-capi.ts (Node crypto).
 */

import { callFbq, waitForFbq } from "@/lib/meta-pixel";

export interface MetaAdvancedMatchingInput {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  city?: string | null;
  country?: string | null;
  zip?: string | null;
  externalId?: string | null;
}

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function normalizeText(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  return normalized || undefined;
}

function normalizePhone(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 ? digits : undefined;
}

function normalizeZip(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase().replace(/\s+/g, "");
  return normalized || undefined;
}

/** Build Meta user_data params (already hashed) for Pixel init. */
export async function buildHashedMetaUserData(
  input: MetaAdvancedMatchingInput
): Promise<Record<string, string>> {
  const data: Record<string, string> = {};

  const email = normalizeText(input.email);
  if (email) data.em = await sha256Hex(email);

  const phone = normalizePhone(input.phone);
  if (phone) data.ph = await sha256Hex(phone);

  const fn = normalizeText(input.firstName);
  if (fn) data.fn = await sha256Hex(fn);

  const ln = normalizeText(input.lastName);
  if (ln) data.ln = await sha256Hex(ln);

  const city = normalizeText(input.city);
  if (city) data.ct = await sha256Hex(city);

  const country = normalizeText(input.country);
  if (country) data.country = await sha256Hex(country);

  const zip = normalizeZip(input.zip);
  if (zip) data.zp = await sha256Hex(zip);

  const externalId = normalizeText(input.externalId ?? input.email);
  if (externalId) data.external_id = await sha256Hex(externalId);

  return data;
}

function splitName(fullName: string | null | undefined): {
  firstName: string | null;
  lastName: string | null;
} {
  if (!fullName?.trim()) return { firstName: null, lastName: null };
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? null,
    lastName: parts.slice(1).join(" ") || null,
  };
}

export function matchingFromCheckoutContact(input: {
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  city?: string | null;
  country?: string | null;
  zip?: string | null;
}): MetaAdvancedMatchingInput {
  const { firstName, lastName } = splitName(input.name);
  return {
    email: input.email,
    phone: input.phone,
    firstName,
    lastName,
    city: input.city,
    country: input.country,
    zip: input.zip,
    externalId: input.email,
  };
}

/**
 * Attach hashed PII to the Meta Pixel for Manual Advanced Matching.
 * Safe to call when email/phone become available (checkout step / confirmation).
 */
export async function setMetaAdvancedMatching(
  pixelId: string | null | undefined,
  input: MetaAdvancedMatchingInput
): Promise<void> {
  if (typeof window === "undefined") return;
  const id = pixelId?.replace(/[^0-9]/g, "");
  if (!id) return;

  const userData = await buildHashedMetaUserData(input);
  if (Object.keys(userData).length === 0) return;

  const ready = await waitForFbq();
  if (!ready) return;

  callFbq("init", id, userData);
}
