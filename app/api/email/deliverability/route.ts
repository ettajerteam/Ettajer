import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedStore } from "@/lib/products";
import { getDeliverabilityBundle } from "@/lib/email-marketing/deliverability";
import {
  deleteSendingDomain,
  upsertSendingDomain,
  verifySendingDomain,
} from "@/lib/email-marketing/sending-domains";
import {
  listEmailSuppressions,
  removeEmailSuppression,
  upsertEmailSuppression,
} from "@/lib/email-marketing/suppression";
import { EMAIL_SEND_PROVIDERS } from "@/lib/email-marketing/providers/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    if (searchParams.get("view") === "suppressions") {
      const reason = searchParams.get("reason")?.trim() || undefined;
      const suppressions = await listEmailSuppressions(store.id, {
        take: 200,
        reason,
      });
      return NextResponse.json({ suppressions });
    }

    const bundle = await getDeliverabilityBundle(store.id);
    return NextResponse.json(bundle);
  } catch (error) {
    console.error("[email/deliverability GET]", error);
    return NextResponse.json(
      { message: "Failed to load deliverability" },
      { status: 500 }
    );
  }
}

const postSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("add_domain"),
    domain: z.string().trim().min(3).max(253),
    provider: z.enum(EMAIL_SEND_PROVIDERS).optional(),
  }),
  z.object({
    action: z.literal("verify_domain"),
    domainId: z.string().min(1),
  }),
  z.object({
    action: z.literal("delete_domain"),
    domainId: z.string().min(1),
  }),
  z.object({
    action: z.literal("add_suppression"),
    email: z.string().email().max(320),
    reason: z.enum(["manual", "bounce", "complaint", "unsubscribe"]).default("manual"),
  }),
  z.object({
    action: z.literal("remove_suppression"),
    email: z.string().email().max(320),
  }),
]);

export async function POST(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const parsed = postSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const data = parsed.data;
    switch (data.action) {
      case "add_domain": {
        const domain = await upsertSendingDomain({
          storeId: store.id,
          domain: data.domain,
          provider: data.provider,
        });
        return NextResponse.json({ domain }, { status: 201 });
      }
      case "verify_domain": {
        const result = await verifySendingDomain(store.id, data.domainId);
        return NextResponse.json(result);
      }
      case "delete_domain": {
        await deleteSendingDomain(store.id, data.domainId);
        return NextResponse.json({ ok: true });
      }
      case "add_suppression": {
        await upsertEmailSuppression({
          storeId: store.id,
          email: data.email,
          reason: data.reason,
          bounceType: data.reason === "bounce" ? "hard" : null,
          source: "merchant",
        });
        return NextResponse.json({ ok: true }, { status: 201 });
      }
      case "remove_suppression": {
        await removeEmailSuppression(store.id, data.email);
        return NextResponse.json({ ok: true });
      }
      default:
        return NextResponse.json({ message: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("[email/deliverability POST]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Deliverability action failed",
      },
      { status: 400 }
    );
  }
}
