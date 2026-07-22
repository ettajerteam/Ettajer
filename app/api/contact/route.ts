import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isResendConfigured } from "@/lib/resend";
import { SUPPORT_EMAIL } from "@/lib/constants/support";
import {
  sendSupportConfirmationEmail,
  sendSupportTicketEmail,
} from "@/lib/email/automations";
import { resolveRequestEmailLocale } from "@/lib/email/email-locale";
import {
  getContactApiCopy,
  getContactTopicLabel,
  localizeContactValidationMessage,
} from "@/lib/contact/contact-i18n";
import { contactSupportSchema } from "@/lib/validations/contact";
import { logPlatformError } from "@/lib/admin/platform-errors";
import { recordOutboundSupportMessage } from "@/lib/admin/record-outbound-support-message";
import { supportConfirmationInboxMessage } from "@/lib/admin/support-outbound-messages";
import { getEmailCopy } from "@/lib/email/email-i18n";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSupportSchema.safeParse(body);
    const emailLocale = resolveRequestEmailLocale(
      request,
      typeof body?.locale === "string" ? body.locale : undefined,
    );
    const apiCopy = getContactApiCopy(emailLocale);

    if (!parsed.success) {
      const rawMessage = parsed.error.errors[0]?.message;
      return NextResponse.json(
        {
          message: localizeContactValidationMessage(emailLocale, rawMessage),
        },
        { status: 400 },
      );
    }

    const { name, email, topic, message, articleRef } = parsed.data;
    const topicName = getContactTopicLabel(emailLocale, topic);
    const subject = `[Ettajer Support] ${topicName} — ${name}`;

    await prisma.supportMessage.create({
      data: {
        name,
        email,
        topic: topicName,
        message,
        articleRef: articleRef ?? null,
        status: "reviewing",
      },
    });

    if (isResendConfigured()) {
      const ticketSent = await sendSupportTicketEmail({
        name,
        email,
        topic: topicName,
        message,
        articleRef,
        subject,
        locale: emailLocale,
      });

      if (!ticketSent) {
        return NextResponse.json(
          { message: apiCopy.failedToSend },
          { status: 500 },
        );
      }

      const confirmationSent = await sendSupportConfirmationEmail(
        email,
        name,
        topicName,
        emailLocale,
      );

      if (!confirmationSent) {
        console.warn("[contact] Ticket sent but confirmation email failed");
      } else {
        await recordOutboundSupportMessage({
          email,
          topic: getEmailCopy(emailLocale).supportConfirmation.subject,
          message: supportConfirmationInboxMessage(topicName, emailLocale),
          articleRef: articleRef ?? null,
        });
      }
    } else {
      await recordOutboundSupportMessage({
        email,
        topic: getEmailCopy(emailLocale).supportConfirmation.subject,
        message: supportConfirmationInboxMessage(topicName, emailLocale),
        articleRef: articleRef ?? null,
      });
      console.info("[contact] Resend not configured — support request logged:", {
        name,
        email,
        topic,
        message,
        articleRef,
        supportInbox: SUPPORT_EMAIL,
      });
    }

    return NextResponse.json({
      message: apiCopy.success,
      supportEmail: SUPPORT_EMAIL,
    });
  } catch (error) {
    console.error("Contact support error:", error);
    const emailLocale = resolveRequestEmailLocale(request);
    const apiCopy = getContactApiCopy(emailLocale);

    await logPlatformError({
      source: "api/contact",
      message: error instanceof Error ? error.message : "Contact support error",
      stack: error instanceof Error ? error.stack : undefined,
      path: "/api/contact",
    });

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : apiCopy.failedToSend,
      },
      { status: 500 },
    );
  }
}
