import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedStore } from "@/lib/products";
import { prisma } from "@/lib/db";
import {
  createOrUpdateCampaignDraft,
  listCampaignHistory,
  scheduleCampaign,
  sendCampaignNow,
  serializeCampaign,
  isCampaignHistoryFilter,
} from "@/lib/email-marketing/campaigns";
import { CAMPAIGN_HISTORY_FILTERS } from "@/lib/email-marketing/campaign-types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

async function loadStoreContext(storeId: string) {
  return prisma.store.findUnique({
    where: { id: storeId },
    select: {
      id: true,
      name: true,
      slug: true,
      primaryColor: true,
      contactEmail: true,
      address: true,
      currency: true,
    },
  });
}

export async function GET(request: Request) {
  try {
    const authStore = await getAuthenticatedStore();
    if (!authStore) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const statusParam = url.searchParams.get("status")?.trim() || "all";
    const filter = isCampaignHistoryFilter(statusParam)
      ? statusParam
      : statusParam === "sent"
        ? "completed"
        : "all";
    const q = url.searchParams.get("q")?.trim() || "";
    const page = Number(url.searchParams.get("page") || "1");
    const pageSize = Number(url.searchParams.get("pageSize") || "20");

    const result = await listCampaignHistory(authStore.id, {
      filter,
      q,
      page,
      pageSize,
    });

    return NextResponse.json({
      ok: true,
      ...result,
      /** Alias for older clients */
      filter,
      filters: CAMPAIGN_HISTORY_FILTERS,
    });
  } catch (error) {
    console.error("[email/campaigns GET]", error);
    return NextResponse.json(
      { message: "Failed to load campaigns" },
      { status: 500 }
    );
  }
}

const postSchema = z.object({
  action: z.enum(["draft", "send", "schedule"]),
  campaignId: z.string().min(1).optional(),
  name: z.string().trim().max(120).optional().nullable(),
  emailTemplateId: z.string().min(1).optional(),
  templateId: z.string().min(1).optional(),
  subject: z.string().trim().max(200).optional(),
  title: z.string().trim().max(200).optional(),
  body: z.string().trim().max(5000).optional(),
  ctaLabel: z.string().trim().max(80).optional(),
  ctaUrl: z.string().trim().max(500).optional(),
  themeId: z.string().min(1).optional(),
  timezone: z.string().min(1).max(80).optional(),
  localDatetime: z.string().min(1).optional(),
  scheduledAt: z.string().datetime().optional().nullable(),
  segmentIds: z.array(z.string().min(1)).max(50).optional(),
});

export async function POST(request: Request) {
  try {
    const authStore = await getAuthenticatedStore();
    if (!authStore) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const store = await loadStoreContext(authStore.id);
    if (!store) {
      return NextResponse.json({ message: "Store not found" }, { status: 404 });
    }

    const parsed = postSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (parsed.data.action === "draft") {
      const campaign = await createOrUpdateCampaignDraft({
        store,
        ...parsed.data,
      });
      return NextResponse.json({
        ok: true,
        campaign: serializeCampaign(campaign),
        message: "Draft saved",
      });
    }

    if (parsed.data.action === "schedule") {
      if (!parsed.data.timezone) {
        return NextResponse.json(
          { message: "Timezone is required to schedule" },
          { status: 400 }
        );
      }
      const campaign = await scheduleCampaign({
        store,
        ...parsed.data,
        timezone: parsed.data.timezone,
      });
      return NextResponse.json({
        ok: true,
        campaign: serializeCampaign(campaign),
        message: "Campaign scheduled",
      });
    }

    const result = await sendCampaignNow({
      store,
      ...parsed.data,
    });
    return NextResponse.json({
      ok: true,
      queued: true,
      queuedCount: result.created,
      skippedDuplicates: result.skipped,
      recipientCount: result.recipientCount,
      campaign: serializeCampaign(result.campaign),
      message: `Queued ${result.created} emails for delivery`,
    });
  } catch (error) {
    console.error("[email/campaigns POST]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to save campaign",
      },
      { status: 400 }
    );
  }
}
