import { NextResponse } from "next/server";

import { forgotPasswordSchema } from "@/lib/validations/auth";

import {

  AUTH_SECURITY,

  getClientIp,

  getUserAgent,

  isRateLimited,

  recordAuthEvent,

} from "@/lib/auth-security";

import {

  buildResetPasswordUrl,

  issuePasswordResetToken,

  normalizeEmail,

} from "@/lib/password-reset";

import { sendPasswordResetEmail } from "@/lib/email";

import { resolveRequestEmailLocale } from "@/lib/email/email-locale";

import { isResendConfigured } from "@/lib/resend";



const GENERIC_MESSAGE =

  "If an account with that email exists, we've sent password reset instructions.";



import { getAppUrl } from "@/lib/app-url";

function getBaseUrl(_request: Request): string {
  return getAppUrl();
}



export async function POST(request: Request) {

  try {

    const body = await request.json();

    const parsed = forgotPasswordSchema.safeParse(body);



    if (!parsed.success) {

      return NextResponse.json(

        { message: parsed.error.errors[0]?.message ?? "Invalid email" },

        { status: 400 },

      );

    }



    const email = normalizeEmail(parsed.data.email);
    const emailLocale = resolveRequestEmailLocale(request, parsed.data.locale);

    const ipAddress = getClientIp(request);

    const userAgent = getUserAgent(request);



    const rateLimited = await isRateLimited({

      email,

      action: "forgot_password",

      maxAttempts: AUTH_SECURITY.forgotPasswordMaxPerHour,

      windowMs: 60 * 60 * 1000,

    });



    if (rateLimited) {

      await recordAuthEvent({

        email,

        action: "forgot_password",

        success: false,

        reason: "rate_limited",

        ipAddress,

        userAgent,

      });



      return NextResponse.json(

        { message: "Too many reset requests. Try again in about an hour." },

        { status: 429 },

      );

    }



    const token = await issuePasswordResetToken(email);



    if (token) {

      const resetUrl = buildResetPasswordUrl(getBaseUrl(request), email, token);



      if (isResendConfigured()) {

        const sent = await sendPasswordResetEmail(email, resetUrl, emailLocale);

        if (!sent) {

          await recordAuthEvent({

            email,

            action: "forgot_password",

            success: false,

            reason: "email_failed",

            ipAddress,

            userAgent,

          });



          return NextResponse.json(

            { message: "Unable to send reset email. Try again shortly." },

            { status: 500 },

          );

        }

      } else {

        console.info("[forgot-password] Resend not configured — reset link:", {

          email,

          resetUrl,

        });

      }



      await recordAuthEvent({

        email,

        action: "forgot_password",

        success: true,

        reason: "email_sent",

        ipAddress,

        userAgent,

      });

    } else {

      await recordAuthEvent({

        email,

        action: "forgot_password",

        success: true,

        reason: "unknown_email",

        ipAddress,

        userAgent,

      });

    }



    return NextResponse.json({ message: GENERIC_MESSAGE });

  } catch (error) {

    console.error("Forgot password error:", error);

    return NextResponse.json(

      {

        message:

          error instanceof Error ? error.message : "Failed to process request",

      },

      { status: 500 },

    );

  }

}
