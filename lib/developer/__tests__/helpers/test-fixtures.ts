/**
 * Shared fixtures for developer platform DB integration tests.
 * Skipped automatically when DATABASE_URL is unset.
 */
import { randomBytes } from "crypto";
import { hashToken, generateApiKey } from "@/lib/developer/crypto";
import { THEME_AI_DEFAULT_SCOPES, type DeveloperScope } from "@/lib/developer/scopes";
import { emptyThemeDocument } from "@/lib/developer/theme-document";
import type { Prisma } from "@prisma/client";

export const hasTestDatabase = Boolean(process.env.DATABASE_URL?.trim());

export async function createTwoStoreFixture(options?: {
  scopesA?: DeveloperScope[];
  scopesB?: DeveloperScope[];
}) {
  const { prisma } = await import("@/lib/db");
  const suffix = randomBytes(4).toString("hex");

  const userA = await prisma.user.create({
    data: { email: `dev-a-${suffix}@example.com`, name: "Dev A" },
  });
  const userB = await prisma.user.create({
    data: { email: `dev-b-${suffix}@example.com`, name: "Dev B" },
  });
  const storeA = await prisma.store.create({
    data: { name: "Store A", slug: `store-a-${suffix}`, userId: userA.id },
  });
  const storeB = await prisma.store.create({
    data: { name: "Store B", slug: `store-b-${suffix}`, userId: userB.id },
  });
  await prisma.storeSettings.create({ data: { storeId: storeA.id } });
  await prisma.storeSettings.create({ data: { storeId: storeB.id } });

  const productA = await prisma.product.create({
    data: {
      title: "A Product",
      slug: `a-product-${suffix}`,
      price: 20,
      storeId: storeA.id,
      status: "active",
    },
  });
  const productB = await prisma.product.create({
    data: {
      title: "B Product",
      slug: `b-product-${suffix}`,
      price: 30,
      storeId: storeB.id,
      status: "active",
    },
  });

  const appA = await prisma.developerApplication.create({
    data: {
      userId: userA.id,
      name: "App A",
      clientId: `ettajer_a_${suffix}`,
      clientSecretHash: hashToken(`secret-a-${suffix}`),
      clientSecretEncrypted: "test",
      redirectUris: { create: [{ uri: "http://localhost:3000/callback" }] },
    },
  });
  const appB = await prisma.developerApplication.create({
    data: {
      userId: userB.id,
      name: "App B",
      clientId: `ettajer_b_${suffix}`,
      clientSecretHash: hashToken(`secret-b-${suffix}`),
      clientSecretEncrypted: "test",
      redirectUris: { create: [{ uri: "http://localhost:3000/callback" }] },
    },
  });

  const scopesA = options?.scopesA ?? [...THEME_AI_DEFAULT_SCOPES, "themes:publish"];
  const scopesB = options?.scopesB ?? [...THEME_AI_DEFAULT_SCOPES, "themes:publish"];

  const keyA = generateApiKey();
  const apiKeyA = await prisma.developerApiKey.create({
    data: {
      applicationId: appA.id,
      storeId: storeA.id,
      name: "Key A",
      keyPrefix: keyA.prefix,
      keyHash: hashToken(keyA.raw),
      scopes: scopesA,
    },
  });
  const keyB = generateApiKey();
  const apiKeyB = await prisma.developerApiKey.create({
    data: {
      applicationId: appB.id,
      storeId: storeB.id,
      name: "Key B",
      keyPrefix: keyB.prefix,
      keyHash: hashToken(keyB.raw),
      scopes: scopesB,
    },
  });

  async function cleanup() {
    await prisma.developerIdempotencyRecord.deleteMany({
      where: { applicationId: { in: [appA.id, appB.id] } },
    });
    await prisma.developerAuditLog.deleteMany({
      where: { storeId: { in: [storeA.id, storeB.id] } },
    });
    await prisma.developerApiKey.deleteMany({
      where: { storeId: { in: [storeA.id, storeB.id] } },
    });
    await prisma.oAuthRefreshToken.deleteMany({
      where: { grant: { storeId: { in: [storeA.id, storeB.id] } } },
    });
    await prisma.oAuthAccessToken.deleteMany({
      where: { grant: { storeId: { in: [storeA.id, storeB.id] } } },
    });
    await prisma.oAuthAuthorizationCode.deleteMany({
      where: { grant: { storeId: { in: [storeA.id, storeB.id] } } },
    });
    await prisma.oAuthGrant.deleteMany({
      where: { storeId: { in: [storeA.id, storeB.id] } },
    });
    await prisma.developerRedirectUri.deleteMany({
      where: { applicationId: { in: [appA.id, appB.id] } },
    });
    await prisma.developerApplication.deleteMany({
      where: { id: { in: [appA.id, appB.id] } },
    });
    await prisma.storeTheme.deleteMany({
      where: { storeId: { in: [storeA.id, storeB.id] } },
    });
    await prisma.storePage.deleteMany({
      where: { storeId: { in: [storeA.id, storeB.id] } },
    });
    await prisma.mediaAsset.deleteMany({
      where: { storeId: { in: [storeA.id, storeB.id] } },
    });
    await prisma.product.deleteMany({
      where: { storeId: { in: [storeA.id, storeB.id] } },
    });
    await prisma.storeSettings.deleteMany({
      where: { storeId: { in: [storeA.id, storeB.id] } },
    });
    await prisma.store.deleteMany({ where: { id: { in: [storeA.id, storeB.id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [userA.id, userB.id] } } });
  }

  return {
    prisma,
    suffix,
    userA,
    userB,
    storeA,
    storeB,
    productA,
    productB,
    appA,
    appB,
    apiKeyA,
    apiKeyB,
    rawKeyA: keyA.raw,
    rawKeyB: keyB.raw,
    scopesA,
    scopesB,
    cleanup,
    emptyDoc: emptyThemeDocument({ theme: "minimal" }),
    asJson: (v: unknown) => v as Prisma.InputJsonValue,
  };
}

export function authCtxFromApiKey(input: {
  applicationId: string;
  applicationName: string;
  userId: string;
  storeId: string;
  scopes: string[];
  apiKeyId: string;
  tokenKey: string;
}) {
  return {
    actor: "api_key" as const,
    applicationId: input.applicationId,
    applicationName: input.applicationName,
    userId: input.userId,
    storeId: input.storeId,
    scopes: input.scopes,
    apiKeyId: input.apiKeyId,
    tokenKey: input.tokenKey,
  };
}
