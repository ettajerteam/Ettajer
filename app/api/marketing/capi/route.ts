import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  extractRequestClientHints,
  getMetaCapiConfig,
  isMetaCapiEventEnabled,
  sendMetaCapiEvent,
  type MetaCapiEventName,
} from "@/lib/meta-capi";
import {
  getPinterestCapiConfig,
  isPinterestCapiEventEnabled,
  sendPinterestCapiEvent,
  type PinterestCapiEventName,
} from "@/lib/pinterest-capi";

const bodySchema = z.object({
  storeSlug: z.string().min(1),
  eventName: z.enum([
    "PageView",
    "ViewContent",
    "AddToCart",
    "InitiateCheckout",
    "Purchase",
  ]),
  eventId: z.string().min(1).max(120),
  eventSourceUrl: z.string().url().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  firstName: z.string().max(80).optional().nullable(),
  lastName: z.string().max(80).optional().nullable(),
  city: z.string().max(80).optional().nullable(),
  country: z.string().max(80).optional().nullable(),
  zip: z.string().max(30).optional().nullable(),
  value: z.number().optional(),
  currency: z.string().optional(),
  contentName: z.string().optional(),
  contentIds: z.array(z.string()).optional(),
  numItems: z.number().int().positive().optional(),
  orderId: z.string().optional(),
  contents: z
    .array(
      z.object({
        id: z.string(),
        quantity: z.number().optional(),
        itemPrice: z.number().optional(),
      })
    )
    .optional(),
  fbp: z.string().optional().nullable(),
  fbc: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid CAPI payload", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const input = parsed.data;
    const store = await prisma.store.findUnique({
      where: { slug: input.storeSlug },
      include: { settings: true },
    });
    if (!store) {
      return NextResponse.json({ message: "Store not found" }, { status: 404 });
    }

    const integrations = store.settings?.marketingIntegrations;
    const metaConfig = getMetaCapiConfig(integrations);
    const pinConfig = getPinterestCapiConfig(integrations);
    const hints = extractRequestClientHints(request);

    const results: {
      meta?: { ok: boolean; skipped?: boolean; reason?: string; error?: string };
      pinterest?: {
        ok: boolean;
        skipped?: boolean;
        reason?: string;
        error?: string;
      };
    } = {};

    if (!metaConfig && !pinConfig) {
      const { recordMarketingEventDiagnostic, diagnosticMetadataFromCapi } =
        await import("@/lib/marketing-event-diagnostics");
      void recordMarketingEventDiagnostic({
        storeId: store.id,
        eventName: input.eventName,
        eventId: input.eventId,
        status: "skipped",
        source: "storefront",
        metadata: diagnosticMetadataFromCapi({ reason: "capi_not_configured" }),
      });
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: "capi_not_configured",
      });
    }

    if (metaConfig) {
      if (!isMetaCapiEventEnabled(metaConfig, input.eventName as MetaCapiEventName)) {
        results.meta = { ok: true, skipped: true, reason: "event_disabled" };
      } else {
        const result = await sendMetaCapiEvent({
          pixelId: metaConfig.pixelId,
          accessToken: metaConfig.accessToken,
          eventName: input.eventName as MetaCapiEventName,
          eventId: input.eventId,
          eventSourceUrl: input.eventSourceUrl ?? null,
          testEventCode: metaConfig.testMode ? metaConfig.testEventCode : null,
          diagnostics: {
            storeId: store.id,
            source: "storefront",
            testMode: metaConfig.testMode,
          },
          userData: {
            email: input.email,
            phone: input.phone,
            firstName: input.firstName,
            lastName: input.lastName,
            city: input.city,
            country: input.country,
            zip: input.zip,
            clientIpAddress: hints.clientIpAddress,
            clientUserAgent: hints.clientUserAgent,
            fbp: input.fbp ?? hints.fbp,
            fbc: input.fbc ?? hints.fbc,
            externalId: input.email,
          },
          customData: {
            value: input.value,
            currency: input.currency,
            contentName: input.contentName,
            contentIds: input.contentIds,
            contentType: input.contentIds?.length ? "product" : undefined,
            contents: input.contents,
            numItems: input.numItems,
            orderId: input.orderId,
          },
        });
        results.meta = { ok: result.ok, error: result.error };
      }
    }

    if (pinConfig) {
      if (
        !isPinterestCapiEventEnabled(
          pinConfig,
          input.eventName as PinterestCapiEventName
        )
      ) {
        results.pinterest = { ok: true, skipped: true, reason: "event_disabled" };
      } else {
        const result = await sendPinterestCapiEvent({
          adAccountId: pinConfig.adAccountId,
          accessToken: pinConfig.accessToken,
          eventName: input.eventName as PinterestCapiEventName,
          eventId: input.eventId,
          eventSourceUrl: input.eventSourceUrl ?? null,
          testMode: pinConfig.testMode,
          diagnostics: {
            storeId: store.id,
            source: "storefront",
            testMode: pinConfig.testMode,
          },
          userData: {
            email: input.email,
            phone: input.phone,
            firstName: input.firstName,
            lastName: input.lastName,
            city: input.city,
            country: input.country,
            zip: input.zip,
            clientIpAddress: hints.clientIpAddress,
            clientUserAgent: hints.clientUserAgent,
            externalId: input.email,
          },
          customData: {
            value: input.value,
            currency: input.currency,
            contentName: input.contentName,
            contentIds: input.contentIds,
            contentType: input.contentIds?.length ? "product" : undefined,
            contents: input.contents,
            numItems: input.numItems,
            orderId: input.orderId,
          },
        });
        results.pinterest = { ok: result.ok, error: result.error };
      }
    }

    const anyOk =
      results.meta?.ok === true ||
      results.pinterest?.ok === true ||
      results.meta?.skipped === true ||
      results.pinterest?.skipped === true;

    return NextResponse.json({
      ok: anyOk,
      skipped: false,
      ...results,
    });
  } catch (error) {
    console.error("[marketing/capi]", error);
    return NextResponse.json({ message: "CAPI request failed" }, { status: 500 });
  }
}
