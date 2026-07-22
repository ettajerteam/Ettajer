import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  createContactSubmission,
  isValidContactEmail,
} from "@/lib/contact-submissions";

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
      name?: string;
      email?: string;
      phone?: string;
      message?: string;
    } | null;

    const name = typeof body?.name === "string" ? body.name : "";
    const email = typeof body?.email === "string" ? body.email : "";
    const message = typeof body?.message === "string" ? body.message : "";
    const phone = typeof body?.phone === "string" ? body.phone : undefined;

    if (!name.trim()) {
      return NextResponse.json({ message: "Enter your name" }, { status: 400 });
    }
    if (!isValidContactEmail(email)) {
      return NextResponse.json({ message: "Enter a valid email address" }, { status: 400 });
    }
    if (!message.trim()) {
      return NextResponse.json({ message: "Enter a message" }, { status: 400 });
    }

    await createContactSubmission({
      storeId: store.id,
      name,
      email,
      message,
      phone,
    });

    return NextResponse.json({ ok: true, message: "Message sent — we'll get back to you soon" });
  } catch (error) {
    console.error("Contact submit error:", error);
    return NextResponse.json({ message: "Failed to send message" }, { status: 500 });
  }
}
