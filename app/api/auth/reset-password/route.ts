import { NextResponse } from "next/server";

import { resetPasswordSchema } from "@/lib/validations/auth";

import {

  AUTH_SECURITY,

  getClientIp,

  getUserAgent,

  isRateLimited,

  recordAuthEvent,

  recordPasswordChanged,

} from "@/lib/auth-security";

import {

  consumeResetToken,

  normalizeEmail,

  updateUserPassword,

  validateResetToken,

} from "@/lib/password-reset";

import { sendPasswordChangedEmail } from "@/lib/email";

import { resolveRequestEmailLocale } from "@/lib/email/email-locale";

import { isResendConfigured } from "@/lib/resend";



export async function POST(request: Request) {

  try {

    const body = await request.json();

    const parsed = resetPasswordSchema.safeParse(body);



    if (!parsed.success) {

      return NextResponse.json(

        { message: parsed.error.errors[0]?.message ?? "Invalid form data" },

        { status: 400 },

      );

    }



    const { email, token, password, locale: bodyLocale } = parsed.data;

    const normalized = normalizeEmail(email);
    const emailLocale = resolveRequestEmailLocale(request, bodyLocale);

    const ipAddress = getClientIp(request);

    const userAgent = getUserAgent(request);



    const rateLimited = await isRateLimited({

      email: normalized,

      action: "reset_password",

      maxAttempts: AUTH_SECURITY.resetPasswordMaxPerHour,

      windowMs: 60 * 60 * 1000,

    });



    if (rateLimited) {

      await recordAuthEvent({

        email: normalized,

        action: "reset_password",

        success: false,

        reason: "rate_limited",

        ipAddress,

        userAgent,

      });



      return NextResponse.json(

        { message: "Too many reset attempts. Try again later." },

        { status: 429 },

      );

    }



    const valid = await validateResetToken(normalized, token);



    if (!valid) {

      await recordAuthEvent({

        email: normalized,

        action: "reset_password",

        success: false,

        reason: "invalid_token",

        ipAddress,

        userAgent,

      });



      return NextResponse.json(

        { message: "This reset link is invalid or has expired." },

        { status: 400 },

      );

    }



    const updated = await updateUserPassword(normalized, password);

    if (!updated) {

      return NextResponse.json(

        { message: "Unable to update password. Try again." },

        { status: 500 },

      );

    }



    await consumeResetToken(normalized, token);

    await recordPasswordChanged(normalized);



    await recordAuthEvent({

      email: normalized,

      action: "reset_password",

      success: true,

      reason: "password_updated",

      ipAddress,

      userAgent,

    });



    if (isResendConfigured()) {

      await sendPasswordChangedEmail(normalized, emailLocale);

    }



    return NextResponse.json({

      message: "Password updated. You can sign in with your new password.",

    });

  } catch (error) {

    console.error("Reset password error:", error);

    return NextResponse.json(

      {

        message:

          error instanceof Error ? error.message : "Failed to reset password",

      },

      { status: 500 },

    );

  }

}
