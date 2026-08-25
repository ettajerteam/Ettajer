import { NextAuthOptions } from "next-auth";

import { PrismaAdapter } from "@auth/prisma-adapter";

import GoogleProvider from "next-auth/providers/google";

import EmailProvider from "next-auth/providers/email";

import CredentialsProvider from "next-auth/providers/credentials";

import { headers } from "next/headers";

import { prisma } from "@/lib/db";

import { isResendConfigured, getEmailFrom } from "@/lib/resend";

import { sendMagicLinkEmail } from "@/lib/email";

import { sendWelcomeEmail, sendFounderWelcomeEmail } from "@/lib/email/automations";
import { getEmailLocaleFromCookieHeader } from "@/lib/email/email-locale";

import { assignFounderNumber, isFounderSlotsFull, USER_STATUS } from "@/lib/founder";
import { normalizeEmail } from "@/lib/password-reset";
import { parseOAuthSignupCookies } from "@/lib/auth/oauth-signup";

import { ensureBootstrapAdminRole } from "@/lib/admin/roles";
import { authorizeGoogleOneTap } from "@/lib/auth/google-one-tap-authorize";
import { loadUserPlan } from "@/lib/account-profile";

import {

  clearLoginLockout,

  getLockoutRemainingMinutes,

  getSecurityUser,

  isAccountLocked,

  isLoginIpRateLimited,

  recordAuthEvent,

  recordFailedLogin,

  recordSuccessfulLogin,

  AUTH_SECURITY,

} from "@/lib/auth-security";

import bcrypt from "bcryptjs";



const googleConfigured =

  !!process.env.GOOGLE_CLIENT_ID?.trim() &&

  !!process.env.GOOGLE_CLIENT_SECRET?.trim();



const emailConfigured = isResendConfigured();



const providers: NextAuthOptions["providers"] = [];



if (googleConfigured) {

  providers.push(

    GoogleProvider({

      clientId: process.env.GOOGLE_CLIENT_ID!,

      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,

    })

  );

}



if (emailConfigured) {

  providers.push(

    EmailProvider({

      from: getEmailFrom(),

      sendVerificationRequest: async ({ identifier: email, url }) => {

        const headerList = await headers();
        const locale = getEmailLocaleFromCookieHeader(headerList.get("cookie"));
        const sent = await sendMagicLinkEmail(email, url, locale);

        if (!sent) {

          throw new Error("Failed to send verification email");

        }

      },

    })

  );

}



async function getRequestMeta() {

  const headerList = await headers();

  const forwarded = headerList.get("x-forwarded-for");

  const ipAddress = forwarded

    ? forwarded.split(",")[0]?.trim() || "unknown"

    : headerList.get("x-real-ip") ?? "unknown";

  const userAgent = headerList.get("user-agent");



  return { ipAddress, userAgent };

}



