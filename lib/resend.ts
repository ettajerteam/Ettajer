import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResendApiKey(): string | undefined {
  return (
    process.env.RESEND_API_KEY?.trim() ||
    process.env.EMAIL_SERVER_PASSWORD?.trim()
  );
}

export function getResend(): Resend {
  const apiKey = getResendApiKey();

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set in .env");
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
}

export function isResendConfigured(): boolean {
  return !!getResendApiKey();
}

export function getEmailFrom(): string {
  return process.env.EMAIL_FROM ?? "Ettajer <noreply@ettajer.com>";
}

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string | string[];
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType?: string;
    /** Reference in HTML as src="cid:your-id" */
    inlineContentId?: string;
  }[];
}

export async function sendEmail({
  to,
  subject,
  html,
  from,
  replyTo,
  attachments,
}: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  if (!isResendConfigured()) {
    console.warn("Resend not configured — skipping email");
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const resend = getResend();
    const { error } = await resend.emails.send({
      from: from ?? getEmailFrom(),
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      replyTo: replyTo
        ? Array.isArray(replyTo)
          ? replyTo
          : [replyTo]
        : undefined,
      attachments: attachments?.map((file) => ({
        filename: file.filename,
        content: file.content,
        contentType: file.contentType,
        inlineContentId: file.inlineContentId,
      })),
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to send email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
