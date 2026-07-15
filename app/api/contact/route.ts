import { NextResponse } from "next/server";
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
      }
    } else {
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
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : apiCopy.failedToSend,
      },
      { status: 500 },
    );
  }
}
