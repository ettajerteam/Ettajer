import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  isValidSubscriberEmail,
  subscribeToNewsletter,
} from "@/lib/newsletter";

interface RouteParams {
  params: { slug: string };
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const store = await prisma.store.findUnique({
      where: { slug: params.slug },
      select: { id: true },
    });
    if (!store) {
      return NextResponse.json({ message: "Store not found" }, { status: 404 });
    }

    const body = (await request.json().catch(() => null)) as {
      email?: string;
      source?: string;
    } | null;

    const email = typeof body?.email === "string" ? body.email : "";
    if (!isValidSubscriberEmail(email)) {
      return NextResponse.json({ message: "Enter a valid email address" }, { status: 400 });
    }

    const source =
      typeof body?.source === "string" && body.source.trim()
        ? body.source.trim().slice(0, 64)
        : "newsletter";

    const result = await subscribeToNewsletter({
      storeId: store.id,
      email,
      source,
    });

    const message = result.created
      ? "You're on the list"
      : result.reactivated
        ? "Welcome back — you're subscribed again"
        : "You're already subscribed";

    return NextResponse.json({ ok: true, message, ...result });
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return NextResponse.json({ message: "Failed to subscribe" }, { status: 500 });
  }
}
