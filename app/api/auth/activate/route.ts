import { NextResponse } from "next/server";
import { z } from "zod";
import { emailLocaleSchema } from "@/lib/validations/auth";
import { activateUserAccount } from "@/lib/account-activation";
import { sendFounderWelcomeEmail } from "@/lib/email/automations";
import { resolveRequestEmailLocale } from "@/lib/email/email-locale";
import { isResendConfigured } from "@/lib/resend";

const activateSchema = z.object({
  email: z.string().trim().email(),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code from your email."),
  locale: emailLocaleSchema,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = activateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid activation details." },
        { status: 400 },
      );
    }

    const { email, code } = parsed.data;
    const emailLocale = resolveRequestEmailLocale(request, parsed.data.locale);
    const result = await activateUserAccount(email, code);

    if (!result.success || !result.user) {
      return NextResponse.json(
        {
          error: result.error ?? "Activation failed.",
          attemptsRemaining: result.attemptsRemaining,
        },
        { status: 400 },
      );
    }

    const { user } = result;

    if (user.founderNumber && isResendConfigured()) {
      await sendFounderWelcomeEmail(
        user.email,
        user.name ?? "Founder",
        user.founderNumber,
        emailLocale,
      ).catch((err) => console.error("Founder welcome email failed:", err));
    }

    return NextResponse.json({
      success: true,
      email: user.email,
      founderNumber: user.founderNumber,
    });
  } catch (error) {
    console.error("Activation error:", error);
    return NextResponse.json(
      { error: "Unable to activate account. Please try again." },
      { status: 500 },
    );
  }
}
