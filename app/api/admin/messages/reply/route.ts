import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin/auth";
import { logAdminAction } from "@/lib/admin/audit";
import {
  SUPPORT_MESSAGE_DIRECTION,
  SUPPORT_MESSAGE_STATUS,
} from "@/lib/admin/constants";
import { recordOutboundSupportMessage } from "@/lib/admin/record-outbound-support-message";
import { sendEmail, isResendConfigured } from "@/lib/resend";
import { SUPPORT_EMAIL } from "@/lib/constants/support";
import { escapeHtml, buildModernEmailHtml } from "@/lib/email/base-template";
import { getEmailCopy } from "@/lib/email/email-i18n";

const replySchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(120),
  topic: z.string().min(1).max(200),
  message: z.string().trim().min(1).max(8000),
  locale: z.enum(["en", "fr", "ar"]).optional(),
});

export async function POST(request: Request) {
  const { error, session } = await requireAdminApi();
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const parsed = replySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.errors[0]?.message ?? "Invalid reply" },
      { status: 400 }
    );
  }

  const { email, name, topic, message, locale = "en" } = parsed.data;
  const subject = `Re: ${topic}`;

  if (isResendConfigured()) {
    const copy = getEmailCopy(locale);
    const html = buildModernEmailHtml({
      locale,
      shell: copy.shell,
      previewText: subject,
      title: subject,
      badge: "Ettajer Support",
      badgeColor: "#eff6ff",
      greeting: locale === "ar" ? `مرحباً ${escapeHtml(name)}،` : `Hi ${escapeHtml(name)},`,
      body: escapeHtml(message).replace(/\n/g, "<br />"),
      footerNote:
        locale === "ar"
          ? "رد على هذا البريد لمتابعة المحادثة مع دعم Ettajer."
          : "Reply to this email to continue the conversation with Ettajer Support.",
      accentFrom: "#0a0a0a",
      accentTo: "#404040",
    });

    const sent = await sendEmail({
      to: email,
      subject,
      html,
      replyTo: SUPPORT_EMAIL,
    });

    if (!sent.success) {
      return NextResponse.json(
        { message: sent.error ?? "Failed to send email" },
        { status: 500 }
      );
    }
  }

  const outbound = await recordOutboundSupportMessage({
    email,
    topic,
    message,
  });

  // Mark prior inbound messages in this thread as read
  await prisma.supportMessage.updateMany({
    where: {
      email: { equals: email, mode: "insensitive" },
      direction: SUPPORT_MESSAGE_DIRECTION.INBOUND,
      status: {
        in: [
          SUPPORT_MESSAGE_STATUS.NEW,
          SUPPORT_MESSAGE_STATUS.REVIEWING,
        ],
      },
    },
    data: { status: SUPPORT_MESSAGE_STATUS.READ },
  });

  await logAdminAction({
    actorId: session!.user!.id,
    actorEmail: session!.user!.email ?? "unknown",
    action: "message.reply",
    targetType: "support_message",
    targetId: outbound.id,
    metadata: { to: email, topic },
  });

  return NextResponse.json({ message: outbound });
}
