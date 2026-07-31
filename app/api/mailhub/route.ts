import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedStore } from "@/lib/products";
import {
  deleteStoreEmailProvider,
  ensureEttajerManagedProvider,
  listMailHubProviderCatalog,
  listStoreEmailProviders,
  setDefaultStoreEmailProvider,
  testStoreEmailProvider,
  upsertStoreEmailProvider,
} from "@/lib/mailhub/providers";
import {
  deleteEmailIdentity,
  listEmailIdentities,
  recheckEmailIdentity,
  upsertEmailIdentity,
} from "@/lib/mailhub/identities";
import { listEmailLogs } from "@/lib/mailhub/logs";
import {
  scoreStoreEmailHealth,
  verifyMailHubDomain,
} from "@/lib/mailhub/health";
import {
  listSendingDomains,
  upsertSendingDomain,
  deleteSendingDomain,
} from "@/lib/email-marketing/sending-domains";
import { isMailHubProviderKind } from "@/lib/mailhub/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  try {
    const authStore = await getAuthenticatedStore();
    if (!authStore) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await ensureEttajerManagedProvider(authStore.id);

    const url = new URL(request.url);
    const view = url.searchParams.get("view") || "overview";

    if (view === "overview") {
      const [providers, domains, identities, health, logs] = await Promise.all([
        listStoreEmailProviders(authStore.id),
        listSendingDomains(authStore.id),
        listEmailIdentities(authStore.id),
        scoreStoreEmailHealth(authStore.id),
        listEmailLogs(authStore.id, { page: 1, pageSize: 10 }),
      ]);
      return NextResponse.json({
        ok: true,
        catalog: listMailHubProviderCatalog(),
        providers,
        domains,
        identities,
        health,
        recentLogs: logs.logs,
      });
    }

    if (view === "logs") {
      const logs = await listEmailLogs(authStore.id, {
        q: url.searchParams.get("q") || undefined,
        status: url.searchParams.get("status") || undefined,
        type: url.searchParams.get("type") || undefined,
        page: Number(url.searchParams.get("page") || "1"),
        pageSize: Number(url.searchParams.get("pageSize") || "25"),
      });
      return NextResponse.json({ ok: true, ...logs });
    }

    if (view === "health") {
      const health = await scoreStoreEmailHealth(authStore.id);
      return NextResponse.json({ ok: true, health });
    }

    return NextResponse.json({ message: "Unknown view" }, { status: 400 });
  } catch (error) {
    console.error("[mailhub GET]", error);
    return NextResponse.json(
      { message: "Failed to load MailHub" },
      { status: 500 }
    );
  }
}

const providerSchema = z.object({
  action: z.literal("upsert_provider"),
  id: z.string().optional(),
  name: z.string().min(1).max(120),
  kind: z.string(),
  status: z.enum(["draft", "active", "disabled"]).optional(),
  isDefaultMarketing: z.boolean().optional(),
  isDefaultTransactional: z.boolean().optional(),
  config: z.record(z.unknown()).default({}),
});

export async function POST(request: Request) {
  try {
    const authStore = await getAuthenticatedStore();
    if (!authStore) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const action = body?.action as string;

    if (action === "upsert_provider") {
      const parsed = providerSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { message: parsed.error.issues[0]?.message || "Invalid input" },
          { status: 400 }
        );
      }
      if (!isMailHubProviderKind(parsed.data.kind)) {
        return NextResponse.json(
          { message: "Unsupported provider" },
          { status: 400 }
        );
      }
      const provider = await upsertStoreEmailProvider({
        storeId: authStore.id,
        id: parsed.data.id,
        name: parsed.data.name,
        kind: parsed.data.kind,
        status: parsed.data.status,
        isDefaultMarketing: parsed.data.isDefaultMarketing,
        isDefaultTransactional: parsed.data.isDefaultTransactional,
        config: parsed.data.config as never,
      });
      return NextResponse.json({ ok: true, provider });
    }

    if (action === "set_default_provider") {
      const id = String(body?.id || "");
      const purpose = body?.purpose as "marketing" | "transactional" | "both";
      if (!id || !purpose) {
        return NextResponse.json({ message: "Invalid input" }, { status: 400 });
      }
      const provider = await setDefaultStoreEmailProvider({
        storeId: authStore.id,
        id,
        purpose,
      });
      return NextResponse.json({ ok: true, provider });
    }

    if (action === "delete_provider") {
      await deleteStoreEmailProvider(authStore.id, String(body?.id || ""));
      return NextResponse.json({ ok: true });
    }

    if (action === "test_provider") {
      const result = await testStoreEmailProvider({
        storeId: authStore.id,
        providerId: String(body?.id || ""),
        toEmail: String(body?.toEmail || ""),
      });
      return NextResponse.json({ ok: true, ...result });
    }

    if (action === "upsert_domain") {
      const domain = await upsertSendingDomain({
        storeId: authStore.id,
        domain: String(body?.domain || ""),
        provider: body?.provider ? String(body.provider) : null,
      });
      if (body?.storeEmailProviderId) {
        const { prisma } = await import("@/lib/db");
        await prisma.emailSendingDomain.update({
          where: { id: domain.id },
          data: {
            storeEmailProviderId: String(body.storeEmailProviderId),
            isDefault: Boolean(body.isDefault),
          },
        });
      }
      return NextResponse.json({ ok: true, domain });
    }

    if (action === "verify_domain") {
      await verifyMailHubDomain(authStore.id, String(body?.id || ""));
      const domains = await listSendingDomains(authStore.id);
      return NextResponse.json({
        ok: true,
        domain: domains.find((d) => d.id === body?.id) || null,
        domains,
      });
    }

    if (action === "delete_domain") {
      await deleteSendingDomain(authStore.id, String(body?.id || ""));
      return NextResponse.json({ ok: true });
    }

    if (action === "upsert_identity") {
      const identity = await upsertEmailIdentity({
        storeId: authStore.id,
        id: body?.id ? String(body.id) : undefined,
        email: String(body?.email || ""),
        displayName: body?.displayName ?? null,
        purpose: body?.purpose ? String(body.purpose) : "both",
        isDefault: Boolean(body?.isDefault),
        storeEmailProviderId: body?.storeEmailProviderId
          ? String(body.storeEmailProviderId)
          : null,
      });
      return NextResponse.json({ ok: true, identity });
    }

    if (action === "recheck_identity") {
      const identity = await recheckEmailIdentity(
        authStore.id,
        String(body?.id || "")
      );
      return NextResponse.json({ ok: true, identity });
    }

    if (action === "delete_identity") {
      await deleteEmailIdentity(authStore.id, String(body?.id || ""));
      return NextResponse.json({ ok: true });
    }

    if (action === "score_health") {
      const health = await scoreStoreEmailHealth(authStore.id);
      return NextResponse.json({ ok: true, health });
    }

    return NextResponse.json({ message: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("[mailhub POST]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "MailHub action failed",
      },
      { status: 500 }
    );
  }
}