providers.push(

  CredentialsProvider({

    name: "Credentials",

    credentials: {

      email: { label: "Email", type: "email" },

      password: { label: "Password", type: "password" },

      remember: { label: "Remember me", type: "text" },

    },

    authorize: async (credentials) => {

      const email = credentials?.email?.trim().toLowerCase();

      const password = credentials?.password ?? "";

      const remember = credentials?.remember === "true";



      if (!email || !password) return null;



      const { ipAddress, userAgent } = await getRequestMeta();

      if (await isLoginIpRateLimited(ipAddress)) {
        await recordAuthEvent({
          email: email || "unknown",
          action: "login",
          success: false,
          reason: "rate_limited",
          ipAddress,
          userAgent,
        });
        throw new Error("RATE_LIMITED");
      }

      const user = await getSecurityUser(email);



      if (!user) {

        await recordAuthEvent({

          email,

          action: "login",

          success: false,

          reason: "account_not_found",

          ipAddress,

          userAgent,

        });

        throw new Error("ACCOUNT_NOT_FOUND");

      }



      if (isAccountLocked(user)) {

        await recordAuthEvent({

          email,

          action: "login",

          success: false,

          reason: "account_locked",

          ipAddress,

          userAgent,

          userId: user.id,

        });

        throw new Error(

          `ACCOUNT_LOCKED:${getLockoutRemainingMinutes(user)}`,

        );

      }



      if (!user.passwordHash) {

        await recordAuthEvent({

          email,

          action: "login",

          success: false,

          reason: "no_password",

          ipAddress,

          userAgent,

          userId: user.id,

        });

        throw new Error("NO_PASSWORD_ACCOUNT");

      }



      const account = await prisma.user.findUnique({

        where: { id: user.id },

        select: { emailVerified: true },

      });



      if (!account?.emailVerified) {

        await recordAuthEvent({

          email,

          action: "login",

          success: false,

          reason: "email_not_verified",

          ipAddress,

          userAgent,

          userId: user.id,

        });

        throw new Error("EMAIL_NOT_VERIFIED");

      }



      const ok = await bcrypt.compare(password, user.passwordHash);

      if (!ok) {

        const attemptsAfter = user.failedLoginAttempts + 1;
        const remaining =
          AUTH_SECURITY.maxFailedLoginAttempts - attemptsAfter;

        await recordFailedLogin(email);

        await recordAuthEvent({

          email,

          action: "login",

          success: false,

          reason: "invalid_password",

          ipAddress,

          userAgent,

          userId: user.id,

        });

        if (remaining <= 0) {

          const refreshed = await getSecurityUser(email);

          throw new Error(

            `ACCOUNT_LOCKED:${getLockoutRemainingMinutes(refreshed ?? user)}`,

          );

        }

        throw new Error(`INVALID_PASSWORD:${remaining}`);

      }



      await clearLoginLockout(email);

      await recordSuccessfulLogin(email, ipAddress);

      await recordAuthEvent({

        email,

        action: "login",

        success: true,

        reason: "success",

        ipAddress,

        userAgent,

        userId: user.id,

      });



      return {

        id: user.id,

        email: user.email,

        name: (

          await prisma.user.findUnique({

            where: { id: user.id },

            select: { name: true },

          })

        )?.name,

        remember,

      };

    },

  }),

);

if (googleConfigured) {
  providers.push(
    CredentialsProvider({
      id: "google-one-tap",
      name: "Google One Tap",
      credentials: {
        credential: { label: "Google ID Token", type: "text" },
      },
      authorize: async (credentials) => {
        const credential = credentials?.credential?.trim();
        if (!credential) return null;
        try {
          return await authorizeGoogleOneTap(credential);
        } catch (err) {
          console.error("Google One Tap authorize failed:", err);
          return null;
        }
      },
    }),
  );
}



export const authProviders = {

  google: googleConfigured,

  email: emailConfigured,

};



/** Stay signed in until explicit logout: rolling 90-day session (cookie + JWT). */
const SESSION_MAX_AGE = 60 * 60 * 24 * 90;

const useSecureCookies = (process.env.NEXTAUTH_URL ?? "").startsWith("https://");

const sessionCookieName = useSecureCookies
  ? "__Secure-next-auth.session-token"
  : "next-auth.session-token";

