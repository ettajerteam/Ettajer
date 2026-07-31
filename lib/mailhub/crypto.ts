import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ALGO = "aes-256-gcm";
const VERSION = "v1";

function getKey(): Buffer {
  const raw =
    process.env.EMAIL_SECRETS_KEY?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    "";
  if (!raw) {
    throw new Error(
      "EMAIL_SECRETS_KEY or NEXTAUTH_SECRET is required to encrypt email credentials"
    );
  }
  return createHash("sha256").update(raw).digest();
}

/**
 * Encrypt a JSON-serializable secret payload for at-rest storage.
 * Format: v1:<iv_b64>:<tag_b64>:<cipher_b64>
 */
export function encryptSecretPayload(payload: unknown): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    VERSION,
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(":");
}

export function decryptSecretPayload<T = Record<string, unknown>>(
  ciphertext: string
): T {
  const parts = ciphertext.split(":");
  if (parts.length !== 4 || parts[0] !== VERSION) {
    throw new Error("Invalid encrypted secret format");
  }
  const [, ivB64, tagB64, dataB64] = parts;
  const key = getKey();
  const iv = Buffer.from(ivB64, "base64url");
  const tag = Buffer.from(tagB64, "base64url");
  const data = Buffer.from(dataB64, "base64url");
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(data), decipher.final()]);
  return JSON.parse(plain.toString("utf8")) as T;
}

/** Mask a secret for UI (never return full value). */
export function maskSecret(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.length <= 4) return "••••";
  return `••••${value.slice(-4)}`;
}
