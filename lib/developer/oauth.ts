import { prisma } from "@/lib/db";
import {
  ACCESS_TOKEN_TTL_SECONDS,
  AUTH_CODE_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
  decryptClientSecret,
  encryptClientSecret,
  generateAccessToken,
  generateAuthorizationCode,
  generateClientId,
  generateClientSecret,
  generateRefreshToken,
  hashToken,
  verifyPkce,
} from "@/lib/developer/crypto";
import { verifyClientSecret } from "@/lib/developer/auth-context";
import { DeveloperApiError } from "@/lib/developer/errors";
import {
  THEME_AI_DEFAULT_SCOPES,
  parseScopes,
  type DeveloperScope,
} from "@/lib/developer/scopes";
import { logDeveloperAction } from "@/lib/developer/audit";

function addSeconds(seconds: number): Date {
  return new Date(Date.now() + seconds * 1000);
}

export async function createDeveloperApplication(input: {
  userId: string;
  name: string;
  description?: string;
  redirectUris: string[];
}) {
  const uris = Array.from(
    new Set(input.redirectUris.map((u) => u.trim()).filter(Boolean)),
  );
  if (!input.name.trim()) {
    throw new DeveloperApiError("VALIDATION_ERROR", "Application name is required.");
  }
  if (uris.length === 0) {
    throw new DeveloperApiError("VALIDATION_ERROR", "At least one redirect URI is required.");
  }
  for (const uri of uris) {
    try {
      const parsed = new URL(uri);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new Error("bad protocol");
      }
    } catch {
      throw new DeveloperApiError("VALIDATION_ERROR", `Invalid redirect URI: ${uri}`);
    }
  }

  const clientId = generateClientId();
  const clientSecret = generateClientSecret();

  const app = await prisma.developerApplication.create({
    data: {
      userId: input.userId,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      clientId,
      clientSecretHash: hashToken(clientSecret),
      clientSecretEncrypted: encryptClientSecret(clientSecret),
      redirectUris: {
        create: uris.map((uri) => ({ uri })),
      },
    },
    include: { redirectUris: true },
  });

  await logDeveloperAction({
    applicationId: app.id,
    userId: input.userId,
    actorType: "merchant",
    action: "application.created",
    resource: "application",
    resourceId: app.id,
    metadata: { name: app.name },
  });

  return {
    application: serializeApplication(app),
    clientSecret, // one-time reveal
  };
}

export function serializeApplication(app: {
  id: string;
  name: string;
  description: string | null;
  clientId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  redirectUris?: { id: string; uri: string }[];
}) {
  return {
    id: app.id,
    name: app.name,
    description: app.description,
    clientId: app.clientId,
    status: app.status,
    createdAt: app.createdAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
    redirectUris: (app.redirectUris ?? []).map((r) => r.uri),
  };
}

export async function regenerateClientSecret(applicationId: string, userId: string) {
  const app = await prisma.developerApplication.findFirst({
    where: { id: applicationId, userId },
  });
  if (!app) throw new DeveloperApiError("NOT_FOUND", "Application not found.");

  const clientSecret = generateClientSecret();
  await prisma.developerApplication.update({
    where: { id: app.id },
    data: {
      clientSecretHash: hashToken(clientSecret),
      clientSecretEncrypted: encryptClientSecret(clientSecret),
    },
  });

  await logDeveloperAction({
    applicationId: app.id,
    userId,
    actorType: "merchant",
    action: "application.secret_regenerated",
    resource: "application",
    resourceId: app.id,
  });

  return { clientSecret };
}

export async function getApplicationByClientId(clientId: string) {
  return prisma.developerApplication.findUnique({
    where: { clientId },
    include: { redirectUris: true },
  });
}

export function assertRedirectUriAllowed(
  app: { redirectUris: { uri: string }[] },
  redirectUri: string,
) {
  const ok = app.redirectUris.some((r) => r.uri === redirectUri);
  if (!ok) {
    throw new DeveloperApiError(
      "INVALID_REQUEST",
      "redirect_uri is not registered for this application.",
    );
  }
}

