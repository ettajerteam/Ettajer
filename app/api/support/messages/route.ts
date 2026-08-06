import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import {
  SUPPORT_MESSAGE_DIRECTION,
  SUPPORT_MESSAGE_STATUS,
} from "@/lib/admin/constants";
import { recordOutboundSupportMessage } from "@/lib/admin/record-outbound-support-message";
import { isResendConfigured } from "@/lib/resend";
import { sendSupportTicketEmail } from "@/lib/email/automations";
import { SUPPORT_EMAIL } from "@/lib/constants/support";

const WELCOME_TOPIC = "Welcome";
const WELCOME_MESSAGE =
  "Hi! You’re chatting with the verified Ettajer team. Ask us anything about your store, billing, or setup — we’re here to help.";

const postSchema = z.object({
  message: z.string().trim().min(1).max(5000),
  topic: z.string().trim().min(1).max(120).optional(),
});

function serialize(row: {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  direction: string;
  status: string;
  createdAt: Date;
}) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    topic: row.topic,
    message: row.message,
    direction: row.direction,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    verified: row.direction === SUPPORT_MESSAGE_DIRECTION.OUTBOUND,
  };
}

async function ensureWelcomeMessage(email: string) {
  const existing = await prisma.supportMessage.count({
    where: { email: { equals: email, mode: "insensitive" } },
  });
  if (existing > 0) return;

  await recordOutboundSupportMessage({
    email,
    topic: WELCOME_TOPIC,
    message: WELCOME_MESSAGE,
    articleRef: "dashboard-welcome",
  });
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email.trim().toLowerCase();
    await ensureWelcomeMessage(email);

    const rows = await prisma.supportMessage.findMany({
      where: { email: { equals: email, mode: "insensitive" } },
      orderBy: { createdAt: "asc" },
      take: 200,
    });

    const unreadFromTeam = rows.filter(
      (r) =>
        r.direction === SUPPORT_MESSAGE_DIRECTION.OUTBOUND &&
        r.status !== SUPPORT_MESSAGE_STATUS.READ &&
        r.articleRef !== "dashboard-welcome"
    ).length;

    if (unreadFromTeam > 0) {
      await prisma.supportMessage.updateMany({
        where: {
          email: { equals: email, mode: "insensitive" },
          direction: SUPPORT_MESSAGE_DIRECTION.OUTBOUND,
          status: { not: SUPPORT_MESSAGE_STATUS.READ },
        },
        data: { status: SUPPORT_MESSAGE_STATUS.READ },
      });
    }

    return NextResponse.json({
      messages: rows.map(serialize),
      unread: unreadFromTeam,
      team: {
        name: "Ettajer team",
        verified: true,
        subtitle: "Official support",
      },
    });
  } catch (error) {
    console.error("Support messages GET error:", error);
    return NextResponse.json(
      { message: "Failed to load messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message ?? "Invalid message" },
        { status: 400 }
      );
    }

    const email = session.user.email.trim().toLowerCase();
    const name =
      session.user.name?.trim() ||
      email.split("@")[0] ||
      "Merchant";
    const topic = parsed.data.topic?.trim() || "Dashboard chat";
    const message = parsed.data.message;

    const row = await prisma.supportMessage.create({
      data: {
        name,
        email,
        topic,
        message,
        direction: SUPPORT_MESSAGE_DIRECTION.INBOUND,
        status: SUPPORT_MESSAGE_STATUS.NEW,
      },
    });

    if (isResendConfigured()) {
      void sendSupportTicketEmail({
        name,
        email,
        topic,
        message,
        subject: `[Ettajer Support] ${topic} — ${name}`,
      }).catch((err) =>
        console.error("[support/messages] ticket email failed", err)
      );
    } else {
      console.info("[support/messages] logged for", SUPPORT_EMAIL, { email, topic });
    }

    return NextResponse.json({ message: serialize(row) }, { status: 201 });
  } catch (error) {
    console.error("Support messages POST error:", error);
    return NextResponse.json(
      { message: "Failed to send message" },
      { status: 500 }
    );
  }
}
