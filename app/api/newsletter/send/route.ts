import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedStore } from "@/lib/products";
import { prisma } from "@/lib/db";
import {
  scheduleCampaign,
  sendCampaignNow,
  serializeCampaign,
} from "@/lib/email-marketing/campaigns";
import { serializeNewsletterSend } from "@/lib/newsletter";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Back-compat send endpoint — prefers /api/email/campaigns.
 * Supports send-now and schedule via scheduledAt / localDatetime+timezone.
 */
const bodySchema = z.object({
  emailTemplateId: z.string().min(1).optional(),
  templateId: z.string().min(1).optional(),
  themeId: z.string().min(1).optional().default("store"),
  subject: z.string().trim().min(1).max(200).optional(),
  title: z.string().trim().min(1).max(200).optional(),
  body: z.string().trim().min(1).max(5000).optional(),
  ctaLabel: z.string().trim().max(80).optional().default(""),
  ctaUrl: z.string().trim().max(500).optional().default(""),
  scheduledAt: z.string().datetime().optional().nullable(),
  localDatetime: z.string().optional(),
  timezone: z.string().min(1).max(80).optional(),
  name: z.string().trim().max(120).optional(),
});

export async function POST(request: Request) {
  try {
    const authStore = await getAuthenticatedStore();
    if (!authStore) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid newsletter fields", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const store = await prisma.store.findUnique({
      where: { id: authStore.id },
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
    if (!store) {
      return NextResponse.json({ message: "Store not found" }, { status: 404 });
    }

    const isSchedule =
      Boolean(parsed.data.localDatetime?.trim()) ||
      (parsed.data.scheduledAt != null &&
        new Date(parsed.data.scheduledAt).getTime() > Date.now());

    if (isSchedule) {
      const timezone =
        parsed.data.timezone?.trim() ||
        Intl.DateTimeFormat().resolvedOptions().timeZone ||
        "Africa/Casablanca";
      const campaign = await scheduleCampaign({
        store,
        name: parsed.data.name,
        emailTemplateId: parsed.data.emailTemplateId,
        templateId: parsed.data.templateId,
        subject: parsed.data.subject,
        title: parsed.data.title,
        body: parsed.data.body,
        ctaLabel: parsed.data.ctaLabel,
        ctaUrl: parsed.data.ctaUrl,
        themeId: parsed.data.themeId,
        timezone,
        localDatetime: parsed.data.localDatetime,
        scheduledAt: parsed.data.scheduledAt,
      });
      return NextResponse.json({
        ok: true,
        scheduled: true,
        recipientCount: campaign.recipientCount,
        send: serializeNewsletterSend(campaign),
        campaign: serializeCampaign(campaign),
        message: "Campaign scheduled",
      });
    }

    const result = await sendCampaignNow({
      store,
      name: parsed.data.name,
      emailTemplateId: parsed.data.emailTemplateId,
      templateId: parsed.data.templateId,
      subject: parsed.data.subject,
      title: parsed.data.title,
      body: parsed.data.body,
      ctaLabel: parsed.data.ctaLabel,
      ctaUrl: parsed.data.ctaUrl,
      themeId: parsed.data.themeId,
    });

    return NextResponse.json({
      ok: true,
      queued: true,
      queuedCount: result.created,
      skippedDuplicates: result.skipped,
      recipientCount: result.recipientCount,
      send: serializeNewsletterSend(result.campaign),
      campaign: serializeCampaign(result.campaign),
      message: `Queued ${result.created} emails for delivery`,
    });
  } catch (error) {
    console.error("[newsletter/send]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to queue newsletter",
      },
      { status: 400 }
    );
  }
}
