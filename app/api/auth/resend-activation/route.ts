import { NextResponse } from "next/server";
import { z } from "zod";
import { emailLocaleSchema } from "@/lib/validations/auth";
import { prisma } from "@/lib/db";
import { normalizeEmail } from "@/lib/password-reset";
import {
  issueActivationCode,
  canResendActivationCode,
  recordActivationResend,
  clearActivationAttempts,
} from "@/lib/account-activation";
import { sendActivationCodeEmail } from "@/lib/email/automations";
import { resolveRequestEmailLocale } from "@/lib/email/email-locale";
import { isResendConfigured } from "@/lib/resend";

const resendSchema = z.object({
  email: z.string().trim().email(),
  locale: emailLocaleSchema,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resendSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const normalizedEmail = normalizeEmail(parsed.data.email);
    const emailLocale = resolveRequestEmailLocale(request, parsed.data.locale);
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { name: true, emailVerified: true },
    });

    if (!user) {
      return NextResponse.json({ success: true });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: "This account is already activated." }, { status: 400 });
    }

    const cooldown = await canResendActivationCode(normalizedEmail);
    if (!cooldown.allowed) {
      return NextResponse.json(
        {
          error: `Please wait ${cooldown.secondsRemaining} seconds before requesting a new code.`,
          secondsRemaining: cooldown.secondsRemaining,
          resendCount: cooldown.resendCount,
        },
        { status: 429 },
      );
    }

    const code = await issueActivationCode(normalizedEmail);
    if (!code) {
      return NextResponse.json({ error: "Unable to send activation code." }, { status: 400 });
    }

    await clearActivationAttempts(normalizedEmail);

    const { nextCooldownSeconds, resendCount } =
      await recordActivationResend(normalizedEmail);

    if (isResendConfigured()) {
      await sendActivationCodeEmail(
        normalizedEmail,
        user.name ?? "Founder",
        code,
        emailLocale,
      ).catch((err) => console.error("Resend activation email failed:", err));
    }

    return NextResponse.json({
      success: true,
      resendCount,
      nextCooldownSeconds,
    });
  } catch (error) {
    console.error("Resend activation error:", error);
    return NextResponse.json(
      { error: "Unable to resend code. Please try again." },
      { status: 500 },
    );
  }
}
