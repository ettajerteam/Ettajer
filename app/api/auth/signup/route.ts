import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { normalizeEmail } from "@/lib/password-reset";
import {
  formatSignupFullName,
  signupSchema,
} from "@/lib/validations/signup";
import {
  issueActivationCode,
  initResendCooldown,
  canResendActivationCode,
  recordActivationResend,
  clearActivationAttempts,
} from "@/lib/account-activation";
import {
  assignFounderNumber,
  isFounderSlotsFull,
  USER_STATUS,
} from "@/lib/founder";
import { sendActivationCodeEmail } from "@/lib/email/automations";
import { resolveRequestEmailLocale } from "@/lib/email/email-locale";
import { isResendConfigured } from "@/lib/resend";
import { logPlatformError } from "@/lib/admin/platform-errors";
import { Prisma } from "@prisma/client";
import {
  AUTH_SECURITY,
  getClientIp,
  getUserAgent,
  isRateLimited,
  recordAuthEvent,
} from "@/lib/auth-security";

async function sendActivationForUser(
  email: string,
  name: string,
  locale?: string | null,
) {
  const code = await issueActivationCode(email);
  if (!code) return false;

  await initResendCooldown(email);

  if (isResendConfigured()) {
    await sendActivationCodeEmail(email, name, code, locale).catch((err) =>
      console.error("Activation email failed:", err),
    );
  }

  return true;
}

async function persistSignupPreferences(
  userId: string,
  marketingEmails: boolean,
  termsAcceptedAt: Date,
) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      marketingEmails,
      termsAcceptedAt,
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      const message =
        parsed.error.errors[0]?.message ?? "Invalid signup details.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const {
      firstName,
      surname,
      email,
      password,
      marketingEmails,
      locale: bodyLocale,
    } = parsed.data;
    const emailLocale = resolveRequestEmailLocale(request, bodyLocale);
    const name = formatSignupFullName(firstName, surname);
    const normalizedEmail = normalizeEmail(email);
    const termsAcceptedAt = new Date();
    const ipAddress = getClientIp(request);
    const userAgent = getUserAgent(request);

    const rateLimited = await isRateLimited({
      email: normalizedEmail,
      action: "signup",
      maxAttempts: AUTH_SECURITY.signupMaxPerHour,
      windowMs: 60 * 60 * 1000,
    });

    if (rateLimited) {
      await recordAuthEvent({
        email: normalizedEmail,
        action: "signup",
        success: false,
        reason: "rate_limited",
        ipAddress,
        userAgent,
      });
      return NextResponse.json(
        {
          error:
            "Too many signup attempts for this email. Please wait about an hour, or go to activation if you already started.",
        },
        { status: 429 },
      );
    }

    if (await isFounderSlotsFull()) {
      return NextResponse.json(
        {
          error:
            "All 100 founder spots have been claimed. Join the waitlist soon.",
        },
        { status: 403 },
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true, emailVerified: true, founderNumber: true },
    });

    if (existing) {
      if (!existing.emailVerified) {
        const passwordHash = await bcrypt.hash(password, 12);
        await prisma.user.update({
          where: { email: normalizedEmail },
          data: {
            name,
            passwordHash,
          },
        });
        await persistSignupPreferences(existing.id, marketingEmails ?? false, termsAcceptedAt);
        await clearActivationAttempts(normalizedEmail);
        await sendActivationForUser(normalizedEmail, name, emailLocale);
        await recordAuthEvent({
          email: normalizedEmail,
          action: "signup",
          success: true,
          reason: "resume_unverified",
          ipAddress,
          userAgent,
          userId: existing.id,
        });
        return NextResponse.json({
          success: true,
          needsActivation: true,
          email: normalizedEmail,
        });
      }

      await recordAuthEvent({
        email: normalizedEmail,
        action: "signup",
        success: false,
        reason: "email_exists",
        ipAddress,
        userAgent,
        userId: existing.id,
      });
      return NextResponse.json(
        { error: "An account with this email already exists. Try signing in instead." },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        status: USER_STATUS.WAITING,
      },
      select: { id: true, name: true, email: true },
    });

    await persistSignupPreferences(user.id, marketingEmails ?? false, termsAcceptedAt);

    const founderNumber = await assignFounderNumber(user.id);

    if (!founderNumber) {
      await prisma.user.delete({ where: { id: user.id } });
      return NextResponse.json(
        {
          error:
            "All 100 founder spots have been claimed. Join the waitlist soon.",
        },
        { status: 403 },
      );
    }

    await sendActivationForUser(normalizedEmail, user.name ?? name, emailLocale);

    await recordAuthEvent({
      email: normalizedEmail,
      action: "signup",
      success: true,
      reason: "created",
      ipAddress,
      userAgent,
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      needsActivation: true,
      email: user.email,
    });
  } catch (error) {
    console.error("Signup error:", error);

    await logPlatformError({
      source: "api/auth/signup",
      message: error instanceof Error ? error.message : "Signup error",
      stack: error instanceof Error ? error.stack : undefined,
      path: "/api/auth/signup",
      metadata: {
        code: error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined,
      },
    });

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "An account with this email already exists. Try signing in instead." },
        { status: 409 },
      );
    }

    if (
      error instanceof Prisma.PrismaClientInitializationError ||
      (error instanceof Error &&
        /connect|database|ECONNREFUSED|timeout/i.test(error.message))
    ) {
      return NextResponse.json(
        {
          error:
            "Our servers are temporarily unavailable. Please try again in a few minutes.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Unable to create account. Please try again." },
      { status: 500 },
    );
  }
}
