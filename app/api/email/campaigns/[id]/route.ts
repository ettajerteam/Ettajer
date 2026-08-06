import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedStore } from "@/lib/products";
import { prisma } from "@/lib/db";
import {
  archiveCampaign,
  cancelScheduledCampaign,
  createOrUpdateCampaignDraft,
  deleteCampaign,
  duplicateCampaign,
  getCampaignHistoryDetail,
  scheduleCampaign,
  sendCampaignNow,
  serializeCampaign,
} from "@/lib/email-marketing/campaigns";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

interface RouteParams {
  params: { id: string };
}

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

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const authStore = await getAuthenticatedStore();
    if (!authStore) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const detail = await getCampaignHistoryDetail(authStore.id, params.id);
    return NextResponse.json({
      ok: true,
      ...detail,
    });
  } catch (error) {
    console.error("[email/campaigns/:id GET]", error);
    const message =
      error instanceof Error ? error.message : "Failed to load";
    const status = message === "Campaign not found" ? 404 : 500;
    return NextResponse.json({ message }, { status });
  }
}

const patchSchema = z.object({
  action: z
    .enum([
      "save_draft",
      "schedule",
      "send",
      "cancel",
      "unschedule",
      "archive",
      "duplicate",
    ])
    .optional(),
  name: z.string().trim().max(120).optional().nullable(),
  emailTemplateId: z.string().min(1).optional(),
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

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const authStore = await getAuthenticatedStore();
    if (!authStore) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const store = await loadStoreContext(authStore.id);
    if (!store) {
      return NextResponse.json({ message: "Store not found" }, { status: 404 });
    }

    const parsed = patchSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const action = parsed.data.action ?? "save_draft";
    const campaignId = params.id;

    if (action === "duplicate") {
      const campaign = await duplicateCampaign(store.id, campaignId);
      return NextResponse.json({
        ok: true,
        campaign: serializeCampaign(campaign),
        message: "Campaign duplicated as draft",
      });
    }

    if (action === "archive") {
      const campaign = await archiveCampaign(store.id, campaignId);
      return NextResponse.json({
        ok: true,
        campaign: serializeCampaign(campaign),
        message: "Campaign archived",
      });
    }

    if (action === "cancel" || action === "unschedule") {
      const result = await cancelScheduledCampaign({
        storeId: store.id,
        campaignId,
        toDraft: action === "unschedule",
      });
      return NextResponse.json({
        ok: true,
        campaign: serializeCampaign(result.campaign),
        cancelledJobs: result.cancelledJobs,
        message:
          action === "unschedule"
            ? "Moved to draft"
            : "Scheduled campaign cancelled",
      });
    }

    if (action === "schedule") {
      if (!parsed.data.timezone) {
        return NextResponse.json(
          { message: "Timezone is required" },
          { status: 400 }
        );
      }
      const campaign = await scheduleCampaign({
        store,
        campaignId,
        name: parsed.data.name,
        emailTemplateId: parsed.data.emailTemplateId,
        subject: parsed.data.subject,
        title: parsed.data.title,
        body: parsed.data.body,
        ctaLabel: parsed.data.ctaLabel,
        ctaUrl: parsed.data.ctaUrl,
        themeId: parsed.data.themeId,
        segmentIds: parsed.data.segmentIds,
        timezone: parsed.data.timezone,
        localDatetime: parsed.data.localDatetime,
        scheduledAt: parsed.data.scheduledAt,
      });
      return NextResponse.json({
        ok: true,
        campaign: serializeCampaign(campaign),
        message: "Campaign schedule updated",
      });
    }

    if (action === "send") {
      const result = await sendCampaignNow({
        store,
        campaignId,
        name: parsed.data.name,
        emailTemplateId: parsed.data.emailTemplateId,
        subject: parsed.data.subject,
        title: parsed.data.title,
        body: parsed.data.body,
        ctaLabel: parsed.data.ctaLabel,
        ctaUrl: parsed.data.ctaUrl,
        themeId: parsed.data.themeId,
        segmentIds: parsed.data.segmentIds,
      });
      return NextResponse.json({
        ok: true,
        queued: true,
        queuedCount: result.created,
        campaign: serializeCampaign(result.campaign),
        message: `Queued ${result.created} emails`,
      });
    }

    const campaign = await createOrUpdateCampaignDraft({
      store,
      campaignId,
      name: parsed.data.name,
      emailTemplateId: parsed.data.emailTemplateId,
      subject: parsed.data.subject,
      title: parsed.data.title,
      body: parsed.data.body,
      ctaLabel: parsed.data.ctaLabel,
      ctaUrl: parsed.data.ctaUrl,
      themeId: parsed.data.themeId,
      segmentIds: parsed.data.segmentIds,
    });
    return NextResponse.json({
      ok: true,
      campaign: serializeCampaign(campaign),
      message: "Draft saved",
    });
  } catch (error) {
    console.error("[email/campaigns/:id PATCH]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to update campaign",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const authStore = await getAuthenticatedStore();
    if (!authStore) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    await deleteCampaign(authStore.id, params.id);
    return NextResponse.json({ ok: true, message: "Campaign deleted" });
  } catch (error) {
    console.error("[email/campaigns/:id DELETE]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to delete campaign",
      },
      { status: 400 }
    );
  }
}
