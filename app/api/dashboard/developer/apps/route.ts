import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import {
  createDeveloperApplication,
  regenerateClientSecret,
  serializeApplication,
  revokeGrant,
} from "@/lib/developer/oauth";
import {
  generateApiKey,
  hashToken,
} from "@/lib/developer/crypto";
import { THEME_AI_DEFAULT_SCOPES, parseScopes } from "@/lib/developer/scopes";
import { getAuthenticatedStore } from "@/lib/get-authenticated-store";
import { logDeveloperAction } from "@/lib/developer/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apps = await prisma.developerApplication.findMany({
    where: { userId: session.user.id },
    include: {
      redirectUris: true,
      grants: {
        where: { revokedAt: null },
        include: { store: { select: { name: true, slug: true } } },
        orderBy: { updatedAt: "desc" },
      },
      apiKeys: {
        where: { revokedAt: null },
        select: {
          id: true,
          name: true,
          keyPrefix: true,
          scopes: true,
          lastUsedAt: true,
          createdAt: true,
          storeId: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    applications: apps.map((app) => ({
      ...serializeApplication(app),
      grants: app.grants.map((g) => ({
        id: g.id,
        storeName: g.store.name,
        storeSlug: g.store.slug,
        scopes: g.scopes,
        createdAt: g.createdAt.toISOString(),
        updatedAt: g.updatedAt.toISOString(),
      })),
      apiKeys: app.apiKeys.map((k) => ({
        id: k.id,
        name: k.name,
        keyPrefix: k.keyPrefix,
        scopes: k.scopes,
        lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
        createdAt: k.createdAt.toISOString(),
      })),
    })),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    action?: string;
    name?: string;
    description?: string;
    redirectUris?: string[];
    applicationId?: string;
    grantId?: string;
    apiKeyName?: string;
    scopes?: string;
  };

  if (body.action === "create" || !body.action) {
    const result = await createDeveloperApplication({
      userId: session.user.id,
      name: body.name || "Untitled app",
      description: body.description,
      redirectUris: body.redirectUris || [],
    });
    return NextResponse.json(result, { status: 201 });
  }

  if (body.action === "regenerate_secret" && body.applicationId) {
    const result = await regenerateClientSecret(
      body.applicationId,
      session.user.id,
    );
    return NextResponse.json(result);
  }

  if (body.action === "revoke_grant" && body.grantId) {
    await revokeGrant(body.grantId, session.user.id);
    return NextResponse.json({ ok: true });
  }

  if (body.action === "create_api_key" && body.applicationId) {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ error: "Store required" }, { status: 400 });
    }
    const app = await prisma.developerApplication.findFirst({
      where: { id: body.applicationId, userId: session.user.id },
    });
    if (!app) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const scopes = parseScopes(body.scopes);
    const { raw, prefix } = generateApiKey();
    const key = await prisma.developerApiKey.create({
      data: {
        applicationId: app.id,
        storeId: store.id,
        name: body.apiKeyName || "API key",
        keyPrefix: prefix,
        keyHash: hashToken(raw),
        scopes: scopes.length > 0 ? scopes : [...THEME_AI_DEFAULT_SCOPES],
      },
    });
    await logDeveloperAction({
      applicationId: app.id,
      userId: session.user.id,
      storeId: store.id,
      actorType: "merchant",
      action: "api_key.created",
      resource: "api_key",
      resourceId: key.id,
    });
    return NextResponse.json({
      apiKey: {
        id: key.id,
        name: key.name,
        keyPrefix: key.keyPrefix,
        scopes: key.scopes,
      },
      secret: raw,
    }, { status: 201 });
  }

  if (body.action === "revoke_api_key" && body.applicationId) {
    const keyId = (body as { apiKeyId?: string }).apiKeyId;
    if (!keyId) {
      return NextResponse.json({ error: "apiKeyId required" }, { status: 400 });
    }
    const key = await prisma.developerApiKey.findFirst({
      where: {
        id: keyId,
        application: { userId: session.user.id },
      },
    });
    if (!key) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await prisma.developerApiKey.update({
      where: { id: key.id },
      data: { revokedAt: new Date() },
    });
    await logDeveloperAction({
      applicationId: key.applicationId,
      userId: session.user.id,
      storeId: key.storeId,
      actorType: "merchant",
      action: "api_key.revoked",
      resource: "api_key",
      resourceId: key.id,
    });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "rotate_api_key" && body.applicationId) {
    const keyId = (body as { apiKeyId?: string }).apiKeyId;
    if (!keyId) {
      return NextResponse.json({ error: "apiKeyId required" }, { status: 400 });
    }
    const existing = await prisma.developerApiKey.findFirst({
      where: {
        id: keyId,
        revokedAt: null,
        application: { userId: session.user.id, id: body.applicationId },
      },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const { raw, prefix } = generateApiKey();
    const now = new Date();
    const [, created] = await prisma.$transaction([
      prisma.developerApiKey.update({
        where: { id: existing.id },
        data: { revokedAt: now },
      }),
      prisma.developerApiKey.create({
        data: {
          applicationId: existing.applicationId,
          storeId: existing.storeId,
          name: existing.name,
          keyPrefix: prefix,
          keyHash: hashToken(raw),
          scopes: existing.scopes,
        },
      }),
    ]);
    await logDeveloperAction({
      applicationId: existing.applicationId,
      userId: session.user.id,
      storeId: existing.storeId,
      actorType: "merchant",
      action: "api_key.rotated",
      resource: "api_key",
      resourceId: created.id,
      metadata: { previousKeyId: existing.id },
    });
    return NextResponse.json({
      apiKey: {
        id: created.id,
        name: created.name,
        keyPrefix: created.keyPrefix,
        scopes: created.scopes,
      },
      secret: raw,
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
