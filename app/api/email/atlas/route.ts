import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedStore } from "@/lib/products";
import { prisma } from "@/lib/db";
import { getMerchantInsightsBundle } from "@/lib/email-marketing/atlas/insights";
import {
  getCustomerIntelligence,
  scoreCustomerIntelligence,
  scoreStoreIntelligence,
} from "@/lib/email-marketing/atlas/intelligence";
import {
  attributeCampaignRevenue,
  attributeStoreCampaigns,
} from "@/lib/email-marketing/atlas/attribution";
import { runEmailCopilot } from "@/lib/email-marketing/atlas/ai";
import { ensurePredictiveSegments } from "@/lib/email-marketing/atlas/predictive-segments";
import { chooseSmartIncentive } from "@/lib/email-marketing/atlas/recommendations";
import { recommendProducts } from "@/lib/email-marketing/atlas/recommendations";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  try {
    const authStore = await getAuthenticatedStore();
    if (!authStore) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const url = new URL(request.url);
    const view = url.searchParams.get("view") || "insights";

    if (view === "insights") {
      const bundle = await getMerchantInsightsBundle(authStore.id);
      return NextResponse.json({ ok: true, ...bundle });
    }

    if (view === "intelligence") {
      const email = url.searchParams.get("email")?.trim();
      if (!email) {
        return NextResponse.json(
          { message: "email required" },
          { status: 400 }
        );
      }
      const row = await getCustomerIntelligence(authStore.id, email);
      return NextResponse.json({ ok: true, intelligence: row });
    }

    if (view === "recommend") {
      const strategy = url.searchParams.get("strategy") || "best_sellers";
      const email = url.searchParams.get("email");
      const ids = await recommendProducts({
        storeId: authStore.id,
        email,
        strategy,
        limit: Number(url.searchParams.get("limit") || "3"),
      });
      return NextResponse.json({ ok: true, productIds: ids });
    }

    return NextResponse.json({ message: "Unknown view" }, { status: 400 });
  } catch (error) {
    console.error("[email/atlas GET]", error);
    return NextResponse.json(
      { message: "Failed to load Atlas data" },
      { status: 500 }
    );
  }
}

const postSchema = z.object({
  action: z.enum([
    "score_store",
    "score_contact",
    "attribute_campaign",
    "attribute_store",
    "copilot",
    "ensure_predictive_segments",
    "smart_incentive",
  ]),
  email: z.string().optional(),
  campaignId: z.string().optional(),
  copilot: z
    .object({
      action: z.enum([
        "generate_subject",
        "generate_email",
        "improve",
        "rewrite",
        "translate",
        "tone",
        "shorten",
        "expand",
        "generate_cta",
        "promotion_ideas",
      ]),
      text: z.string().optional(),
      tone: z
        .enum(["luxury", "friendly", "professional", "short", "expand"])
        .optional(),
      locale: z.enum(["en", "fr", "ar", "es"]).optional(),
      targetLocale: z.enum(["en", "fr", "ar", "es"]).optional(),
      category: z.string().optional().nullable(),
    })
    .optional(),
});

export async function POST(request: Request) {
  try {
    const authStore = await getAuthenticatedStore();
    if (!authStore) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { action } = parsed.data;

    if (action === "score_store") {
      const result = await scoreStoreIntelligence(authStore.id);
      return NextResponse.json({ ok: true, ...result });
    }

    if (action === "score_contact") {
      if (!parsed.data.email) {
        return NextResponse.json(
          { message: "email required" },
          { status: 400 }
        );
      }
      const intelligence = await scoreCustomerIntelligence(
        authStore.id,
        parsed.data.email
      );
      return NextResponse.json({ ok: true, intelligence });
    }

    if (action === "attribute_campaign") {
      if (!parsed.data.campaignId) {
        return NextResponse.json(
          { message: "campaignId required" },
          { status: 400 }
        );
      }
      const attribution = await attributeCampaignRevenue(
        authStore.id,
        parsed.data.campaignId
      );
      return NextResponse.json({ ok: true, attribution });
    }

    if (action === "attribute_store") {
      const result = await attributeStoreCampaigns(authStore.id);
      return NextResponse.json({ ok: true, ...result });
    }

    if (action === "ensure_predictive_segments") {
      const result = await ensurePredictiveSegments(authStore.id);
      return NextResponse.json({ ok: true, ...result });
    }

    if (action === "smart_incentive") {
      if (!parsed.data.email) {
        return NextResponse.json(
          { message: "email required" },
          { status: 400 }
        );
      }
      const incentive = await chooseSmartIncentive({
        storeId: authStore.id,
        email: parsed.data.email,
      });
      return NextResponse.json({ ok: true, incentive });
    }

    if (action === "copilot") {
      if (!parsed.data.copilot) {
        return NextResponse.json(
          { message: "copilot payload required" },
          { status: 400 }
        );
      }
      const store = await prisma.store.findUnique({
        where: { id: authStore.id },
        select: { name: true },
      });
      const result = await runEmailCopilot({
        ...parsed.data.copilot,
        storeName: store?.name || "Store",
      });
      return NextResponse.json({ ok: true, ...result });
    }

    return NextResponse.json({ message: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("[email/atlas POST]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Atlas action failed",
      },
      { status: 500 }
    );
  }
}
