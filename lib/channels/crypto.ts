import { encryptSecretPayload, decryptSecretPayload } from "@/lib/mailhub/crypto";
import type { ChannelTokenPayload } from "@/lib/channels/types";

/**
 * Encrypt a channel OAuth token payload for at-rest storage in
 * ChannelConnection.accessTokenEncrypted / refreshTokenEncrypted.
 *
 * We reuse the mailhub AES-256-GCM envelope so channel secrets share the same
 * key-rotation story (EMAIL_SECRETS_KEY primary, NEXTAUTH_SECRET fallback).
 */
export function encryptChannelTokens(payload: ChannelTokenPayload): {
  accessTokenEncrypted: string;
  refreshTokenEncrypted: string | null;
} {
  return {
    accessTokenEncrypted: encryptSecretPayload({ accessToken: payload.accessToken }),
    refreshTokenEncrypted: payload.refreshToken
      ? encryptSecretPayload({ refreshToken: payload.refreshToken })
      : null,
  };
}

export function decryptChannelAccessToken(accessTokenEncrypted: string): string {
  const { accessToken } = decryptSecretPayload<{ accessToken: string }>(
    accessTokenEncrypted
  );
  if (!accessToken) throw new Error("Decrypted channel payload missing accessToken");
  return accessToken;
}

export function decryptChannelRefreshToken(
  refreshTokenEncrypted: string | null | undefined
): string | null {
  if (!refreshTokenEncrypted) return null;
  const { refreshToken } = decryptSecretPayload<{ refreshToken?: string }>(
    refreshTokenEncrypted
  );
  return refreshToken ?? null;
}

/** Convenience: decrypt both tokens from a ChannelConnection row shape. */
export function decryptChannelTokens(row: {
  accessTokenEncrypted: string | null;
  refreshTokenEncrypted: string | null;
}): ChannelTokenPayload | null {
  if (!row.accessTokenEncrypted) return null;
  return {
    accessToken: decryptChannelAccessToken(row.accessTokenEncrypted),
    refreshToken: decryptChannelRefreshToken(row.refreshTokenEncrypted),
  };
}
