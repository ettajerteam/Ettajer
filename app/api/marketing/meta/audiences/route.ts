import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import {
  collectAbandonerContacts,
  collectPurchaserContacts,
  listMetaAdAccounts,
  normalizeMetaAdAccountId,
} from "@/lib/meta-custom-audiences";
import { parseMarketingIntegrations } from "@/lib/marketing-integrations";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Audience readiness + ad accounts for Custom Audience sync. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
    include: { settings: { select: { marketingIntegrations: true } } },
  });

  if (!store) {
    return NextResponse.json({ message: "Store not found" }, { status: 404 });
  }

  const meta = parseMarketingIntegrations(store.settings?.marketingIntegrations).meta;
  const [purchasers, abandoners] = await Promise.all([
    collectPurchaserContacts(store.id),
    collectAbandonerContacts(store.id),
  ]);

  let adAccounts: Array<{ id: string; name: string }> = [];
  let adAccountsError: string | null = null;

  if (meta.accessToken) {
    try {
      adAccounts = await listMetaAdAccounts(meta.accessToken);
    } catch (error) {
      adAccountsError =
        error instanceof Error ? error.message : "Could not list Meta ad accounts";
    }
  }

  const adAccountId =
    normalizeMetaAdAccountId(meta.adAccountId) ||
    (adAccounts.length === 1 ? adAccounts[0]!.id : null);

  return NextResponse.json({
    ready: Boolean(meta.accessToken),
    adAccountId,
    adAccounts,
    adAccountsError,
    purchasers: {
      eligible: purchasers.length,
      audienceId: meta.purchasersAudienceId,
      lastSyncedAt: meta.purchasersAudienceSyncedAt,
    },
    abandoners: {
      eligible: abandoners.length,
      audienceId: meta.abandonersAudienceId,
      lastSyncedAt: meta.abandonersAudienceSyncedAt,
    },
  });
}
