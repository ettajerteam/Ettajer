import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedStore } from "@/lib/products";
import {
  deleteNewsletterSubscriber,
  listNewsletterSubscribers,
  serializeNewsletterSubscriber,
  setNewsletterSubscriberStatus,
} from "@/lib/newsletter";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const subscribers = await listNewsletterSubscribers(store.id, {
      status: "all",
    });
    return NextResponse.json({
      subscribers: subscribers.map(serializeNewsletterSubscriber),
      count: subscribers.length,
    });
  } catch (error) {
    console.error("Newsletter list error:", error);
    return NextResponse.json(
      { message: "Failed to load subscribers" },
      { status: 500 }
    );
  }
}

const patchSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["active", "unsubscribed", "bounced", "complained"]),
});

export async function PATCH(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const parsed = patchSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const row = await setNewsletterSubscriberStatus(
      parsed.data.id,
      store.id,
      parsed.data.status
    );
    return NextResponse.json({
      subscriber: serializeNewsletterSubscriber(row),
    });
  } catch (error) {
    console.error("Newsletter patch error:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to update subscriber",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const id = new URL(request.url).searchParams.get("id")?.trim();
    if (!id) {
      return NextResponse.json({ message: "Missing id" }, { status: 400 });
    }

    await deleteNewsletterSubscriber(id, store.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Newsletter delete error:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to delete subscriber",
      },
      { status: 400 }
    );
  }
}