export const authOptions: NextAuthOptions = {

  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],

  providers,

  /** Link Google sign-in to an existing email/password account (same email). */
  allowDangerousEmailAccountLinking: true,

  pages: {

    signIn: "/login",

    verifyRequest: "/login?verify=true",

    error: "/login",

    newUser: "/auth/continue",

  },

  session: {

    strategy: "jwt",

    maxAge: SESSION_MAX_AGE,

    /** Re-issue cookie/JWT regularly so the session stays fresh while active. */
    updateAge: 60 * 60,

  },

  cookies: {
    sessionToken: {
      name: sessionCookieName,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        maxAge: SESSION_MAX_AGE,
      },
    },
  },

  callbacks: {

    async signIn({ user, account }) {
      // Google already verified the email — mirror One Tap so users aren't
      // sent to /activate and aren't counted as "unverified" in admin.
      if (account?.provider === "google") {
        if (user?.id) {
          await prisma.user.updateMany({
            where: { id: user.id, emailVerified: null },
            data: { emailVerified: new Date() },
          });
        } else if (user?.email) {
          await prisma.user.updateMany({
            where: {
              email: normalizeEmail(user.email),
              emailVerified: null,
            },
            data: { emailVerified: new Date() },
          });
        }
      }

      return true;
    },

    async jwt({ token, user }) {
      const now = Math.floor(Date.now() / 1000);

      if (user?.id) {

        token.id = user.id;

        if (user.name) token.name = user.name;

        // Always persist until explicit sign-out (ignore short-lived remember=false).
        token.remember = true;

        token.sessionEndsAt = now + SESSION_MAX_AGE;
        token.exp = token.sessionEndsAt;

      } else if (token.email && !token.id) {

        const dbUser = await prisma.user.findUnique({

          where: { email: token.email },

          select: { id: true },

        });

        if (dbUser) token.id = dbUser.id;

      }

      // Drop only after absolute inactivity window (never force-logout while rolling).
      if (
        typeof token.sessionEndsAt === "number" &&
        now >= token.sessionEndsAt
      ) {
        return { ...token, exp: now - 1 };
      }

      // Rolling window — stays signed in across browser restarts until Log out.
      if (token.id) {
        token.remember = true;
        token.sessionEndsAt = now + SESSION_MAX_AGE;
        token.exp = token.sessionEndsAt;
      }

      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            status: true,
            founderNumber: true,
            name: true,
            image: true,
            role: true,
            email: true,
          },
        });
        if (dbUser) {
          let status = dbUser.status;
          if (status !== USER_STATUS.ACTIVE) {
            await prisma.user
              .update({
                where: { id: token.id as string },
                data: { status: USER_STATUS.ACTIVE },
              })
              .catch(() => null);
            status = USER_STATUS.ACTIVE;
          }
          const role = await ensureBootstrapAdminRole(token.id as string, dbUser.email, dbUser.role);
          token.status = status;
          token.founderNumber = dbUser.founderNumber;
          token.plan = await loadUserPlan(token.id as string);
          token.role = role;
          if (dbUser.name) token.name = dbUser.name;
          if (dbUser.image !== undefined) token.picture = dbUser.image;
          if (dbUser.email) token.email = dbUser.email;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.status = token.status as string | undefined;
        session.user.founderNumber = token.founderNumber as number | null | undefined;
        session.user.plan = token.plan as string | null | undefined;
        session.user.role = token.role as string | undefined;
        if (token.name) session.user.name = token.name as string;
        if (token.email) session.user.email = token.email as string;
        if (token.picture !== undefined) session.user.image = token.picture as string | null;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;

      const headerList = await headers();
      const locale = getEmailLocaleFromCookieHeader(headerList.get("cookie"));
      const oauthPrefs = parseOAuthSignupCookies(headerList.get("cookie"));

      if (oauthPrefs.termsAccepted || oauthPrefs.marketingEmails) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            termsAcceptedAt: oauthPrefs.termsAccepted ? new Date() : undefined,
            marketingEmails: oauthPrefs.marketingEmails,
          },
        });
      }

      if (await isFounderSlotsFull()) {
        // Cards sold out — regular welcome only (no founder card/PDF).
        return;
      }

      const founderNumber = await assignFounderNumber(user.id);

      if (founderNumber && user.email && isResendConfigured()) {
        await sendFounderWelcomeEmail(
          user.email,
          user.name ?? "Founder",
          founderNumber,
          locale,
        ).catch((err) => console.error("Founder welcome email failed:", err));
      }
    },
    async signIn({ user, isNewUser }) {
      if (isNewUser && user.email) {
        console.log(`New user signed up: ${user.email}`);

        const dbUser = user.id
          ? await prisma.user.findUnique({
              where: { id: user.id },
              select: { founderNumber: true },
            })
          : null;

        if (dbUser?.founderNumber) return;

        if (isResendConfigured()) {
          const headerList = await headers();
          const locale = getEmailLocaleFromCookieHeader(headerList.get("cookie"));

          await sendWelcomeEmail(user.email, user.name, locale).catch((err) =>
            console.error("Welcome email failed:", err),
          );
        }
      }
    },
  },
};
