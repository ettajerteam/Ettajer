import { prisma } from "@/lib/db";
import {
  hashToken,
  safeEqualHash,
} from "@/lib/developer/crypto";
import { DeveloperApiError } from "@/lib/developer/errors";
import type { DeveloperScope } from "@/lib/developer/scopes";
import { hasScope } from "@/lib/developer/scopes";

export type DeveloperAuthActor = "oauth" | "api_key";

export type DeveloperAuthContext = {
  actor: DeveloperAuthActor;
  applicationId: string;
  applicationName: string;
  userId: string;
  storeId: string;
  scopes: string[];
  grantId?: string;
  apiKeyId?: string;
  tokenKey: string;
};

function bearerFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const m = authHeader.match(/^Bearer\s+(.+)$/i);
  return m?.[1]?.trim() || null;
}

export async function resolveDeveloperAuth(
  request: Request,
): Promise<DeveloperAuthContext> {
  const raw = bearerFromHeader(request.headers.get("authorization"));
  if (!raw) {
    throw new DeveloperApiError("UNAUTHORIZED", "Missing Bearer token.");
  }

  if (raw.startsWith("etsk_live_")) {
    return resolveApiKey(raw);
  }

  return resolveAccessToken(raw);
}

async function resolveAccessToken(raw: string): Promise<DeveloperAuthContext> {
  const tokenHash = hashToken(raw);
  const token = await prisma.oAuthAccessToken.findUnique({
    where: { tokenHash },
    include: {
      grant: {
        include: {
          application: true,
        },
      },
    },
  });

  if (!token || token.revokedAt) {
    throw new DeveloperApiError("INVALID_TOKEN", "Access token is invalid.");
  }
  if (token.expiresAt.getTime() <= Date.now()) {
    throw new DeveloperApiError("INVALID_TOKEN", "Access token has expired.");
  }
  if (token.grant.revokedAt) {
    throw new DeveloperApiError("INVALID_TOKEN", "Authorization grant was revoked.");
  }
  if (token.grant.application.status !== "active") {
    throw new DeveloperApiError("INVALID_TOKEN", "Application is not active.");
  }

  return {
    actor: "oauth",
    applicationId: token.grant.applicationId,
    applicationName: token.grant.application.name,
    userId: token.grant.userId,
    storeId: token.grant.storeId,
    scopes: token.grant.scopes,
    grantId: token.grantId,
    tokenKey: tokenHash.slice(0, 16),
  };
}

async function resolveApiKey(raw: string): Promise<DeveloperAuthContext> {
  const keyHash = hashToken(raw);
  const key = await prisma.developerApiKey.findUnique({
    where: { keyHash },
    include: { application: true },
  });

  if (!key || key.revokedAt) {
    throw new DeveloperApiError("INVALID_TOKEN", "API key is invalid.");
  }
  if (key.application.status !== "active") {
    throw new DeveloperApiError("INVALID_TOKEN", "Application is not active.");
  }

  // Fire-and-forget last used
  void prisma.developerApiKey
    .update({ where: { id: key.id }, data: { lastUsedAt: new Date() } })
    .catch(() => undefined);

  return {
    actor: "api_key",
    applicationId: key.applicationId,
    applicationName: key.application.name,
    userId: key.application.userId,
    storeId: key.storeId,
    scopes: key.scopes,
    apiKeyId: key.id,
    tokenKey: key.keyPrefix,
  };
}

export function requireScopes(
  ctx: DeveloperAuthContext,
  required: DeveloperScope | DeveloperScope[],
) {
  if (!hasScope(ctx.scopes, required)) {
    const need = Array.isArray(required) ? required.join(", ") : required;
    throw new DeveloperApiError(
      "INSUFFICIENT_SCOPE",
      `This application does not have ${need} permission.`,
    );
  }
}

/** Constant-time compare of hashed client secrets. */
export function verifyClientSecret(rawSecret: string, storedHash: string): boolean {
  return safeEqualHash(hashToken(rawSecret), storedHash);
}
