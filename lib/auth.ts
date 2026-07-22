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

import { assignFounderNumber, isFounderSlotsFull } from "@/lib/founder";
import { normalizeEmail } from "@/lib/password-reset";
import { parseOAuthSignupCookies } from "@/lib/auth/oauth-signup";

import { ensureBootstrapAdminRole } from "@/lib/admin/roles";

import {

  clearLoginLockout,

  getLockoutRemainingMinutes,

  getSecurityUser,

  isAccountLocked,

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



export const authProviders = {

  google: googleConfigured,

  email: emailConfigured,

};



const SESSION_MAX_AGE_REMEMBER = 60 * 60 * 24 * 30;

const SESSION_MAX_AGE_DEFAULT = 60 * 60 * 24;



export const authOptions: NextAuthOptions = {

  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],

  providers,

  pages: {

    signIn: "/login",

    verifyRequest: "/login?verify=true",

    error: "/login",

    newUser: "/welcome",

  },

  session: {

    strategy: "jwt",

    maxAge: SESSION_MAX_AGE_REMEMBER,

  },

  callbacks: {

    async signIn({ user, account }) {

      if (account?.provider === "google" && user?.email) {

        const existing = await prisma.user.findUnique({

          where: { email: normalizeEmail(user.email) },

          select: { id: true },

        });

        if (!existing && (await isFounderSlotsFull())) {

          return "/signup?error=founder_full";

        }

      }

      return true;

    },

    async jwt({ token, user }) {

      if (user?.id) {

        token.id = user.id;

        if (user.name) token.name = user.name;

        const remember = (user as { remember?: boolean }).remember !== false;

        token.remember = remember;

        token.exp =

          Math.floor(Date.now() / 1000) +

          (remember ? SESSION_MAX_AGE_REMEMBER : SESSION_MAX_AGE_DEFAULT);

      } else if (token.email && !token.id) {

        const dbUser = await prisma.user.findUnique({

          where: { email: token.email },

          select: { id: true },

        });

        if (dbUser) token.id = dbUser.id;

      }

      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { status: true, founderNumber: true, name: true, role: true, email: true },
        });
        if (dbUser) {
          const role = await ensureBootstrapAdminRole(token.id as string, dbUser.email, dbUser.role);
          token.status = dbUser.status;
          token.founderNumber = dbUser.founderNumber;
          token.role = role;
          if (dbUser.name) token.name = dbUser.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.status = token.status as string | undefined;
        session.user.founderNumber = token.founderNumber as number | null | undefined;
        session.user.role = token.role as string | undefined;
        if (token.name) session.user.name = token.name as string;
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

      if (await isFounderSlotsFull()) return;

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
