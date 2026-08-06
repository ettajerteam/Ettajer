import { NextResponse } from "next/server";
import { z } from "zod";
import {
  applyResubscribeFromToken,
  applyUnsubscribeFromToken,
  getStoreComplianceIdentity,
  resolveTokenToContact,
} from "@/lib/email-marketing/compliance";
import { formatSubscriberStatusLabel } from "@/lib/newsletter";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const token = new URL(request.url).searchParams.get("t")?.trim();
    if (!token) {
      return NextResponse.json({ message: "Missing token" }, { status: 400 });
    }

    const contact = await resolveTokenToContact(token);
    if (!contact) {
      return NextResponse.json(
        { message: "Invalid or expired link" },
        { status: 400 }
      );
    }

    const store = await getStoreComplianceIdentity(contact.storeId);
    if (!store) {
      return NextResponse.json({ message: "Store not found" }, { status: 404 });
    }

    return NextResponse.json({
      email: contact.email,
      status: contact.status ?? "unknown",
      statusLabel: contact.status
        ? formatSubscriberStatusLabel(contact.status)
        : "Not on list",
      store: {
        name: store.name,
        slug: store.slug,
        address: store.address,
        contactEmail: store.contactEmail,
      },
    });
  } catch (error) {
    console.error("[email/preferences GET]", error);
    return NextResponse.json(
      { message: "Failed to load preferences" },
      { status: 500 }
    );
  }
}

const bodySchema = z.object({
  t: z.string().min(1),
  action: z.enum(["unsubscribe", "subscribe"]),
});

export async function POST(request: Request) {
  try {
    const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const result =
      parsed.data.action === "unsubscribe"
        ? await applyUnsubscribeFromToken(parsed.data.t)
        : await applyResubscribeFromToken(parsed.data.t);

    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      message: result.message,
      email: result.email,
    });
  } catch (error) {
    console.error("[email/preferences POST]", error);
    return NextResponse.json(
      { message: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
