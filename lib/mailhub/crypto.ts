import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ALGO = "aes-256-gcm";
const VERSION = "v1";

function hashKey(raw: string): Buffer {
  return createHash("sha256").update(raw).digest();
}

/**
 * Encryption prefers EMAIL_SECRETS_KEY when set (dedicated).
 * Decryption tries EMAIL_SECRETS_KEY then NEXTAUTH_SECRET so rotating
 * EMAIL_SECRETS_KEY does not brick existing ciphertext overnight.
 */
function getEncryptionKeys(): Buffer[] {
  const primary = process.env.EMAIL_SECRETS_KEY?.trim();
  const fallback = process.env.NEXTAUTH_SECRET?.trim();
  const keys: Buffer[] = [];
  if (primary) keys.push(hashKey(primary));
  if (fallback && fallback !== primary) keys.push(hashKey(fallback));
  if (keys.length === 0) {
    throw new Error(
      "EMAIL_SECRETS_KEY or NEXTAUTH_SECRET is required to encrypt email credentials",
    );
  }
  return keys;
}

function getPrimaryKey(): Buffer {
  return getEncryptionKeys()[0]!;
}

/**
 * Encrypt a JSON-serializable secret payload for at-rest storage.
 * Format: v1:<iv_b64>:<tag_b64>:<cipher_b64>
 */
export function encryptSecretPayload(payload: unknown): string {
  const key = getPrimaryKey();
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
  ciphertext: string,
): T {
  const parts = ciphertext.split(":");
  if (parts.length !== 4 || parts[0] !== VERSION) {
    throw new Error("Invalid encrypted secret format");
  }
  const [, ivB64, tagB64, dataB64] = parts;
  const iv = Buffer.from(ivB64, "base64url");
  const tag = Buffer.from(tagB64, "base64url");
  const data = Buffer.from(dataB64, "base64url");

  let lastError: unknown;
  for (const key of getEncryptionKeys()) {
    try {
      const decipher = createDecipheriv(ALGO, key, iv);
      decipher.setAuthTag(tag);
      const plain = Buffer.concat([decipher.update(data), decipher.final()]);
      return JSON.parse(plain.toString("utf8")) as T;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("Failed to decrypt secret payload");
}

/** Mask a secret for UI (never return full value). */
export function maskSecret(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.length <= 4) return "••••";
  return `••••${value.slice(-4)}`;
}
