import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { isResendConfigured } from "@/lib/resend";
import {
  sendWelcomeEmail,
  sendFounderWelcomeEmail,
} from "@/lib/email/automations";
import { getEmailLocaleFromCookieHeader } from "@/lib/email/email-locale";
import { assignFounderNumber, isFounderSlotsFull, USER_STATUS } from "@/lib/founder";
import { parseOAuthSignupCookies } from "@/lib/auth/oauth-signup";
import {
  verifyGoogleIdToken,
  type GoogleIdTokenPayload,
} from "@/lib/auth/google-id-token";

async function provisionNewGoogleUser(
  userId: string,
  email: string,
  name: string | null,
) {
  const headerList = await headers();
  const locale = getEmailLocaleFromCookieHeader(headerList.get("cookie"));
  const oauthPrefs = parseOAuthSignupCookies(headerList.get("cookie"));

  if (oauthPrefs.termsAccepted || oauthPrefs.marketingEmails) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        termsAcceptedAt: oauthPrefs.termsAccepted ? new Date() : undefined,
        marketingEmails: oauthPrefs.marketingEmails,
      },
    });
  }

  if (await isFounderSlotsFull()) {
    if (isResendConfigured()) {
      await sendWelcomeEmail(email, name, locale).catch((err) =>
        console.error("Welcome email failed:", err),
      );
    }
    return;
  }

  const founderNumber = await assignFounderNumber(userId);
  if (founderNumber && isResendConfigured()) {
    await sendFounderWelcomeEmail(
      email,
      name ?? "Founder",
      founderNumber,
      locale,
    ).catch((err) => console.error("Founder welcome email failed:", err));
  } else if (isResendConfigured()) {
    await sendWelcomeEmail(email, name, locale).catch((err) =>
      console.error("Welcome email failed:", err),
    );
  }
}

async function ensureGoogleAccountLink(
  userId: string,
  payload: GoogleIdTokenPayload,
  idToken: string,
) {
  const existing = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: "google",
        providerAccountId: payload.sub,
      },
    },
    select: { id: true, userId: true },
  });

  if (existing) {
    if (existing.userId !== userId) {
      throw new Error("GOOGLE_ACCOUNT_LINKED_ELSEWHERE");
    }
    return;
  }

  await prisma.account.create({
    data: {
      userId,
      type: "oauth",
      provider: "google",
      providerAccountId: payload.sub,
      id_token: idToken,
      token_type: "Bearer",
      scope: "openid email profile",
    },
  });
}

/**
 * Authorize a Google One Tap / GIS ID token into a NextAuth credentials session.
 */
export async function authorizeGoogleOneTap(idToken: string) {
  const payload = await verifyGoogleIdToken(idToken);
  if (!payload?.email_verified) return null;

  const linked = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: "google",
        providerAccountId: payload.sub,
      },
    },
    include: {
      user: {
        select: { id: true, email: true, name: true, image: true },
      },
    },
  });

  if (linked?.user) {
    return {
      id: linked.user.id,
      email: linked.user.email,
      name: linked.user.name,
      image: linked.user.image,
      remember: true,
    };
  }

  let user = await prisma.user.findUnique({
    where: { email: payload.email },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      emailVerified: true,
    },
  });

  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    user = await prisma.user.create({
      data: {
        email: payload.email,
        name: payload.name ?? null,
        image: payload.picture ?? null,
        emailVerified: new Date(),
        status: USER_STATUS.ACTIVE,
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        emailVerified: true,
      },
    });
    await provisionNewGoogleUser(user.id, user.email, user.name);
  } else if (!user.emailVerified) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        name: user.name ?? payload.name ?? null,
        image: user.image ?? payload.picture ?? null,
        status: USER_STATUS.ACTIVE,
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        emailVerified: true,
      },
    });
  }

  await ensureGoogleAccountLink(user.id, payload, idToken);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    remember: true,
    isNewUser,
  };
}