export async function createAuthorizationCode(input: {
  applicationId: string;
  userId: string;
  storeId: string;
  scopes: DeveloperScope[];
  redirectUri: string;
  codeChallenge?: string | null;
  codeChallengeMethod?: string | null;
}) {
  const scopes =
    input.scopes.length > 0 ? input.scopes : [...THEME_AI_DEFAULT_SCOPES];

  let grant = await prisma.oAuthGrant.findFirst({
    where: {
      applicationId: input.applicationId,
      userId: input.userId,
      storeId: input.storeId,
      revokedAt: null,
    },
  });

  if (grant) {
    grant = await prisma.oAuthGrant.update({
      where: { id: grant.id },
      data: { scopes },
    });
  } else {
    grant = await prisma.oAuthGrant.create({
      data: {
        applicationId: input.applicationId,
        userId: input.userId,
        storeId: input.storeId,
        scopes,
      },
    });
  }

  const code = generateAuthorizationCode();
  await prisma.oAuthAuthorizationCode.create({
    data: {
      codeHash: hashToken(code),
      grantId: grant.id,
      redirectUri: input.redirectUri,
      codeChallenge: input.codeChallenge || null,
      codeChallengeMethod: input.codeChallengeMethod || null,
      expiresAt: addSeconds(AUTH_CODE_TTL_SECONDS),
    },
  });

  await logDeveloperAction({
    applicationId: input.applicationId,
    userId: input.userId,
    storeId: input.storeId,
    actorType: "merchant",
    action: "oauth.authorized",
    resource: "grant",
    resourceId: grant.id,
    metadata: { scopes },
  });

  return { code, grantId: grant.id };
}

async function issueTokens(grantId: string, rotatedFromId?: string) {
  const accessToken = generateAccessToken();
  const refreshToken = generateRefreshToken();

  await prisma.oAuthAccessToken.create({
    data: {
      tokenHash: hashToken(accessToken),
      grantId,
      expiresAt: addSeconds(ACCESS_TOKEN_TTL_SECONDS),
    },
  });

  await prisma.oAuthRefreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      grantId,
      expiresAt: addSeconds(REFRESH_TOKEN_TTL_SECONDS),
      rotatedFromId: rotatedFromId ?? null,
    },
  });

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: "Bearer" as const,
    expires_in: ACCESS_TOKEN_TTL_SECONDS,
  };
}

