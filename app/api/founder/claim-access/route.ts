import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { USER_STATUS } from "@/lib/founder/constants";
import { sendFounderAccessUnlockedEmail } from "@/lib/email/automations";
import { getEmailLocaleFromCookieHeader } from "@/lib/email/email-locale";
import { headers } from "next/headers";

/**
 * Activate the signed-in account and send them to dashboard or onboarding.
 * No waiting / no launch gate — anyone verified can enter.
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        founderNumber: true,
        emailVerified: true,
        stores: { select: { id: true }, take: 1 },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Account not found." }, { status: 404 });
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        {
          message: "Verify your email before opening your store.",
          redirect: `/activate?email=${encodeURIComponent(user.email)}`,
        },
        { status: 403 },
      );
    }

    const redirect = user.stores.length > 0 ? "/dashboard" : "/onboarding";

    if (user.status !== USER_STATUS.ACTIVE) {
      await prisma.user.update({
        where: { id: user.id },
        data: { status: USER_STATUS.ACTIVE },
      });

      if (user.founderNumber) {
        const headerList = await headers();
        const locale = getEmailLocaleFromCookieHeader(headerList.get("cookie"));
        void sendFounderAccessUnlockedEmail(
          user.email,
          user.name ?? session.user.name ?? null,
          user.founderNumber,
          locale,
        ).catch((err) => console.error("[claim-access] unlock email failed:", err));
      }
    }

    return NextResponse.json({ success: true, redirect });
  } catch (error) {
    console.error("[claim-access]", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