export async function exchangeAuthorizationCode(input: {
  clientId: string;
  clientSecret?: string | null;
  code: string;
  redirectUri: string;
  codeVerifier?: string | null;
}) {
  const app = await getApplicationByClientId(input.clientId);
  if (!app || app.status !== "active") {
    throw new DeveloperApiError("INVALID_CLIENT", "Unknown client.");
  }

  const hasSecret = Boolean(input.clientSecret);
  if (hasSecret) {
    if (!verifyClientSecret(input.clientSecret!, app.clientSecretHash)) {
      throw new DeveloperApiError("INVALID_CLIENT", "Invalid client credentials.");
    }
  }

  assertRedirectUriAllowed(app, input.redirectUri);

  const codeHash = hashToken(input.code);
  const authCode = await prisma.oAuthAuthorizationCode.findUnique({
    where: { codeHash },
    include: { grant: true },
  });

  if (!authCode || authCode.grant.applicationId !== app.id) {
    throw new DeveloperApiError("INVALID_GRANT", "Invalid authorization code.");
  }
  if (authCode.usedAt) {
    throw new DeveloperApiError("INVALID_GRANT", "Authorization code already used.");
  }
  if (authCode.expiresAt.getTime() <= Date.now()) {
    throw new DeveloperApiError("INVALID_GRANT", "Authorization code expired.");
  }
  if (authCode.redirectUri !== input.redirectUri) {
    throw new DeveloperApiError("INVALID_GRANT", "redirect_uri mismatch.");
  }

  if (authCode.codeChallenge) {
    if (!input.codeVerifier) {
      throw new DeveloperApiError("INVALID_GRANT", "code_verifier required (PKCE).");
    }
    if (
      !verifyPkce(
        input.codeVerifier,
        authCode.codeChallenge,
        authCode.codeChallengeMethod,
      )
    ) {
      throw new DeveloperApiError("INVALID_GRANT", "PKCE verification failed.");
    }
  } else if (!hasSecret) {
    throw new DeveloperApiError(
      "INVALID_CLIENT",
      "Public clients must use PKCE; confidential clients must send client_secret.",
    );
  }

  // Atomic one-time consume (race-safe).
  const consumed = await prisma.oAuthAuthorizationCode.updateMany({
    where: { id: authCode.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  if (consumed.count !== 1) {
    throw new DeveloperApiError("INVALID_GRANT", "Authorization code already used.");
  }

  const tokens = await issueTokens(authCode.grantId);
  const grant = authCode.grant;

  return {
    ...tokens,
    scope: grant.scopes.join(" "),
    store_id: grant.storeId,
  };
}

export async function refreshAccessToken(input: {
  clientId: string;
  clientSecret?: string | null;
  refreshToken: string;
}) {
  const app = await getApplicationByClientId(input.clientId);
  if (!app || app.status !== "active") {
    throw new DeveloperApiError("INVALID_CLIENT", "Unknown client.");
  }
  if (input.clientSecret) {
    if (!verifyClientSecret(input.clientSecret, app.clientSecretHash)) {
      throw new DeveloperApiError("INVALID_CLIENT", "Invalid client credentials.");
    }
  }

  const tokenHash = hashToken(input.refreshToken);
  const existing = await prisma.oAuthRefreshToken.findUnique({
    where: { tokenHash },
    include: { grant: true },
  });

  if (!existing || existing.grant.applicationId !== app.id) {
    throw new DeveloperApiError("INVALID_GRANT", "Invalid refresh token.");
  }

  // Refresh token reuse detection: a revoked refresh token presented again
  // invalidates the entire grant family (rotation compromise signal).
  if (existing.revokedAt) {
    const now = new Date();
    await prisma.$transaction([
      prisma.oAuthGrant.update({
        where: { id: existing.grantId },
        data: { revokedAt: now },
      }),
      prisma.oAuthAccessToken.updateMany({
        where: { grantId: existing.grantId, revokedAt: null },
        data: { revokedAt: now },
      }),
      prisma.oAuthRefreshToken.updateMany({
        where: { grantId: existing.grantId, revokedAt: null },
        data: { revokedAt: now },
      }),
    ]);
    await logDeveloperAction({
      applicationId: app.id,
      userId: existing.grant.userId,
      storeId: existing.grant.storeId,
      actorType: "oauth",
      action: "oauth.refresh_reuse_detected",
      resource: "grant",
      resourceId: existing.grantId,
    });
    throw new DeveloperApiError(
      "INVALID_GRANT",
      "Refresh token reuse detected. Re-authorize the application.",
    );
  }

  if (existing.expiresAt.getTime() <= Date.now()) {
    throw new DeveloperApiError("INVALID_GRANT", "Refresh token expired.");
  }
  if (existing.grant.revokedAt) {
    throw new DeveloperApiError("INVALID_GRANT", "Grant revoked.");
  }

  // Rotate atomically: revoke old refresh, then issue new pair.
  const rotated = await prisma.oAuthRefreshToken.updateMany({
    where: { id: existing.id, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  if (rotated.count !== 1) {
    throw new DeveloperApiError("INVALID_GRANT", "Invalid refresh token.");
  }

  const tokens = await issueTokens(existing.grantId, existing.id);
  return {
    ...tokens,
    scope: existing.grant.scopes.join(" "),
    store_id: existing.grant.storeId,
  };
}

export async function revokeToken(input: {
  clientId: string;
  clientSecret?: string | null;
  token: string;
}) {
  const app = await getApplicationByClientId(input.clientId);
  if (!app) throw new DeveloperApiError("INVALID_CLIENT", "Unknown client.");
  if (input.clientSecret && !verifyClientSecret(input.clientSecret, app.clientSecretHash)) {
    throw new DeveloperApiError("INVALID_CLIENT", "Invalid client credentials.");
  }

  const tokenHash = hashToken(input.token);

  const access = await prisma.oAuthAccessToken.findUnique({
    where: { tokenHash },
    include: { grant: true },
  });
  if (access && access.grant.applicationId === app.id) {
    await prisma.oAuthAccessToken.update({
      where: { id: access.id },
      data: { revokedAt: new Date() },
    });
    return { revoked: true };
  }

  const refresh = await prisma.oAuthRefreshToken.findUnique({
    where: { tokenHash },
    include: { grant: true },
  });
  if (refresh && refresh.grant.applicationId === app.id) {
    await prisma.oAuthRefreshToken.update({
      where: { id: refresh.id },
      data: { revokedAt: new Date() },
    });
    return { revoked: true };
  }

  return { revoked: true }; // RFC 7009: always succeed
}

export async function revokeGrant(grantId: string, userId: string) {
  const grant = await prisma.oAuthGrant.findFirst({
    where: { id: grantId, userId },
  });
  if (!grant) throw new DeveloperApiError("NOT_FOUND", "Grant not found.");

  const now = new Date();
  await prisma.$transaction([
    prisma.oAuthGrant.update({
      where: { id: grantId },
      data: { revokedAt: now },
    }),
    prisma.oAuthAccessToken.updateMany({
      where: { grantId, revokedAt: null },
      data: { revokedAt: now },
    }),
    prisma.oAuthRefreshToken.updateMany({
      where: { grantId, revokedAt: null },
      data: { revokedAt: now },
    }),
  ]);

  await logDeveloperAction({
    applicationId: grant.applicationId,
    userId,
    storeId: grant.storeId,
    actorType: "merchant",
    action: "oauth.revoked",
    resource: "grant",
    resourceId: grantId,
  });
}

export { parseScopes, decryptClientSecret };
